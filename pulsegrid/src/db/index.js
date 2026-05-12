// const { Pool } = require('pg');
// const config = require('../config');

// const pool = new Pool(
//   process.env.DATABASE_URL
//     ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
//     : config.db
// );

// // pool.on('connect', () => {
// //   console.log('PostgreSQL connected');
// // });
// if (process.env.NODE_ENV !== 'test') {
//   pool.on('connect', () => {
//     console.log('PostgreSQL connected');
//   });
// }

// pool.on('error', (err) => {
//   console.error('PostgreSQL pool error:', err);
//   process.exit(-1);
// });

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   getClient: () => pool.connect(),

//   close: async () => {
//     await pool.end();
//   }
// };


const { Pool } = require('pg');
const config   = require('../config');

/**
 * PostgreSQL connection pool.
 *
 * Railway provides DATABASE_URL as a full connection string.
 * Local dev uses individual DB_HOST, DB_PORT, etc. from .env.
 *
 * SSL is required on Railway (rejectUnauthorized:false because
 * Railway uses self-signed certs on their managed Postgres).
 */
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max:             10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      ...config.db,
      max:             10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

const closePool = async () => {
  await pool.end();
};

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[DB] PostgreSQL connected');
  }
});

pool.on('error', (err) => {
  console.error('[DB] PostgreSQL pool error:', err);
  // Don't exit — let the pool recover on next query
});

module.exports = {
  query:     (text, params) => pool.query(text, params),
  getClient: ()             => pool.connect(),
  pool,
  closePool,
};