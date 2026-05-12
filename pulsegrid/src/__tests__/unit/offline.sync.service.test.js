jest.mock('../../db', () => ({ query: jest.fn() }));
jest.mock('../../services/connection.manager', () => ({
  isOnline: jest.fn(),
  sendToUser: jest.fn(),
}));
jest.mock('../../db/offline.model', () => ({
  enqueueOfflineEvent: jest.fn(),
  getOfflineEvents: jest.fn(),
  clearOfflineEvents: jest.fn(),
  countOfflineEvents: jest.fn(),
}));

const db = require('../../db');
const { isOnline, sendToUser } = require('../../services/connection.manager');
const {
  enqueueOfflineEvent,
  getOfflineEvents,
  clearOfflineEvents,
  countOfflineEvents,
} = require('../../db/offline.model');
const { handleOfflineUsers, syncOnReconnect } = require('../../services/offline.sync.service');

describe('Offline Sync Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleOfflineUsers queues offline subscribers', async () => {
    db.query.mockResolvedValue({ rows: [{ user_id: 'u1' }, { user_id: 'u2' }] });
    isOnline.mockReturnValue(false);

    const result = await handleOfflineUsers('event-1', 'topicA');

    expect(enqueueOfflineEvent).toHaveBeenCalledTimes(2);
    expect(enqueueOfflineEvent).toHaveBeenCalledWith('u1', 'event-1');
    expect(result).toEqual(['u1', 'u2']);
  });

  test('handleOfflineUsers returns empty array when all subscribers are online', async () => {
    db.query.mockResolvedValue({ rows: [{ user_id: 'u1' }] });
    isOnline.mockReturnValue(true);

    const result = await handleOfflineUsers('event-2', 'topicB');
    expect(enqueueOfflineEvent).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('syncOnReconnect returns 0 when no pending offline events', async () => {
    countOfflineEvents.mockResolvedValue(0);
    const res = await syncOnReconnect('u1');

    expect(sendToUser).toHaveBeenCalledWith('u1', expect.objectContaining({ type: 'SYNC_COMPLETE' }));
    expect(res).toBe(0);
  });

  test('syncOnReconnect replays pending events and clears the queue', async () => {
    countOfflineEvents.mockResolvedValue(2);
    getOfflineEvents.mockResolvedValue([
      { event_id: 'e1', topic: 't1', payload: { data: 1 }, priority: 'normal', timestamp: 'time1' },
      { event_id: 'e2', topic: 't2', payload: { data: 2 }, priority: 'urgent', timestamp: 'time2' },
    ]);
    sendToUser.mockReturnValue(true);
    clearOfflineEvents.mockResolvedValue(2);

    const delivered = await syncOnReconnect('u2');

    expect(sendToUser).toHaveBeenCalledWith('u2', expect.objectContaining({ type: 'SYNC_START' }));
    expect(sendToUser).toHaveBeenCalledWith('u2', expect.objectContaining({ type: 'EVENT', eventId: 'e1' }));
    expect(sendToUser).toHaveBeenCalledWith('u2', expect.objectContaining({ type: 'SYNC_COMPLETE' }));
    expect(clearOfflineEvents).toHaveBeenCalledWith('u2');
    expect(delivered).toBe(2);
  });
});
