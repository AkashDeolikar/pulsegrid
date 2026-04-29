const { redisClient } = require('../config/redis');
const { getThroughput } = require('./metrics.service');
const { sendToUser } = require('./connection.manager');
const { getOnlineUserIds } = require('./connection.manager');

const ANOMALY_THRESHOLD = 2.0;   // Z-score above this = anomaly
const MIN_SAMPLES      = 5;      // need at least 5 data points to detect
const ANOMALY_TTL      = 60 * 60; // store anomalies for 1 hour

/**
 * Z-score = (value - mean) / stddev
 * Measures how many standard deviations a value is from the mean.
 * Z > 2.0 means the value is unusually high — a spike.
 */
const calculateZScore = (values) => {
  if (values.length < MIN_SAMPLES) return { zScore: 0, mean: 0, stddev: 0 };

  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stddev = Math.sqrt(variance);

  // Avoid division by zero when all values are identical
  if (stddev === 0) return { zScore: 0, mean, stddev: 0 };

  const latest = values[values.length - 1];
  const zScore = (latest - mean) / stddev;

  return { zScore: parseFloat(zScore.toFixed(2)), mean: parseFloat(mean.toFixed(2)), stddev: parseFloat(stddev.toFixed(2)) };
};

/**
 * Run anomaly check — called after every event publish.
 * Compares current minute's throughput against the last 30 minutes.
 */
const checkAnomaly = async (topic) => {
  // Get last 30 minutes of throughput data
  const throughput = await getThroughput(30);
  const counts = throughput.map(t => t.count);

  const { zScore, mean, stddev } = calculateZScore(counts);

  if (zScore < ANOMALY_THRESHOLD) return null;

  // Anomaly detected — build alert
  const anomaly = {
    id:        `anomaly:${Date.now()}`,
    topic,
    zScore,
    mean:      Math.round(mean),
    stddev:    Math.round(stddev),
    current:   counts[counts.length - 1],
    severity:  zScore >= 3.0 ? 'critical' : 'warning',
    detectedAt: new Date().toISOString(),
  };

  // Persist anomaly in Redis list (capped at 100 entries)
  await redisClient.lpush('anomalies:log', JSON.stringify(anomaly));
  await redisClient.ltrim('anomalies:log', 0, 99);
  await redisClient.expire('anomalies:log', ANOMALY_TTL);

  // Broadcast alert to ALL online users via WebSocket
  const onlineUsers = getOnlineUserIds();
  onlineUsers.forEach(userId => {
    sendToUser(userId, {
      type:    'ANOMALY_ALERT',
      ...anomaly,
    });
  });

  console.warn(`[Anomaly] SPIKE DETECTED on topic "${topic}": Z=${zScore}, current=${anomaly.current}, mean=${anomaly.mean}`);

  return anomaly;
};

/**
 * Fetch recent anomalies for the dashboard.
 */
const getRecentAnomalies = async (limit = 20) => {
  const raw = await redisClient.lrange('anomalies:log', 0, limit - 1);
  return raw.map(r => JSON.parse(r));
};

module.exports = { checkAnomaly, getRecentAnomalies, calculateZScore };