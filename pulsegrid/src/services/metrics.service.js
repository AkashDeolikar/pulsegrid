const { redisClient } = require('../config/redis');

const METRICS_TTL = 60 * 60 * 24; // 24 hours

/**
 * Called after every successful event publish.
 * Writes 4 metrics atomically — all expire in 24h.
 */
const recordEvent = async (eventId, topic, priority, deliveryMs) => {
  const now = Date.now();
  const minuteBucket = Math.floor(now / 60000); // current minute as integer

  const pipeline = redisClient.pipeline();

  // 1. Throughput: increment events in this minute bucket
  pipeline.incr(`metrics:throughput:${minuteBucket}`);
  pipeline.expire(`metrics:throughput:${minuteBucket}`, METRICS_TTL);

  // 2. Per-topic counter
  pipeline.incr(`metrics:topic:${topic}`);
  pipeline.expire(`metrics:topic:${topic}`, METRICS_TTL);

  // 3. Per-priority counter
  pipeline.incr(`metrics:priority:${priority}`);
  pipeline.expire(`metrics:priority:${priority}`, METRICS_TTL);

  // 4. Latency: store delivery time in sorted set (score = timestamp)
  if (deliveryMs !== undefined) {
    pipeline.zadd('metrics:latency', now, `${eventId}:${deliveryMs}`);
    pipeline.zremrangebyscore('metrics:latency', 0, now - METRICS_TTL * 1000);
  }

  await pipeline.exec();
};

/**
 * Get events/min for the last N minutes.
 * Returns array of { minute, count } for time-series chart.
 */
const getThroughput = async (minutes = 60) => {
  const now = Date.now();
  const currentBucket = Math.floor(now / 60000);
  const pipeline = redisClient.pipeline();

  for (let i = minutes - 1; i >= 0; i--) {
    pipeline.get(`metrics:throughput:${currentBucket - i}`);
  }

  const results = await pipeline.exec();

  return results.map(([err, val], idx) => ({
    minute: new Date((currentBucket - (minutes - 1 - idx)) * 60000).toISOString(),
    count: parseInt(val) || 0,
  }));
};

/**
 * Calculate P50, P95, P99 delivery latency from Redis sorted set.
 */
const getLatencyPercentiles = async () => {
  const entries = await redisClient.zrange('metrics:latency', 0, -1);

  if (entries.length === 0) {
    return { p50: 0, p95: 0, p99: 0, samples: 0 };
  }

  const latencies = entries
    .map(e => parseInt(e.split(':')[1]))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  const percentile = (arr, p) => arr[Math.floor((p / 100) * arr.length)] || 0;

  return {
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    samples: latencies.length,
  };
};

/**
 * Get per-topic event counts.
 */
const getTopicBreakdown = async () => {
  const keys = await redisClient.keys('metrics:topic:*');
  if (keys.length === 0) return [];

  const pipeline = redisClient.pipeline();
  keys.forEach(k => pipeline.get(k));
  const results = await pipeline.exec();

  return keys.map((key, i) => ({
    topic: key.replace('metrics:topic:', ''),
    count: parseInt(results[i][1]) || 0,
  })).sort((a, b) => b.count - a.count);
};

/**
 * Get per-priority event counts.
 */
const getPriorityBreakdown = async () => {
  const priorities = ['urgent', 'normal', 'low'];
  const pipeline = redisClient.pipeline();
  priorities.forEach(p => pipeline.get(`metrics:priority:${p}`));
  const results = await pipeline.exec();

  return priorities.map((p, i) => ({
    priority: p,
    count: parseInt(results[i][1]) || 0,
  }));
};

module.exports = {
  recordEvent,
  getThroughput,
  getLatencyPercentiles,
  getTopicBreakdown,
  getPriorityBreakdown,
};