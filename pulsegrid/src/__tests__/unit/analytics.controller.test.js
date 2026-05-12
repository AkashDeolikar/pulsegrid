jest.mock('../../services/metrics.service', () => ({
  getThroughput: jest.fn(),
  getLatencyPercentiles: jest.fn(),
  getTopicBreakdown: jest.fn(),
  getPriorityBreakdown: jest.fn(),
}));
jest.mock('../../services/anomaly.detector', () => ({
  getRecentAnomalies: jest.fn(),
}));
jest.mock('../../services/queue.manager', () => ({
  getQueueStats: jest.fn(),
  urgentQueue: { getJobCounts: jest.fn() },
  normalQueue: { getJobCounts: jest.fn() },
  lowQueue: { getJobCounts: jest.fn() },
}));
jest.mock('../../services/connection.manager', () => ({
  getTotalConnections: jest.fn(),
  getOnlineUserIds: jest.fn(),
}));
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

const {
  getOverview,
  getThroughputData,
  getLatencyData,
  getAnomalies,
  getTopics,
} = require('../../controllers/analytics.controller');
const metricsService = require('../../services/metrics.service');
const anomalyService = require('../../services/anomaly.detector');
const queueManager = require('../../services/queue.manager');
const connectionManager = require('../../services/connection.manager');
const db = require('../../db');

describe('Analytics Controller', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getOverview returns normalized queue counts and priority breakdown', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ total: '7', delivered: '5', queued: '1', failed: '1' }] })
      .mockResolvedValueOnce({ rows: [{ total: '4' }] });
    metricsService.getPriorityBreakdown.mockResolvedValue([{ priority: 'urgent', count: 2 }]);
    queueManager.urgentQueue.getJobCounts.mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 });
    queueManager.normalQueue.getJobCounts.mockResolvedValue({ waiting: 1, active: 0, completed: 0, failed: 0, delayed: 0 });
    queueManager.lowQueue.getJobCounts.mockResolvedValue({ waiting: 2, active: 0, completed: 0, failed: 0, delayed: 0 });
    connectionManager.getTotalConnections.mockReturnValue(3);
    connectionManager.getOnlineUserIds.mockReturnValue(['u1', 'u2']);

    await getOverview({ query: {} }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      events: expect.objectContaining({ total: 7, delivered: 5, queued: 1, failed: 1 }),
      users: expect.objectContaining({ total: 4 }),
      connections: expect.objectContaining({ active: 3, userIds: ['u1', 'u2'] }),
      queues: expect.objectContaining({
        urgent: expect.objectContaining({ waiting: 0 }),
        normal: expect.objectContaining({ waiting: 1 }),
        low: expect.objectContaining({ waiting: 2 }),
      }),
      priority: [{ priority: 'urgent', count: 2 }],
    }));
  });

  test('getThroughputData returns aggregated throughput with avg and peak', async () => {
    metricsService.getThroughput.mockResolvedValue([{ minute: 'a', count: 1 }, { minute: 'b', count: 3 }]);
    await getThroughputData({ query: { minutes: '2' } }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      throughput: expect.any(Array),
      total: 4,
      peak: 3,
      avg: 2,
      windowMinutes: 2,
    }));
  });

  test('getLatencyData returns percentile payload', async () => {
    metricsService.getLatencyPercentiles.mockResolvedValue({ p50: 10, p95: 20, p99: 30, samples: 4 });
    await getLatencyData({ query: {} }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      p50: 10,
      p95: 20,
      p99: 30,
      samples: 4,
      unit: 'ms',
    }));
  });

  test('getAnomalies returns anomaly list and count', async () => {
    anomalyService.getRecentAnomalies.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
    await getAnomalies({ query: { limit: '2' } }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      anomalies: [{ id: 'a1' }, { id: 'a2' }],
      count: 2,
    }));
  });

  test('getTopics returns topic breakdown and count', async () => {
    metricsService.getTopicBreakdown.mockResolvedValue([{ topic: 'alpha', count: 5 }]);
    await getTopics({ query: {} }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      topics: [{ topic: 'alpha', count: 5 }],
      total: 1,
    }));
  });
});
