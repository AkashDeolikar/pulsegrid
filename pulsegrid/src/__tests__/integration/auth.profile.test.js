const request = require('supertest');
const { createApp } = require('./setup');
const db = require('../../db');

const app = createApp();
let authToken;
let testUserId;

// ── Seed ──────────────────────────────────────────────────────
beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send({
    email:    'profile@testpulse.com',
    username: 'profileuser',
    password: 'originalpass123',
  });
  authToken  = res.body.token;
  testUserId = res.body.user.id;
});

afterAll(async () => {
  await db.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
});

// ── PATCH /api/auth/profile ───────────────────────────────────
describe('PATCH /api/auth/profile', () => {

  test('200 — updates username successfully', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'updatedusername' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
    expect(res.body.user.username).toBe('updatedusername');
  });

  test('DB — username change persisted to database', async () => {
    await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'dbverifiedname' });

    const check = await db.query(
      `SELECT username FROM users WHERE id = $1`,
      [testUserId]
    );
    expect(check.rows[0].username).toBe('dbverifiedname');
  });

  test('200 — response never exposes password_hash', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'safenamecheck' });

    expect(res.status).toBe(200);
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('400 — rejects username shorter than 3 chars', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'ab' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 — rejects username longer than 30 chars', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'a'.repeat(31) });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 — rejects missing username field', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('401 — requires auth token', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .send({ username: 'nope' });
    expect(res.status).toBe(401);
  });

  test('409 — rejects duplicate username', async () => {
    // Register another user with a known username
    await request(app).post('/api/auth/register').send({
      email:    'other_profile@testpulse.com',
      username: 'takenusername',
      password: 'password123',
    });

    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'takenusername' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/taken/i);

    // Cleanup
    await db.query(`DELETE FROM users WHERE email = 'other_profile@testpulse.com'`);
  });
});

// ── PATCH /api/auth/password ──────────────────────────────────
describe('PATCH /api/auth/password', () => {

  test('200 — changes password with correct current password', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'originalpass123',
        newPassword:     'newpassword456',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/changed/i);
  });

  test('login — new password works after change', async () => {
    // Change to a known password first
    await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentPassword: 'newpassword456', newPassword: 'finalpass789' });

    // Login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'profile@testpulse.com', password: 'finalpass789' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    // Update token for future tests
    authToken = loginRes.body.token;
  });

  test('401 — rejects wrong current password', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'wrongpassword',
        newPassword:     'doesnotmatter',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrect/i);
  });

  test('400 — rejects new password shorter than 8 chars', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'finalpass789',
        newPassword:     'short',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 — rejects missing currentPassword', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newPassword: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 — rejects missing newPassword', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentPassword: 'finalpass789' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('401 — requires auth token', async () => {
    const res = await request(app)
      .patch('/api/auth/password')
      .send({ currentPassword: 'finalpass789', newPassword: 'newpassword123' });

    expect(res.status).toBe(401);
  });
});