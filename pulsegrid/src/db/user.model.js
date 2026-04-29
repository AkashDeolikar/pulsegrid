const db = require('./index');

const createUser = async ({ email, username, passwordHash }) => {
  const result = await db.query(
    `INSERT INTO users (email, username, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, created_at`,
    [email, username, passwordHash]
  );
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await db.query(
    `SELECT id, email, username, password_hash, created_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT id, email, username, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { createUser, findByEmail, findById };