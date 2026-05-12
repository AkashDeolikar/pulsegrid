require('dotenv').config();

/**
 * Central config module.
 * All environment variables flow through here — never read process.env directly
 * in other files. This makes config changes a single-file operation.
 *
 * Railway environment variables to set:
 *   NODE_ENV=production
 *   PORT=3000
 *   JWT_SECRET=<long random string>
 *   JWT_EXPIRES_IN=7d
 *   FRONTEND_URL=https://your-app.vercel.app
 *   DATABASE_URL=<auto-injected by Railway PostgreSQL service>
 *   REDIS_URL=<auto-injected by Railway Redis service>
 */
module.exports = {
  port:    parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV       || 'development',

  // Frontend origin — used by CORS in index.js
  frontendUrl:        process.env.FRONTEND_URL         || 'http://localhost:3001',
  frontendUrlPreview: process.env.FRONTEND_URL_PREVIEW || null,

  // PostgreSQL — used only when DATABASE_URL is NOT set (local dev)
  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'pulsegrid',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // Redis — used only when REDIS_URL is NOT set (local dev)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },

  // JWT
  jwt: {
    secret:    process.env.JWT_SECRET     || 'dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

// require('dotenv').config();

// module.exports = {
//   port: process.env.PORT || 3000,
//   nodeEnv: process.env.NODE_ENV || 'development',

//   db: {
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT, 10) || 5432,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//   },

//   redis: {
//     host: process.env.REDIS_HOST || '127.0.0.1',
//     port: parseInt(process.env.REDIS_PORT, 10) || 6379,
//   },

//   jwt: {
//     secret: process.env.JWT_SECRET,
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   },
// };

//=================================

// require('dotenv').config();

// module.exports = {
//   port: process.env.PORT || 3000,
//   nodeEnv: process.env.NODE_ENV || 'development',
//   db: {
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT),
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//   },
//   redis: {
//     host: process.env.REDIS_HOST,
//     port: parseInt(process.env.REDIS_PORT),
//   },
//   jwt: {
//     secret: process.env.JWT_SECRET,
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   },
// };