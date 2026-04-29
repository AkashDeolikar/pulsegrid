const { redisClient } = require('../config/redis');

// userId -> Set of WebSocket connections (user can have multiple tabs)
const connections = new Map();

const addConnection = async (userId, ws) => {
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(ws);

  // Mark user as online in Redis (expires in 30s, renewed on heartbeat)
  await redisClient.setex(`presence:${userId}`, 30, 'online');
  console.log(`[CM] User ${userId} connected. Total connections: ${getTotalConnections()}`);
};

const removeConnection = async (userId, ws) => {
  const userConns = connections.get(userId);
  if (userConns) {
    userConns.delete(ws);
    if (userConns.size === 0) {
      connections.delete(userId);
      await redisClient.del(`presence:${userId}`);
      console.log(`[CM] User ${userId} fully disconnected`);
    }
  }
};

const sendToUser = (userId, message) => {
  const userConns = connections.get(userId);
  if (!userConns) return false;

  const payload = JSON.stringify(message);
  let delivered = false;

  userConns.forEach((ws) => {
    if (ws.readyState === 1) { // 1 = OPEN
      ws.send(payload);
      delivered = true;
    }
  });

  return delivered;
};

const isOnline = (userId) => connections.has(userId);

const getTotalConnections = () => {
  let total = 0;
  connections.forEach((conns) => (total += conns.size));
  return total;
};

const getOnlineUserIds = () => Array.from(connections.keys());

module.exports = {
  addConnection,
  removeConnection,
  sendToUser,
  isOnline,
  getTotalConnections,
  getOnlineUserIds,
};