const Redis  = require('ioredis');
const config = require('./index');

/**
 * Redis client factory.
 *
 * Railway provides REDIS_URL as a full connection string (redis://...).
 * ioredis accepts a URL string directly — no extra parsing needed.
 * Local dev uses REDIS_HOST + REDIS_PORT from .env.
 */
const createRedisClient = (name) => {
  const retryStrategy = (times) => {
    const delay = Math.min(times * 100, 3000);
    console.log(`[Redis:${name}] Reconnecting... attempt ${times} (delay ${delay}ms)`);
    return delay;
  };

  const client = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        retryStrategy,
        maxRetriesPerRequest: null, // required by BullMQ
        enableReadyCheck:     false,
        lazyConnect:          false,
      })
    : new Redis({
        host:                 config.redis.host,
        port:                 config.redis.port,
        retryStrategy,
        maxRetriesPerRequest: null,
        enableReadyCheck:     false,
      });

  client.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Redis:${name}] Connected`);
    }
  });

  client.on('ready', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Redis:${name}] Ready`);
    }
  });

  client.on('error', (err) => {
    console.error(`[Redis:${name}] Error:`, err.message);
  });

  client.on('close', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Redis:${name}] Connection closed`);
    }
  });

  return client;
};

// Publisher — sends events into Redis channels
const publisher = createRedisClient('publisher');

// Subscriber — listens to channels (CANNOT run other commands while subscribed)
const subscriber = createRedisClient('subscriber');

// General — caching, presence, session data, metrics
const redisClient = createRedisClient('general');

const closeRedis = async () => {
  await Promise.allSettled([
    publisher?.quit?.(),
    subscriber?.quit?.(),
    redisClient?.quit?.(),
  ]);
};

module.exports = { publisher, subscriber, redisClient, closeRedis };


// const Redis = require('ioredis');
// const config = require('./index');

// let publisher;
// let subscriber;
// let redisClient;

// const createRedisClient = (name) => {
//   const client = new Redis({
//     host: config.redis.host,
//     port: config.redis.port,

//     lazyConnect: true,
//     maxRetriesPerRequest: 3,

//     retryStrategy: (times) => {
//       const delay = Math.min(times * 50, 2000);
//       return delay;
//     },
//   });

//   // ❗ Disable logs during tests
//   if (process.env.NODE_ENV !== 'test') {
//     client.on('connect', () => console.log(`[Redis:${name}] Connected`));
//     client.on('error', (err) => console.error(`[Redis:${name}] Error:`, err));
//   }

//   return client;
// };

// // ✅ Call this ONCE when server starts
// const initRedis = async () => {
//   publisher = createRedisClient('publisher');
//   subscriber = createRedisClient('subscriber');
//   redisClient = createRedisClient('general');

//   await Promise.all([
//     publisher.connect(),
//     subscriber.connect(),
//     redisClient.connect(),
//   ]);
// };

// // ✅ Clean shutdown (important for Jest)
// const closeRedis = async () => {
//   await Promise.allSettled([
//     publisher?.quit(),
//     subscriber?.quit(),
//     redisClient?.quit(),
//   ]);
// };

// // getters (so other files still work)
// module.exports = {
//   initRedis,
//   closeRedis,
//   get publisher() {
//     return publisher;
//   },
//   get subscriber() {
//     return subscriber;
//   },
//   get redisClient() {
//     return redisClient;
//   },
// };

// //======================================================

// const client = process.env.REDIS_URL
//   ? new Redis(process.env.REDIS_URL)
//   : new Redis({ host: config.redis.host, port: config.redis.port, ...retryStrategy });


// const Redis = require('ioredis');
// const config = require('./index');

// const createRedisClient = (name) => {
//   const client = new Redis({
//     host: config.redis.host,
//     port: config.redis.port,
//     retryStrategy: (times) => {
//       const delay = Math.min(times * 50, 2000);
//       console.log(`[Redis:${name}] Reconnecting... attempt ${times}`);
//       return delay;
//     },
//   });

//   client.on('connect', () => console.log(`[Redis:${name}] Connected`));
//   client.on('error', (err) => console.error(`[Redis:${name}] Error:`, err));

//   return client;
// };

// // Publisher — sends events into channels
// const publisher = createRedisClient('publisher');

// // Subscriber — listens to channels, CANNOT run other commands
// const subscriber = createRedisClient('subscriber');

// // General client — for caching, presence, session storage
// const redisClient = createRedisClient('general');

// module.exports = { publisher, subscriber, redisClient };