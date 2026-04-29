const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} = require('../../services/auth.service');

describe('Auth Service', () => {

  describe('Password hashing', () => {
    test('hashPassword returns a bcrypt hash', async () => {
      const hash = await hashPassword('mypassword123');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('mypassword123');
      expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix
    });

    test('two hashes of same password are different (salt)', async () => {
      const h1 = await hashPassword('samepassword');
      const h2 = await hashPassword('samepassword');
      expect(h1).not.toBe(h2);
    });
  });

  describe('Password comparison', () => {
    test('comparePassword returns true for correct password', async () => {
      const hash = await hashPassword('correct_password');
      const result = await comparePassword('correct_password', hash);
      expect(result).toBe(true);
    });

    test('comparePassword returns false for wrong password', async () => {
      const hash = await hashPassword('correct_password');
      const result = await comparePassword('wrong_password', hash);
      expect(result).toBe(false);
    });
  });

  describe('JWT tokens', () => {
    const payload = { id: 'user-123', email: 'akash@test.com' };

    test('generateToken returns a JWT string', () => {
      const token = generateToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    test('verifyToken decodes the correct payload', () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    test('verifyToken throws on tampered token', () => {
      const token = generateToken(payload);
      const tampered = token.slice(0, -5) + 'xxxxx';
      expect(() => verifyToken(tampered)).toThrow();
    });

    test('verifyToken throws on completely invalid token', () => {
      expect(() => verifyToken('not.a.token')).toThrow();
    });
  });
});