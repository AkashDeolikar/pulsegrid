const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getOverview,
  getThroughputData,
  getLatencyData,
  getAnomalies,
  getTopics,
} = require('../controllers/analytics.controller');

router.get('/overview',    authenticate, getOverview);
router.get('/throughput',  authenticate, getThroughputData);
router.get('/latency',     authenticate, getLatencyData);
router.get('/anomalies',   authenticate, getAnomalies);
router.get('/topics',      authenticate, getTopics);

module.exports = router;