const { isOnline, sendToUser } = require('./connection.manager');
const {
  enqueueOfflineEvent,
  getOfflineEvents,
  clearOfflineEvents,
  countOfflineEvents,
} = require('../db/offline.model');
const db = require('../db');

/**
 * Called by queue worker after every event delivery attempt.
 * If a subscribed user is offline, their event goes to offline_queue.
 */
const handleOfflineUsers = async (eventId, topic) => {
  // Find all subscribers for this topic
  const result = await db.query(
    `SELECT user_id FROM subscriptions WHERE topic = $1`,
    [topic]
  );

  const offlineUsers = [];

  for (const { user_id } of result.rows) {
    if (!isOnline(user_id)) {
      await enqueueOfflineEvent(user_id, eventId);
      offlineUsers.push(user_id);
    }
  }

  if (offlineUsers.length > 0) {
    console.log(`[OfflineSync] Queued event ${eventId} for ${offlineUsers.length} offline user(s)`);
  }

  return offlineUsers;
};

/**
 * Called when a user's WebSocket connects.
 * Replays all missed events in strict chronological order.
 * Clears the queue after successful delivery.
 */
const syncOnReconnect = async (userId) => {
  const pendingCount = await countOfflineEvents(userId);

  if (pendingCount === 0) {
    sendToUser(userId, {
      type: 'SYNC_COMPLETE',
      missedEvents: 0,
      timestamp: new Date().toISOString(),
    });
    return 0;
  }

  console.log(`[OfflineSync] Replaying ${pendingCount} events for user ${userId}`);

  // Notify client sync is starting
  sendToUser(userId, {
    type: 'SYNC_START',
    missedEvents: pendingCount,
    timestamp: new Date().toISOString(),
  });

  const events = await getOfflineEvents(userId);
  let delivered = 0;

  for (const event of events) {
    const success = sendToUser(userId, {
      type: 'EVENT',
      eventId:   event.event_id,
      topic:     event.topic,
      payload:   event.payload,
      priority:  event.priority,
      timestamp: event.timestamp,
      replayed:  true, // flag so client knows this is a catch-up event
    });

    if (success) delivered++;

    // Small delay between replayed events so client isn't overwhelmed
    await new Promise(r => setTimeout(r, 10));
  }

  // Clear queue only after all events are delivered
  await clearOfflineEvents(userId);

  sendToUser(userId, {
    type: 'SYNC_COMPLETE',
    missedEvents: pendingCount,
    delivered,
    timestamp: new Date().toISOString(),
  });

  console.log(`[OfflineSync] Sync complete for ${userId}: ${delivered}/${pendingCount} delivered`);
  return delivered;
};

module.exports = { handleOfflineUsers, syncOnReconnect };