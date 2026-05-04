const db = require('../db');
const { hashPassword, comparePassword } = require('../services/auth.service');

/**
 * PATCH /api/auth/profile
 * Update username (email is immutable)
 */
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (username.trim().length > 30) {
      return res.status(400).json({ error: 'Username must be under 30 characters' });
    }

    const result = await db.query(
      `UPDATE users
       SET username = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, username, created_at`,
      [username.trim(), req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'Profile updated',
      user:    result.rows[0],
    });
  } catch (err) {
    // Handle unique constraint violation (username taken)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already taken' });
    }
    console.error('[Auth] updateProfile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * PATCH /api/auth/password
 * Change password — requires current password verification
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Fetch current hash
    const result = await db.query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const valid = await comparePassword(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);
    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [newHash, req.user.id]
    );

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('[Auth] changePassword error:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = { updateProfile, changePassword };