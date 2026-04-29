const db = require('./index');

const subscribe = async (userId, topic) => {
  const result = await db.query(
    `INSERT INTO subscriptions (user_id, topic)
     VALUES ($1, $2)
     ON CONFLICT (user_id, topic) DO NOTHING
     RETURNING id, topic, created_at`,
    [userId, topic]
  );
  return result.rows[0] || null;
};

const unsubscribe = async (userId, topic) => {
  const result = await db.query(
    `DELETE FROM subscriptions WHERE user_id=$1 AND topic=$2 RETURNING id`,
    [userId, topic]
  );
  return result.rowCount > 0;
};

const getUserSubscriptions = async (userId) => {
  const result = await db.query(
    `SELECT topic, created_at FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = { subscribe, unsubscribe, getUserSubscriptions };