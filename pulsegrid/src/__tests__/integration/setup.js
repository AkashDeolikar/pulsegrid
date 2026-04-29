// Override env before any app code loads
process.env.DB_NAME    = 'pulsegrid_test';
process.env.JWT_SECRET = 'test_secret_do_not_use_in_prod';
process.env.NODE_ENV   = 'test';

const http    = require('http');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

// Mock Redis and BullMQ — integration tests don't need real queues
jest.mock('../../config/redis', () => ({
  publisher:   { publish: jest.fn().mockResolvedValue(1) },
  subscriber:  { psubscribe: jest.fn(), on: jest.fn() },
  redisClient: {
    setex:    jest.fn().mockResolvedValue('OK'),
    del:      jest.fn().mockResolvedValue(1),
    pipeline: jest.fn(() => ({
      incr:              jest.fn().mockReturnThis(),
      expire:            jest.fn().mockReturnThis(),
      zadd:              jest.fn().mockReturnThis(),
      zremrangebyscore:  jest.fn().mockReturnThis(),
      exec:              jest.fn().mockResolvedValue([]),
    })),
    keys:   jest.fn().mockResolvedValue([]),
    lrange: jest.fn().mockResolvedValue([]),
    lpush:  jest.fn().mockResolvedValue(1),
    ltrim:  jest.fn().mockResolvedValue('OK'),
    zrange: jest.fn().mockResolvedValue([]),
    get:    jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('bullmq', () => ({
  Queue:       jest.fn().mockImplementation(() => ({
    add:         jest.fn().mockResolvedValue({ id: 'job-1' }),
    getJobCounts:jest.fn().mockResolvedValue({ active:0, waiting:0, completed:0, failed:0 }),
  })),
  Worker:      jest.fn().mockImplementation(() => ({ on: jest.fn() })),
  QueueEvents: jest.fn().mockImplementation(() => ({ on: jest.fn() })),
}));

const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth',   require('../../routes/auth.routes'));
  app.use('/api/events', require('../../routes/event.routes'));
  return app;
};

module.exports = { createApp };