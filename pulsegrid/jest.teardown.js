/**
 * Global test teardown — runs ONCE after all test suites complete.
 * This ensures long-lived resources are properly closed before Jest exits.
 */
module.exports = async () => {
  console.log('[GlobalTeardown] Starting cleanup...');
  
  if (process.env.NODE_ENV !== 'test') {
    console.log('[GlobalTeardown] NODE_ENV not set to test, skipping cleanup');
    return;
  }

  const promises = [];

  try {
    console.log('[GlobalTeardown] Attempting to close database...');
    const db = require('./src/db');
    if (typeof db.close === 'function') {
      const dbPromise = db.close().then(() => {
        console.log('[GlobalTeardown] Database closed successfully');
      }).catch(err => {
        console.error('[GlobalTeardown] DB close error:', err.message);
      });
      promises.push(dbPromise);
    } else {
      console.log('[GlobalTeardown] DB close method not found');
    }
  } catch (err) {
    console.error('[GlobalTeardown] Failed to load db module:', err.message);
  }

  try {
    console.log('[GlobalTeardown] Attempting to close Redis...');
    const redis = require('./src/config/redis');
    if (typeof redis.closeRedis === 'function') {
      const redisPromise = redis.closeRedis().then(() => {
        console.log('[GlobalTeardown] Redis closed successfully');
      }).catch(err => {
        console.error('[GlobalTeardown] Redis close error:', err.message);
      });
      promises.push(redisPromise);
    } else {
      console.log('[GlobalTeardown] Redis closeRedis method not found');
    }
  } catch (err) {
    console.error('[GlobalTeardown] Failed to load redis module:', err.message);
  }

  try {
    console.log('[GlobalTeardown] Attempting to close queue manager...');
    const queueManager = require('./src/services/queue.manager');
    if (typeof queueManager.close === 'function') {
      const queuePromise = queueManager.close().then(() => {
        console.log('[GlobalTeardown] Queue manager closed successfully');
      }).catch(err => {
        console.error('[GlobalTeardown] Queue close error:', err.message);
      });
      promises.push(queuePromise);
    } else {
      console.log('[GlobalTeardown] Queue close method not found');
    }
  } catch (err) {
    console.error('[GlobalTeardown] Failed to load queue module:', err.message);
  }

  try {
    console.log('[GlobalTeardown] Attempting to close WebSocket server...');
    const ws = require('./src/services/websocket.server');
    if (typeof ws.closeWebSocketServer === 'function') {
      const wsPromise = ws.closeWebSocketServer().then(() => {
        console.log('[GlobalTeardown] WebSocket server closed successfully');
      }).catch(err => {
        console.error('[GlobalTeardown] WebSocket close error:', err.message);
      });
      promises.push(wsPromise);
    } else {
      console.log('[GlobalTeardown] WebSocket closeWebSocketServer method not found');
    }
  } catch (err) {
    console.error('[GlobalTeardown] Failed to load ws module:', err.message);
  }

  console.log(`[GlobalTeardown] Waiting for ${promises.length} cleanup promises...`);
  await Promise.allSettled(promises);
  
  // Give a small delay for any pending operations
  console.log('[GlobalTeardown] Waiting 500ms for pending operations...');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('[GlobalTeardown] Cleanup complete! Forcing process exit...');
  process.exit(0);
};
