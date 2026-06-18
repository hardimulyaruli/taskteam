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

// ── Cek apakah username adalah admin ──
const GET_ADMIN_USER_BY_USERNAME = `
  SELECT u.id, u.username
  FROM users u
  INNER JOIN user_roles ur ON ur.user_id = u.id
  INNER JOIN roles r ON r.id = ur.role_id
  WHERE u.username = ? AND r.name = 'admin' AND u.deleted_at IS NULL
  LIMIT 1
`;

// ── Insert token reset password ──
const INSERT_RESET_TOKEN = `
  INSERT INTO password_reset_tokens (id, user_id, token_hash, expired_at)
  VALUES (?, ?, ?, ?)
`;

// ── Cari token reset yang masih valid ──
const GET_VALID_RESET_TOKEN = `
  SELECT id, user_id, expired_at, used_at
  FROM password_reset_tokens
  WHERE token_hash = ?
  LIMIT 1
`;

// ── Tandai token sudah dipakai ──
const MARK_TOKEN_USED = `
  UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?
`;

module.exports = {
  GET_USER_BY_ID,
  UPDATE_USERNAME,
  UPDATE_PASSWORD,
  UPDATE_AVATAR,
  REMOVE_AVATAR,
  GET_AVATAR_BY_ID,
  GET_ADMIN_USER_BY_USERNAME,
  INSERT_RESET_TOKEN,
  GET_VALID_RESET_TOKEN,
  MARK_TOKEN_USED,
};