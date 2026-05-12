const request = require('supertest');
const { createApp } = require('./setup');
const db = require('../../db');

const app = createApp();
let authToken;
let testUserId;

// ── Seed: register user + insert test events ───────────────────
beforeAll(async () => {
  // Register
  const res = await request(app).post('/api/auth/register').send({
    email:    'events_list@testpulse.com',
    username: 'eventslistuser',
    password: 'password123',
  });
  authToken  = res.body.token;
  testUserId = res.body.user.id;

  // Insert known test events directly (bypasses queue for speed)
  await db.query(
    `INSERT INTO events (producer_id, topic, payload, priority, status)
     VALUES
       ($1, 'payments',  '{"amount":5000}',  'urgent', 'delivered'),
       ($1, 'orders',    '{"orderId":"A1"}',  'normal', 'delivered'),
       ($1, 'analytics', '{"views":900}',     'low',    'queued'   ),
       ($1, 'payments',  '{"amount":200}',    'urgent', 'failed'   ),
       ($1, 'orders',    '{"orderId":"A2"}',  'normal', 'delivered')`,
    [testUserId]
  );
});

afterAll(async () => {
  await db.query(`DELETE FROM events WHERE producer_id = $1`, [testUserId]);
  await db.query(`DELETE FROM users  WHERE id = $1`,          [testUserId]);
});

// ── GET /api/events ───────────────────────────────────────────
describe('GET /api/events', () => {

  test('200 — returns paginated events with total', async () => {
    const res = await request(app)
      .get('/api/events?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('events');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(5);
  });

  test('200 — filters by topic', async () => {
    const res = await request(app)
      .get('/api/events?topic=payments')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    res.body.events.forEach(evt => {
      expect(evt.topic).toBe('payments');
    });
    expect(res.body.events.length).toBeGreaterThanOrEqual(2);
  });

  test('200 — filters by priority', async () => {
    const res = await request(app)
      .get('/api/events?priority=urgent')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    res.body.events.forEach(evt => {
      expect(evt.priority).toBe('urgent');
    });
  });

  test('200 — filters by status delivered', async () => {
    const res = await request(app)
      .get('/api/events?status=delivered')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    res.body.events.forEach(evt => {
      expect(evt.status).toBe('delivered');
    });
  });

  test('200 — filters by status failed', async () => {
    const res = await request(app)
      .get('/api/events?status=failed')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBeGreaterThanOrEqual(1);
    res.body.events.forEach(evt => {
      expect(evt.status).toBe('failed');
    });
  });

  test('200 — combines topic + priority filter', async () => {
    const res = await request(app)
      .get('/api/events?topic=payments&priority=urgent')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    res.body.events.forEach(evt => {
      expect(evt.topic).toBe('payments');
      expect(evt.priority).toBe('urgent');
    });
  });

  test('200 — pagination respects limit', async () => {
    const res = await request(app)
      .get('/api/events?limit=2&page=1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBeLessThanOrEqual(2);
    expect(res.body.limit).toBe(2);
    expect(res.body.page).toBe(1);
  });

  test('200 — page 2 returns different events than page 1', async () => {
    const [p1, p2] = await Promise.all([
      request(app).get('/api/events?limit=2&page=1').set('Authorization', `Bearer ${authToken}`),
      request(app).get('/api/events?limit=2&page=2').set('Authorization', `Bearer ${authToken}`),
    ]);

    const ids1 = p1.body.events.map(e => e.id);
    const ids2 = p2.body.events.map(e => e.id);
    // No overlap between pages
    expect(ids1.some(id => ids2.includes(id))).toBe(false);
  });

  test('200 — event object has required fields', async () => {
    const res = await request(app)
      .get('/api/events?limit=1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    if (res.body.events.length > 0) {
      const evt = res.body.events[0];
      expect(evt).toHaveProperty('id');
      expect(evt).toHaveProperty('topic');
      expect(evt).toHaveProperty('payload');
      expect(evt).toHaveProperty('priority');
      expect(evt).toHaveProperty('status');
      expect(evt).toHaveProperty('created_at');
    }
  });

  test('400 — rejects invalid priority', async () => {
    const res = await request(app)
      .get('/api/events?priority=superurgent')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 — rejects invalid status', async () => {
    const res = await request(app)
      .get('/api/events?status=unknown')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('401 — requires auth token', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(401);
  });

  test('401 — rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  test('200 — caps limit at 100', async () => {
    const res = await request(app)
      .get('/api/events?limit=9999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.limit).toBeLessThanOrEqual(100);
  });
});