const http    = require('http');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const config  = require('./config');
const db      = require('./db');
const { initWebSocketServer } = require('./services/websocket.server');

// ── Routes ────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const eventRoutes        = require('./routes/event.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const analyticsRoutes    = require('./routes/analytics.routes');

// ── Queue manager (starts workers on import) ──────────────────────
const { getQueueStats }     = require('./services/queue.manager');
const { getTotalConnections } = require('./services/connection.manager');

// ── Rate limiters ─────────────────────────────────────────────────
const { apiLimiter, authLimiter, publishLimiter } = require('./middleware/rate.limiter');

const app        = express();
const httpServer = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────────
// Allowed origins: local dev + production Vercel + any Railway preview URL
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Production — update these after deploying to Vercel
  process.env.FRONTEND_URL,              // set in Railway: FRONTEND_URL=https://your-app.vercel.app
  process.env.FRONTEND_URL_PREVIEW,      // optional second URL for preview deployments
].filter(Boolean); // remove undefined entries

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (
      ALLOWED_ORIGINS.includes(origin) ||
      // Allow all Vercel preview deployments for this project
      /^https:\/\/pulsegrid.*\.vercel\.app$/.test(origin) ||
      // Allow Railway preview deployments
      /^https:\/\/.*\.up\.railway\.app$/.test(origin) ||
      // Allow localhost on any port (development)
      /^http:\/\/localhost:\d+$/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials:         true,
  methods:             ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:      ['Content-Type', 'Authorization'],
  exposedHeaders:      ['X-Total-Count'],
  optionsSuccessStatus: 200, // fix for IE11
};

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images/assets cross-origin
}));
app.use(cors(corsOptions));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiters ─────────────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/events/publish', publishLimiter);

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics',     analyticsRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    const queueStats = await getQueueStats();

    res.json({
      status:            'ok',
      timestamp:         new Date().toISOString(),
      environment:       config.nodeEnv,
      database:          'connected',
      activeConnections: getTotalConnections(),
      queues:            queueStats,
      version:           process.env.npm_package_version || '1.0.0',
    });
  } catch (err) {
    console.error('[Health] check failed:', err);
    res.status(503).json({
      status:    'error',
      timestamp: new Date().toISOString(),
      database:  'disconnected',
      error:     err.message,
    });
  }
});

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  // CORS error
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({
    error:   'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// ── WebSocket server ──────────────────────────────────────────────
initWebSocketServer(httpServer);

// ── Start ─────────────────────────────────────────────────────────
httpServer.listen(config.port, () => {
  console.log(`
  ⚡ PulseGrid running
     Port:        ${config.port}
     Environment: ${config.nodeEnv}
     WebSocket:   ws://localhost:${config.port}
     Health:      http://localhost:${config.port}/health
  `);
});

module.exports = { app, httpServer }; // export for tests

// require('./services/queue.manager');
// const http = require('http');
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const config = require('./config');
// const db = require('./db');
// const { initWebSocketServer } = require('./services/websocket.server');

// const authRoutes = require('./routes/auth.routes');
// const eventRoutes = require('./routes/event.routes');

// const app = express();
// const httpServer = http.createServer(app);

// // this route for queue monitoring
// const { getQueueStats } = require('./services/queue.manager');

// const subscriptionRoutes = require('./routes/subscription.routes');

// const analyticsRoutes = require('./routes/analytics.routes');

// const { apiLimiter, authLimiter, publishLimiter } = require('./middleware/rate.limiter');

// const { initRedis } = require('./config/redis');

// (async () => {
//   await initRedis();

//   app.use(helmet());
//   app.use(cors());
//   app.use(morgan('dev'));
//   app.use(express.json());

//   app.use('/api/auth', authRoutes);
//   app.use('/api/events', eventRoutes);
//   app.use('/api/subscriptions', subscriptionRoutes);
//   app.use('/api/analytics', analyticsRoutes);
//   app.use('/api/', apiLimiter);
//   app.use('/api/auth/', authLimiter);
//   app.use('/api/events/publish', publishLimiter);

//   app.get('/health', async (req, res) => {
//     try {
//       await db.query('SELECT 1');
//       const { getTotalConnections } = require('./services/connection.manager');
//       const queueStats = await getQueueStats();
//       res.json({
//         status: 'ok',
//         timestamp: new Date().toISOString(),
//         database: 'connected',
//         activeConnections: getTotalConnections(),
//         queues: queueStats,
//       });
//     } catch (err) {
//       res.status(503).json({ status: 'error' });
//     }
//   });

//   app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   });

//   initWebSocketServer(httpServer);

//   httpServer.listen(config.port, () => {
//     console.log(`PulseGrid running on port ${config.port}`);
//     console.log(`WebSocket server ready at ws://localhost:${config.port}`);
//   });
// })();