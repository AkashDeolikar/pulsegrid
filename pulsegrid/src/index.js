require('./services/queue.manager');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const db = require('./db');
const { initWebSocketServer } = require('./services/websocket.server');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');

const app = express();
const httpServer = http.createServer(app);

// this route for queue monitoring
const { getQueueStats } = require('./services/queue.manager');

const subscriptionRoutes = require('./routes/subscription.routes');

const analyticsRoutes = require('./routes/analytics.routes');

const { apiLimiter, authLimiter, publishLimiter } = require('./middleware/rate.limiter');

const { initRedis } = require('./config/redis');
initRedis();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/events/publish', publishLimiter);

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    const { getTotalConnections } = require('./services/connection.manager');
    const queueStats = await getQueueStats();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      activeConnections: getTotalConnections(),
      queues: queueStats,
    });
  } catch (err) {
    res.status(503).json({ status: 'error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

initWebSocketServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`PulseGrid running on port ${config.port}`);
  console.log(`WebSocket server ready at ws://localhost:${config.port}`);
});