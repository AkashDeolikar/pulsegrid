const { getEvents, getEventById, resetEventForRetry } = require('../db/event.model');
const { enqueueEvent } = require('../services/queue.manager');

/**
 * GET /api/events
 * Query params: topic, priority, status, page, limit
 */
const listEvents = async (req, res) => {
  try {
    const { topic, priority, status, page = 1, limit = 15 } = req.query;

    // Validate enums
    const validPriorities = ['urgent', 'normal', 'low'];
    const validStatuses   = ['queued', 'delivered', 'failed'];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be: ${validPriorities.join(', ')}` });
    }
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    const parsedLimit = Math.min(parseInt(limit) || 15, 100); // cap at 100
    const parsedPage  = Math.max(parseInt(page)  || 1,  1);

    const result = await getEvents({
      topic,
      priority,
      status,
      page:  parsedPage,
      limit: parsedLimit,
    });

    return res.json(result);
  } catch (err) {
    console.error('[Events] listEvents error:', err);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * GET /api/events/:id
 */
const getEvent = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json({ event });
  } catch (err) {
    console.error('[Events] getEvent error:', err);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
};

/**
 * POST /api/events/:id/retry
 * Re-enqueues a failed event through the normal queue pipeline.
 */
const retryEvent = async (req, res) => {
  try {
    const event = await resetEventForRetry(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found or not in failed state' });
    }

    // Re-enqueue through priority queue
    await enqueueEvent(
      {
        eventId:    event.id,
        topic:      event.topic,
        payload:    event.payload,
        producerId: event.producer_id,
        timestamp:  new Date().toISOString(),
      },
      event.priority
    );

    return res.json({
      message:  'Event queued for retry',
      eventId:  event.id,
      topic:    event.topic,
      priority: event.priority,
    });
  } catch (err) {
    console.error('[Events] retryEvent error:', err);
    return res.status(500).json({ error: 'Failed to retry event' });
  }
};

module.exports = { listEvents, getEvent, retryEvent };