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

let pool;

const createPool = () => {
  const newPool = new Pool(poolConfig);

  newPool.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[DB] PostgreSQL connected');
    }
  });

  newPool.on('error', (err) => {
    console.error('[DB] PostgreSQL pool error:', err);
    // Don't exit — let the pool recover on next query
  });

  return newPool;
};

const getPool = () => {
  if (!pool || pool.ended) {
    pool = createPool();
  }
  return pool;
};

const close = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

module.exports = {
  query:     (text, params) => getPool().query(text, params),
  getClient: ()             => getPool().connect(),
  close,
  get pool() {
    return getPool();
  },
};