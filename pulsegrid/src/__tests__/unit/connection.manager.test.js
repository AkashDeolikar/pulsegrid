jest.mock('../../config/redis', () => ({
  redisClient: {
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  },
}));

let addConnection;
let removeConnection;
let sendToUser;
let isOnline;
let getTotalConnections;
let getOnlineUserIds;

const randomId = () => `user-${Math.random().toString(36).slice(2)}`;

describe('Connection Manager', () => {
  let userId;
  let ws;

  beforeEach(() => {
    jest.resetModules();
    const connectionManager = require('../../services/connection.manager');
    addConnection = connectionManager.addConnection;
    removeConnection = connectionManager.removeConnection;
    sendToUser = connectionManager.sendToUser;
    isOnline = connectionManager.isOnline;
    getTotalConnections = connectionManager.getTotalConnections;
    getOnlineUserIds = connectionManager.getOnlineUserIds;

    userId = randomId();
    ws = { send: jest.fn(), readyState: 1 };
    ws.send.mockClear();
  });

  test('adds a connection and updates Redis presence', async () => {
    await addConnection(userId, ws);

    expect(isOnline(userId)).toBe(true);
    expect(getTotalConnections()).toBe(1);
    expect(getOnlineUserIds()).toContain(userId);
  });

  test('sendToUser returns false when user has no active connections', () => {
    expect(sendToUser('missing-user', { type: 'TEST' })).toBe(false);
  });

  test('sendToUser delivers to open sockets', async () => {
    const activeWs = { send: jest.fn(), readyState: 1 };
    await addConnection(userId, activeWs);

    const delivered = sendToUser(userId, { type: 'PING' });

    expect(delivered).toBe(true);
    expect(activeWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'PING' }));
  });

  test('removeConnection deletes last socket and clears Redis presence', async () => {
    const closingWs = { send: jest.fn(), readyState: 1 };
    await addConnection(userId, closingWs);

    await removeConnection(userId, closingWs);

    expect(isOnline(userId)).toBe(false);
    expect(getTotalConnections()).toBe(0);
  });
});
