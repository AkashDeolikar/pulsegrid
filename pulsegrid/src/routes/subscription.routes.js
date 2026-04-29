const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { subscribe, unsubscribe, getUserSubscriptions } = require('../db/subscription.model');

router.post('/subscribe', authenticate, async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  const sub = await subscribe(req.user.id, topic);
  res.status(201).json({ message: sub ? 'Subscribed' : 'Already subscribed', topic });
});

router.delete('/unsubscribe', authenticate, async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  const removed = await unsubscribe(req.user.id, topic);
  res.json({ message: removed ? 'Unsubscribed' : 'Not subscribed', topic });
});

router.get('/my', authenticate, async (req, res) => {
  const subs = await getUserSubscriptions(req.user.id);
  res.json({ subscriptions: subs });
});

module.exports = router;