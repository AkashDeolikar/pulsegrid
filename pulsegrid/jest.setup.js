/**
 * Global test setup — registers cleanup hooks for long-lived resources.
 * This file runs before all tests and registers afterAll hooks that will
 * execute after the entire test suite completes.
 */

const cleanup = async () => {
  const promises = [];

  try {
    if (require.cache[require.resolve('./src/db')]) {
      const db = require('./src/db');
      if (typeof db.close === 'function') {
        promises.push(db.close().catch(err => console.error('[Cleanup] DB close error:', err)));
      }
    }
  } catch (err) {
    // ignore if db module was never loaded
  }

  try {
    if (require.cache[require.resolve('./src/config/redis')]) {
      const redis = require('./src/config/redis');
      if (typeof redis.closeRedis === 'function') {
        promises.push(redis.closeRedis().catch(err => console.error('[Cleanup] Redis close error:', err)));
      }
    }
  } catch (err) {
    // ignore if redis module was never loaded
  }

  try {
    if (require.cache[require.resolve('./src/services/queue.manager')]) {
      const queueManager = require('./src/services/queue.manager');
      if (typeof queueManager.close === 'function') {
        promises.push(queueManager.close().catch(err => console.error('[Cleanup] Queue close error:', err)));
      }
    }
  } catch (err) {
    // ignore if queue.manager module was never loaded
  }

  try {
    if (require.cache[require.resolve('./src/services/websocket.server')]) {
      const ws = require('./src/services/websocket.server');
      if (typeof ws.closeWebSocketServer === 'function') {
        promises.push(ws.closeWebSocketServer().catch(err => console.error('[Cleanup] WebSocket close error:', err)));
      }
    }
  } catch (err) {
    // ignore if websocket.server module was never loaded
  }

  await Promise.allSettled(promises);
};

// Register cleanup to run after all tests complete
afterAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await cleanup();
  }
});
