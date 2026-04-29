const db = require('../db');
const { classifyPriority } = require('./priority.classifier');
const { enqueueEvent } = require('./queue.manager');

const publishEvent = async ({ producerId, topic, payload, priority: manualPriority }) => {
  // Step 1: Classify priority (AI layer)
  const { priority, source, confidence } = classifyPriority(topic, payload, manualPriority);

  // Step 2: Persist to PostgreSQL (write-ahead)
  const result = await db.query(
    `INSERT INTO events (producer_id, topic, payload, priority, status)
     VALUES ($1, $2, $3, $4, 'queued')
     RETURNING id, created_at`,
    [producerId, topic, JSON.stringify(payload), priority]
  );
  const event = result.rows[0];

  // Step 3: Enqueue into the correct priority queue
  await enqueueEvent(
    { eventId: event.id, topic, payload, producerId, timestamp: event.created_at },
    priority
  );

  return {
    id: event.id,
    priority,
    classifierSource: source,
    confidence: Math.round(confidence * 100),
    createdAt: event.created_at,
  };
};

module.exports = { publishEvent };