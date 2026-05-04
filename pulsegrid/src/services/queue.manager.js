const { handleOfflineUsers } = require('./offline.sync.service');
const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const db = require('../db');

const { recordEvent }  = require('./metrics.service');
const { checkAnomaly } = require('./anomaly.detector');

// Redis connection
const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
};

const QUEUES = {
    URGENT: 'events-urgent',
    NORMAL: 'events-normal',
    LOW: 'events-low',
};

// Create queues
const urgentQueue = new Queue(QUEUES.URGENT, { connection: redisConnection });
const normalQueue = new Queue(QUEUES.NORMAL, { connection: redisConnection });
const lowQueue = new Queue(QUEUES.LOW, { connection: redisConnection });

// Priority mapping
const PRIORITY_MAP = { urgent: 1, normal: 5, low: 10 };

// Add event to queue
const enqueueEvent = async (eventData, priority = 'normal') => {
    const { eventId, topic, payload, producerId, timestamp } = eventData;

    const jobData = {
        eventId,
        topic,
        payload,
        producerId,
        timestamp,
        priority,
    };

    const opts = {
        priority: PRIORITY_MAP[priority] || 5,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    };

    const jobName = `evt-${eventId}`;

    switch (priority) {
        case 'urgent':
            return urgentQueue.add(jobName, jobData, opts);
        case 'low':
            return lowQueue.add(jobName, jobData, opts);
        default:
            return normalQueue.add(jobName, jobData, opts);
    }
};

// Job processor
const processJob = async (job) => {
  const { eventId, topic, payload, priority, timestamp } = job.data;
  const startTime = Date.now();

  // 1. Publish to Redis → online subscribers
  await redis.publisher.publish(`event:${topic}`, JSON.stringify({
    eventId, topic, payload, priority, timestamp,
  }));

  // 2. Handle offline subscribers
  await handleOfflineUsers(eventId, topic);

  // 3. Calculate delivery latency
  const deliveryMs = Date.now() - startTime;

  // 4. Record metrics (non-blocking — don't await in critical path)
  recordEvent(eventId, topic, priority, deliveryMs).catch(err =>
    console.error('[Metrics] recordEvent failed:', err)
  );

  // 5. Check for anomalies (non-blocking)
  checkAnomaly(topic).catch(err =>
    console.error('[Anomaly] checkAnomaly failed:', err)
  );

  // 6. Mark delivered in DB
  await db.query(
    `UPDATE events SET status='delivered', delivered_at=NOW() WHERE id=$1`,
    [eventId]
  );

  return { delivered: true, eventId, deliveryMs };
};

// Workers
const urgentWorker = new Worker(QUEUES.URGENT, processJob, {
    connection: redisConnection,
    concurrency: 20,
});

const normalWorker = new Worker(QUEUES.NORMAL, processJob, {
    connection: redisConnection,
    concurrency: 10,
});

const lowWorker = new Worker(QUEUES.LOW, processJob, {
    connection: redisConnection,
    concurrency: 3,
});

// Worker events
[urgentWorker, normalWorker, lowWorker].forEach((worker) => {
    worker.on('completed', (job) => {
        console.log(`[Queue] Job ${job.id} completed (${job.data.priority})`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Queue] Job ${job?.id} failed:`, err.message);
    });
});

// Queue stats
const getQueueStats = async () => {
    const [uCounts, nCounts, lCounts] = await Promise.all([
        urgentQueue.getJobCounts(),
        normalQueue.getJobCounts(),
        lowQueue.getJobCounts(),
    ]);

    return {
        urgent: uCounts,
        normal: nCounts,
        low: lCounts,
    };
};

module.exports = {
    enqueueEvent,
    getQueueStats,
    urgentQueue,
    normalQueue,
    lowQueue,
};