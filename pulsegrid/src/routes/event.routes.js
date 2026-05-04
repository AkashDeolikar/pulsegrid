const express    = require('express');
const router     = express.Router();
const { authenticate } = require('../middleware/auth');
const { publish } = require('../controllers/event.controller'); 
const { listEvents, getEvent, retryEvent } = require('../controllers/events.list.controller');

// Existing publish endpoint (keep as is)
router.post('/publish', authenticate, publish);

// NEW: List events with filters + pagination
router.get('/', authenticate, listEvents);

// NEW: Get single event
router.get('/:id', authenticate, getEvent);

// NEW: Retry a failed event
router.post('/:id/retry', authenticate, retryEvent);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { publish } = require('../controllers/event.controller');
// const { authenticate } = require('../middleware/auth');

// router.post('/publish', authenticate, publish);

// module.exports = router;