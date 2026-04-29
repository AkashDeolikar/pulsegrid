const request = require('supertest');
const { createApp } = require('./setup');
const db = require('../../db');

const app = createApp();

afterAll(async () => {
  // Clean up test users after all tests
  await db.query(`DELETE FROM users WHERE email LIKE '%@testpulse.com'`);
  await db.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()', ['pulsegrid_test']);
});

describe('POST /api/auth/register', () => {
  const user = { email: 'register@testpulse.com', username: 'testregister', password: 'password123' };

  test('201 — registers new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.password_hash).toBeUndefined(); // never exposed
  });

  test('409 — duplicate email returns conflict', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  test('400 — missing password returns validation error', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ email: 'new@testpulse.com', username: 'newuser' });
    expect(res.status).toBe(400);
  });

  test('400 — invalid email format', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ email: 'notanemail', username: 'user', password: 'password123' });
    expect(res.status).toBe(400);
  });

  test('400 — password too short', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ email: 'short@testpulse.com', username: 'shortpass', password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  const creds = { email: 'login@testpulse.com', username: 'testlogin', password: 'mypassword99' };

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(creds);
  });

  test('200 — returns token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: creds.email, password: creds.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('401 — wrong password returns invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: creds.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('401 — unknown email returns same error (no enumeration)', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'nobody@testpulse.com', password: 'anypassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials'); // same message!
  });

  test('400 — missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: creds.email });
    expect(res.status).toBe(400);
  });
});