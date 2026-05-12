const request = require('supertest');
const { createApp } = require('./setup');
const db = require('../../db');

const app = createApp();
let authToken;
let testUserId;
let failedEventId;
let deliveredEventId;

// ── Seed ──────────────────────────────────────────────────────
beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send({
    email:    'retry@testpulse.com',
    username: 'retryuser',
    password: 'password123',
  });
  authToken  = res.body.token;
  testUserId = res.body.user.id;

  // Insert a FAILED event (retryable)
  const failedRes = await db.query(
    `INSERT INTO events (producer_id, topic, payload, priority, status, retry_count)
     VALUES ($1, 'orders', '{"orderId":"FAIL-001"}', 'normal', 'failed', 3)
     RETURNING id`,
    [testUserId]
  );
  failedEventId = failedRes.rows[0].id;

  // Insert a DELIVERED event (not retryable)
  const deliveredRes = await db.query(
    `INSERT INTO events (producer_id, topic, payload, priority, status)
     VALUES ($1, 'orders', '{"orderId":"OK-001"}', 'normal', 'delivered')
     RETURNING id`,
    [testUserId]
  );
  deliveredEventId = deliveredRes.rows[0].id;
});

afterAll(async () => {
  await db.query(`DELETE FROM events WHERE producer_id = $1`, [testUserId]);
  await db.query(`DELETE FROM users  WHERE id = $1`,          [testUserId]);
});

// ── POST /api/events/:id/retry ────────────────────────────────
describe('POST /api/events/:id/retry', () => {

  test('200 — retries a failed event and resets status to queued', async () => {
    const res = await request(app)
      .post(`/api/events/${failedEventId}/retry`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/retry/i);
    expect(res.body.eventId).toBe(failedEventId);
    expect(res.body).toHaveProperty('topic');
    expect(res.body).toHaveProperty('priority');
  });

  test('DB — event status reset to queued after retry', async () => {
    // Insert a fresh failed event
    const evtRes = await db.query(
      `INSERT INTO events (producer_id, topic, payload, priority, status, retry_count)
       VALUES ($1, 'payments', '{"amount":100}', 'urgent', 'failed', 3)
       RETURNING id`,
      [testUserId]
    );
    const eventId = evtRes.rows[0].id;

    await request(app)
      .post(`/api/events/${eventId}/retry`)
      .set('Authorization', `Bearer ${authToken}`);

    // Verify DB was updated
    const check = await db.query(
      `SELECT status, retry_count FROM events WHERE id = $1`,
      [eventId]
    );
    expect(check.rows[0].status).toBe('queued');
    expect(check.rows[0].retry_count).toBe(0);
  });

  test('404 — cannot retry a delivered event', async () => {
    const res = await request(app)
      .post(`/api/events/${deliveredEventId}/retry`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/not found|not in failed/i);
  });

  test('404 — returns 404 for non-existent event ID', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post(`/api/events/${fakeId}/retry`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('401 — requires auth token', async () => {
    const res = await request(app)
      .post(`/api/events/${failedEventId}/retry`);
    expect(res.status).toBe(401);
  });

  test('401 — rejects invalid token', async () => {
    const res = await request(app)
      .post(`/api/events/${failedEventId}/retry`)
      .set('Authorization', 'Bearer bad.token.here');
    expect(res.status).toBe(401);
  });
});