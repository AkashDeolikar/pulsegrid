const db = require('./index');

/**
 * Get paginated events with optional filters.
 * Supports: topic, priority, status, page, limit
 */
const getEvents = async ({ topic, priority, status, page = 1, limit = 15 } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values     = [];
  let   idx        = 1;

  if (topic)    { conditions.push(`e.topic = $${idx++}`);    values.push(topic);    }
  if (priority) { conditions.push(`e.priority = $${idx++}`); values.push(priority); }
  if (status)   { conditions.push(`e.status = $${idx++}`);   values.push(status);   }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataRes, countRes] = await Promise.all([
    db.query(
      `SELECT
         e.id, e.topic, e.payload, e.priority, e.status,
         e.retry_count, e.created_at, e.delivered_at,
         e.producer_id
       FROM events e
       ${where}
       ORDER BY e.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    ),
    db.query(
      `SELECT COUNT(*) AS total FROM events e ${where}`,
      values
    ),
  ]);

  return {
    events: dataRes.rows,
    total:  parseInt(countRes.rows[0].total),
    page:   parseInt(page),
    limit:  parseInt(limit),
  };
};

/**
 * Get a single event by ID.
 */
const getEventById = async (id) => {
  const result = await db.query(
    `SELECT id, topic, payload, priority, status, retry_count, created_at, delivered_at, producer_id
     FROM events WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Reset a failed event back to 'queued' for retry.
 */
const resetEventForRetry = async (id) => {
  const result = await db.query(
    `UPDATE events
     SET status = 'queued', retry_count = 0, delivered_at = NULL
     WHERE id = $1 AND status = 'failed'
     RETURNING id, topic, payload, priority`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { getEvents, getEventById, resetEventForRetry };