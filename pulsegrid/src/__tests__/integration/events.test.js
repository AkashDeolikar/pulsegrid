const request = require('supertest');
const { createApp } = require('./setup');
const db = require('../../db');

const app = createApp();
let authToken;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send({
    email: 'events@testpulse.com',
    username: 'eventsuser',
    password: 'password123',
  });
  authToken = res.body.token;
});

afterAll(async () => {
  await db.query(`DELETE FROM events WHERE producer_id IN
    (SELECT id FROM users WHERE email='events@testpulse.com')`);
  await db.query(`DELETE FROM users WHERE email='events@testpulse.com'`);
});

describe('POST /api/events/publish', () => {

  test('201 — publishes event and returns classifier metadata', async () => {
    const res = await request(app)
      .post('/api/events/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ topic: 'payments', payload: { amount: 5000 } });

    expect(res.status).toBe(201);
    expect(res.body.eventId).toBeDefined();
    expect(res.body.priority).toBe('urgent');       // payments → topic_rule
    expect(res.body.classifierSource).toBeDefined();
    expect(res.body.confidence).toBeDefined();
  });

  test('201 — manual priority override works', async () => {
    const res = await request(app)
      .post('/api/events/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ topic: 'payments', payload: { amount: 5000 }, priority: 'low' });

    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('low');
    expect(res.body.classifierSource).toBe('manual');
  });

  test('401 — no auth token returns unauthorized', async () => {
    const res = await request(app)
      .post('/api/events/publish')
      .send({ topic: 'orders', payload: { orderId: 'X' } });
    expect(res.status).toBe(401);
  });

  test('401 — invalid token returns unauthorized', async () => {
    const res = await request(app)
      .post('/api/events/publish')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ topic: 'orders', payload: { orderId: 'X' } });
    expect(res.status).toBe(401);
  });

  test('400 — missing topic returns validation error', async () => {
    const res = await request(app)
      .post('/api/events/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ payload: { orderId: 'X' } });
    expect(res.status).toBe(400);
  });

  test('400 — missing payload returns validation error', async () => {
    const res = await request(app)
      .post('/api/events/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ topic: 'orders' });
    expect(res.status).toBe(400);
  });
});