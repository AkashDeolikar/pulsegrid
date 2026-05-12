jest.mock('../../config/redis', () => {
  const pipeline = {
    incr: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    zremrangebyscore: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  };

  return {
    redisClient: {
      pipeline: jest.fn(() => pipeline),
      zrange: jest.fn().mockResolvedValue([]),
      keys: jest.fn().mockResolvedValue([]),
    },
  };
});

const {
  recordEvent,
  getThroughput,
  getLatencyPercentiles,
  getTopicBreakdown,
  getPriorityBreakdown,
} = require('../../services/metrics.service');
const redis = require('../../config/redis');

describe('Metrics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('recordEvent writes metrics and latency entries', async () => {
    await recordEvent('evt-1', 'alpha', 'urgent', 123);

    expect(redis.redisClient.pipeline).toHaveBeenCalled();
    const pipeline = redis.redisClient.pipeline.mock.results[0].value;
    expect(pipeline.incr).toHaveBeenCalledTimes(3);
    expect(pipeline.expire).toHaveBeenCalledTimes(3);
    expect(pipeline.zadd).toHaveBeenCalledWith('metrics:latency', expect.any(Number), 'evt-1:123');
    expect(pipeline.zremrangebyscore).toHaveBeenCalled();
    expect(pipeline.exec).toHaveBeenCalled();
  });

  test('getThroughput returns counts and minute labels', async () => {
    const fixture = [[null, '2'], [null, null], [null, '5']];
    redis.redisClient.pipeline.mockReturnValue({
      get: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(fixture),
    });

    const result = await getThroughput(3);
    expect(result).toHaveLength(3);
    expect(result[0].count).toBe(2);
    expect(result[1].count).toBe(0);
    expect(result[2].count).toBe(5);
    expect(result.every((item) => typeof item.minute === 'string')).toBe(true);
  });

  test('getLatencyPercentiles returns zeros when empty', async () => {
    redis.redisClient.zrange.mockResolvedValue([]);
    const result = await getLatencyPercentiles();
    expect(result).toEqual({ p50: 0, p95: 0, p99: 0, samples: 0 });
  });

  test('getLatencyPercentiles computes percentiles correctly', async () => {
    redis.redisClient.zrange.mockResolvedValue(['evt:10', 'evt:30', 'evt:50']);
    const result = await getLatencyPercentiles();
    expect(result.samples).toBe(3);
    expect(result.p50).toBe(30);
    expect(result.p95).toBe(50);
    expect(result.p99).toBe(50);
  });

  test('getTopicBreakdown returns sorted topic counts', async () => {
    redis.redisClient.keys.mockResolvedValue(['metrics:topic:beta', 'metrics:topic:alpha']);
    redis.redisClient.pipeline.mockReturnValue({
      get: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([[null, '1'], [null, '3']]),
    });

    const result = await getTopicBreakdown();
    expect(result).toEqual([
      { topic: 'alpha', count: 3 },
      { topic: 'beta', count: 1 },
    ]);
  });

  test('getPriorityBreakdown returns counts for each priority', async () => {
    redis.redisClient.pipeline.mockReturnValue({
      get: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([[null, '2'], [null, '1'], [null, null]]),
    });

    const result = await getPriorityBreakdown();
    expect(result).toEqual([
      { priority: 'urgent', count: 2 },
      { priority: 'normal', count: 1 },
      { priority: 'low', count: 0 },
    ]);
  });
});
