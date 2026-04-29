const WebSocket = require('ws');
const { verifyToken } = require('./auth.service');
const { syncOnReconnect } = require('./offline.sync.service');
const { addConnection, removeConnection, sendToUser, getTotalConnections } = require('./connection.manager');
const { subscriber } = require('../config/redis');
const db = require('../db');

let wss = null;

const initWebSocketServer = (httpServer) => {
  wss = new WebSocket.Server({ server: httpServer });

  // Subscribe to ALL event topics via Redis pattern
  subscriber.psubscribe('event:*', (err) => {
    if (err) console.error('[WS] Redis psubscribe error:', err);
    else console.log('[WS] Subscribed to event:* pattern');
  });

  // When Redis delivers a message, find the right WS connection and push it
  subscriber.on('pmessage', async (pattern, channel, message) => {
    try {
      const data = JSON.parse(message);
      const topic = channel.replace('event:', '');

      // Find all subscribers for this topic
      const result = await db.query(
        'SELECT user_id FROM subscriptions WHERE topic = $1',
        [topic]
      );

      result.rows.forEach(({ user_id }) => {
        sendToUser(user_id, {
          type: 'EVENT',
          topic,
          payload: data.payload,
          priority: data.priority,
          eventId: data.eventId,
          timestamp: data.timestamp,
        });
      });
    } catch (err) {
      console.error('[WS] pmessage handler error:', err);
    }
  });

  wss.on('connection', async (ws, req) => {
    // Authenticate via token in query string: ws://localhost:3000?token=xxx
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'No token provided');
      return;
    }

    let user;
    try {
      user = verifyToken(token);
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    ws.userId = user.id;
    await addConnection(user.id, ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      userId: user.id,
      timestamp: new Date().toISOString(),
    }));

    // Trigger offline sync immediately after connect
    // Small delay lets the CONNECTED message reach client first
    setTimeout(() => syncOnReconnect(user.id), 100);

    // Heartbeat — client must send PING every 25s or connection closes
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch {
        ws.send(JSON.stringify({ type: 'ERROR', error: 'Invalid message format' }));
      }
    });

    ws.on('close', async () => {
      await removeConnection(user.id, ws);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Socket error for user ${user.id}:`, err);
    });
  });

  // Heartbeat interval — kill dead connections every 30s
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        removeConnection(ws.userId, ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(heartbeatInterval));

  console.log('[WS] WebSocket server initialized');
  return wss;
};

const getWss = () => wss;

module.exports = { initWebSocketServer, getWss };