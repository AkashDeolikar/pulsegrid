// const {
//   getThroughput,
//   getLatencyPercentiles,
//   getTopicBreakdown,
//   getPriorityBreakdown,
// } = require('../services/metrics.service');
// const { getRecentAnomalies } = require('../services/anomaly.detector');
// const { getQueueStats }      = require('../services/queue.manager');
// const { getTotalConnections, getOnlineUserIds } = require('../services/connection.manager');
// const db = require('../db');

// const getOverview = async (req, res) => {
//   try {
//     const [eventsResult, usersResult, queueStats, priorityBreakdown] =
//       await Promise.all([
//         db.query(`SELECT
//           COUNT(*)                                          AS total,
//           COUNT(*) FILTER (WHERE status='delivered')       AS delivered,
//           COUNT(*) FILTER (WHERE status='queued')          AS queued,
//           COUNT(*) FILTER (WHERE status='failed')          AS failed
//         FROM events`),
//         db.query(`SELECT COUNT(*) AS total FROM users`),
//         getQueueStats(),
//         getPriorityBreakdown(),
//       ]);

//     res.json({
//       events:      eventsResult.rows[0],
//       users:       { total: parseInt(usersResult.rows[0].total) },
//       connections: {
//         active: getTotalConnections(),
//         userIds: getOnlineUserIds(),
//       },
//       queues:    queueStats,
//       priority:  priorityBreakdown,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error('Overview error:', err);
//     res.status(500).json({ error: 'Failed to fetch overview' });
//   }
// };

// const getThroughputData = async (req, res) => {
//   try {
//     const minutes = parseInt(req.query.minutes) || 60;
//     const data    = await getThroughput(Math.min(minutes, 1440)); // max 24h
//     const total   = data.reduce((s, d) => s + d.count, 0);
//     const peak    = Math.max(...data.map(d => d.count));
//     res.json({ throughput: data, total, peak, windowMinutes: minutes });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch throughput' });
//   }
// };

// const getLatencyData = async (req, res) => {
//   try {
//     const percentiles = await getLatencyPercentiles();
//     res.json({
//       ...percentiles,
//       unit:      'ms',
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch latency' });
//   }
// };

// const getAnomalies = async (req, res) => {
//   try {
//     const limit     = parseInt(req.query.limit) || 20;
//     const anomalies = await getRecentAnomalies(limit);
//     res.json({ anomalies, count: anomalies.length });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch anomalies' });
//   }
// };

// const getTopics = async (req, res) => {
//   try {
//     const topics = await getTopicBreakdown();
//     res.json({ topics });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch topics' });
//   }
// };

// module.exports = {
//   getOverview,
//   getThroughputData,
//   getLatencyData,
//   getAnomalies,
//   getTopics,
// };



const {
  getThroughput,
  getLatencyPercentiles,
  getTopicBreakdown,
  getPriorityBreakdown,
} = require('../services/metrics.service');
const { getRecentAnomalies }                       = require('../services/anomaly.detector');
const { getQueueStats, urgentQueue, normalQueue, lowQueue } = require('../services/queue.manager');
const { getTotalConnections, getOnlineUserIds }    = require('../services/connection.manager');
const db                                           = require('../db');

/**
 * GET /api/analytics/overview
 *
 * FIX: Now includes per-queue job counts from BullMQ directly.
 * The QueueConsole frontend needs:
 *   queues.urgent.{ waiting, active, completed, failed }
 *   queues.normal.{ waiting, active, completed, failed }
 *   queues.low.{    waiting, active, completed, failed }
 */
const getOverview = async (req, res) => {
  try {
    const [
      eventsResult,
      usersResult,
      priorityBreakdown,
      urgentCounts,
      normalCounts,
      lowCounts,
    ] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*)                                          AS total,
          COUNT(*) FILTER (WHERE status = 'delivered')     AS delivered,
          COUNT(*) FILTER (WHERE status = 'queued')        AS queued,
          COUNT(*) FILTER (WHERE status = 'failed')        AS failed
        FROM events
      `),
      db.query(`SELECT COUNT(*) AS total FROM users`),
      getPriorityBreakdown(),
      urgentQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      normalQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      lowQueue.getJobCounts('waiting',    'active', 'completed', 'failed', 'delayed'),
    ]);

    // Normalise BullMQ counts — getJobCounts returns an object keyed by state
    const normaliseQueue = (counts) => ({
      waiting:   counts.waiting   || 0,
      active:    counts.active    || 0,
      completed: counts.completed || 0,
      failed:    counts.failed    || 0,
      delayed:   counts.delayed   || 0,
    });

    res.json({
      events: {
        total:     parseInt(eventsResult.rows[0].total),
        delivered: parseInt(eventsResult.rows[0].delivered),
        queued:    parseInt(eventsResult.rows[0].queued),
        failed:    parseInt(eventsResult.rows[0].failed),
      },
      users: {
        total: parseInt(usersResult.rows[0].total),
      },
      connections: {
        active:  getTotalConnections(),
        userIds: getOnlineUserIds(),
      },
      // ── Per-queue BullMQ job counts ──────────────────────────────
      // This is what QueueConsole reads for its cards + DLQ tab
      queues: {
        urgent: normaliseQueue(urgentCounts),
        normal: normaliseQueue(normalCounts),
        low:    normaliseQueue(lowCounts),
      },
      priority:  priorityBreakdown,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Analytics] getOverview error:', err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
};

/**
 * GET /api/analytics/throughput?minutes=60
 */
const getThroughputData = async (req, res) => {
  try {
    const minutes = Math.min(parseInt(req.query.minutes) || 60, 1440); // max 24h
    const data    = await getThroughput(minutes);
    const total   = data.reduce((s, d) => s + d.count, 0);
    const peak    = Math.max(...data.map(d => d.count), 0);
    const avg     = data.length ? Math.round(total / data.length) : 0;

    res.json({
      throughput:    data,
      total,
      peak,
      avg,
      windowMinutes: minutes,
      timestamp:     new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Analytics] getThroughputData error:', err);
    res.status(500).json({ error: 'Failed to fetch throughput' });
  }
};

/**
 * GET /api/analytics/latency
 */
const getLatencyData = async (req, res) => {
  try {
    const percentiles = await getLatencyPercentiles();
    res.json({
      ...percentiles,
      unit:      'ms',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Analytics] getLatencyData error:', err);
    res.status(500).json({ error: 'Failed to fetch latency' });
  }
};

/**
 * GET /api/analytics/anomalies?limit=20
 */
const getAnomalies = async (req, res) => {
  try {
    const limit     = Math.min(parseInt(req.query.limit) || 20, 100);
    const anomalies = await getRecentAnomalies(limit);
    res.json({
      anomalies,
      count:     anomalies.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Analytics] getAnomalies error:', err);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
};

/**
 * GET /api/analytics/topics
 */
const getTopics = async (req, res) => {
  try {
    const topics = await getTopicBreakdown();
    res.json({
      topics,
      total:     topics.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Analytics] getTopics error:', err);
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