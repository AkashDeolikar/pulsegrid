const db = require('./index');

// Save an event to a user's offline queue
const enqueueOfflineEvent = async (userId, eventId) => {
  // ON CONFLICT DO NOTHING = idempotent — safe to call multiple times
  await db.query(
    `INSERT INTO offline_queue (user_id, event_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, eventId]
  );
};

// Fetch all queued events for a user in chronological order
const getOfflineEvents = async (userId) => {
  const result = await db.query(
    `SELECT
       oq.id        AS queue_id,
       e.id         AS event_id,
       e.topic,
       e.payload,
       e.priority,
       e.created_at AS timestamp
     FROM offline_queue oq
     JOIN events e ON e.id = oq.event_id
     WHERE oq.user_id = $1
     ORDER BY oq.created_at ASC`,
    [userId]
  );
  return result.rows;
};

// Clear delivered offline events for a user
const clearOfflineEvents = async (userId) => {
  const result = await db.query(
    `DELETE FROM offline_queue WHERE user_id = $1 RETURNING id`,
    [userId]
  );
  return result.rowCount;
};

// Count pending offline events for a user
const countOfflineEvents = async (userId) => {
  const result = await db.query(
    `SELECT COUNT(*) AS count FROM offline_queue WHERE user_id = $1`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

module.exports = {
  enqueueOfflineEvent,
  getOfflineEvents,
  clearOfflineEvents,
  countOfflineEvents,
};