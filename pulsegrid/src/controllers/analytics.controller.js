const {
  getThroughput,
  getLatencyPercentiles,
  getTopicBreakdown,
  getPriorityBreakdown,
} = require('../services/metrics.service');
const { getRecentAnomalies } = require('../services/anomaly.detector');
const { getQueueStats }      = require('../services/queue.manager');
const { getTotalConnections, getOnlineUserIds } = require('../services/connection.manager');
const db = require('../db');

const getOverview = async (req, res) => {
  try {
    const [eventsResult, usersResult, queueStats, priorityBreakdown] =
      await Promise.all([
        db.query(`SELECT
          COUNT(*)                                          AS total,
          COUNT(*) FILTER (WHERE status='delivered')       AS delivered,
          COUNT(*) FILTER (WHERE status='queued')          AS queued,
          COUNT(*) FILTER (WHERE status='failed')          AS failed
        FROM events`),
        db.query(`SELECT COUNT(*) AS total FROM users`),
        getQueueStats(),
        getPriorityBreakdown(),
      ]);

    res.json({
      events:      eventsResult.rows[0],
      users:       { total: parseInt(usersResult.rows[0].total) },
      connections: {
        active: getTotalConnections(),
        userIds: getOnlineUserIds(),
      },
      queues:    queueStats,
      priority:  priorityBreakdown,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
};

const getThroughputData = async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 60;
    const data    = await getThroughput(Math.min(minutes, 1440)); // max 24h
    const total   = data.reduce((s, d) => s + d.count, 0);
    const peak    = Math.max(...data.map(d => d.count));
    res.json({ throughput: data, total, peak, windowMinutes: minutes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch throughput' });
  }
};

const getLatencyData = async (req, res) => {
  try {
    const percentiles = await getLatencyPercentiles();
    res.json({
      ...percentiles,
      unit:      'ms',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latency' });
  }
};

const getAnomalies = async (req, res) => {
  try {
    const limit     = parseInt(req.query.limit) || 20;
    const anomalies = await getRecentAnomalies(limit);
    res.json({ anomalies, count: anomalies.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
};

const getTopics = async (req, res) => {
  try {
    const topics = await getTopicBreakdown();
    res.json({ topics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

module.exports = {
  getOverview,
  getThroughputData,
  getLatencyData,
  getAnomalies,
  getTopics,
};