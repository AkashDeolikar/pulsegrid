const { publishEvent } = require('../services/event.service');

const publish = async (req, res) => {
  try {
    const { topic, payload, priority } = req.body;

    if (!topic || !payload) {
      return res.status(400).json({ error: 'topic and payload are required' });
    }

    const result = await publishEvent({
      producerId: req.user.id,
      topic,
      payload,
      priority, // optional — classifier takes over if omitted
    });

    return res.status(201).json({
      message: 'Event queued successfully',
      eventId:         result.id,
      topic,
      priority:        result.priority,
      classifierSource: result.classifierSource,
      confidence:      `${result.confidence}%`,
    });
  } catch (err) {
    console.error('Publish error:', err);
    return res.status(500).json({ error: 'Failed to publish event' });
  }
};

module.exports = { publish };