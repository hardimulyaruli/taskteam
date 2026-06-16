/**
 * SQL query constants for auth & profile operations.
 * All queries use parameterized placeholders (?) to prevent SQL injection.
 */

// ── Get user by id (with role) ──
const GET_USER_BY_ID = `
  SELECT
    u.id,
    u.username,
    u.avatar,
    u.created_at,
    r.name AS role
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  WHERE u.id = ?
  LIMIT 1
`;

// ── Update username ──
const UPDATE_USERNAME = `
  UPDATE users SET username = ? WHERE id = ?
`;

// ── Update password ──
const UPDATE_PASSWORD = `
  UPDATE users SET password_hash = ? WHERE id = ?
`;

// ── Update avatar filename ──
// ── Update avatar filename ──
const UPDATE_AVATAR = `
  UPDATE users SET avatar = ? WHERE id = ?
`;

// ── Hapus avatar (set NULL) ──
const REMOVE_AVATAR = `
  UPDATE users SET avatar = NULL WHERE id = ?
`;

// ── Get current avatar (untuk hapus file lama) ──
const GET_AVATAR_BY_ID = `
  SELECT avatar FROM users WHERE id = ? LIMIT 1
`;

module.exports = {
  GET_USER_BY_ID,
  UPDATE_USERNAME,
  UPDATE_PASSWORD,
  UPDATE_AVATAR,
  REMOVE_AVATAR,
  GET_AVATAR_BY_ID,
};