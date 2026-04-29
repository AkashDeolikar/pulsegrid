const Redis = require('ioredis');
const config = require('./index');

const createRedisClient = (name) => {
  const client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      console.log(`[Redis:${name}] Reconnecting... attempt ${times}`);
      return delay;
    },
  });

  client.on('connect', () => console.log(`[Redis:${name}] Connected`));
  client.on('error', (err) => console.error(`[Redis:${name}] Error:`, err));

  return client;
};

// Publisher — sends events into channels
const publisher = createRedisClient('publisher');

// Subscriber — listens to channels, CANNOT run other commands
const subscriber = createRedisClient('subscriber');

// General client — for caching, presence, session storage
const redisClient = createRedisClient('general');

module.exports = { publisher, subscriber, redisClient };