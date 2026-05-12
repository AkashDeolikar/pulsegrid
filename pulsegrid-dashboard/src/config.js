/**
 * PulseGrid Dashboard — API config
 *
 * In development: points to localhost:3000
 * In production:  reads REACT_APP_API_URL from environment
 *
 * To set production URL before deploying to Vercel:
 *   Add to Vercel environment variables:
 *   REACT_APP_API_URL=https://your-railway-app.up.railway.app
 *   REACT_APP_WS_URL=wss://your-railway-app.up.railway.app
 */
const isProd = process.env.NODE_ENV === 'production';

const config = {
  API_BASE: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:3000/api',

  WS_BASE: process.env.REACT_APP_WS_URL
    ? process.env.REACT_APP_WS_URL
    : 'ws://localhost:3000',

  // Auto-refresh interval for analytics dashboard (ms)
  REFRESH_MS: isProd ? 15000 : 10000,

  // Whether we're in production (useful for feature flags)
  IS_PROD: isProd,
};

export default config;

// const config = {
//   API_BASE:  'http://localhost:3000/api',
//   WS_BASE:   'ws://localhost:3000',
//   REFRESH_MS: 10000, // auto-refresh every 10 seconds
// };

// export default config;


// /**
//  * PulseGrid Dashboard — API config
//  *
//  * In development: points to localhost:3000
//  * In production:  reads REACT_APP_API_URL from environment
//  *
//  * To set production URL before deploying to Vercel:
//  *   Add to Vercel environment variables:
//  *   REACT_APP_API_URL=https://your-railway-app.up.railway.app
//  *   REACT_APP_WS_URL=wss://your-railway-app.up.railway.app
//  */
// const isProd = process.env.NODE_ENV === 'production';

// const config = {
//   API_BASE: process.env.REACT_APP_API_URL
//     ? `${process.env.REACT_APP_API_URL}/api`
//     : 'http://localhost:3000/api',

//   WS_BASE: process.env.REACT_APP_WS_URL
//     ? process.env.REACT_APP_WS_URL
//     : 'ws://localhost:3000',

//   // Auto-refresh interval for analytics dashboard (ms)
//   REFRESH_MS: isProd ? 15000 : 10000,

//   // Whether we're in production (useful for feature flags)
//   IS_PROD: isProd,
// };

// export default config;

