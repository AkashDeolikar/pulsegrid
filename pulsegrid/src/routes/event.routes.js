const express = require('express');
const router = express.Router();
const { publish } = require('../controllers/event.controller');
const { authenticate } = require('../middleware/auth');

router.post('/publish', authenticate, publish);

module.exports = router;