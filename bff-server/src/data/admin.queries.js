/**
 * SQL query constants for admin user management operations.
 * All queries use parameterized placeholders (?) to prevent SQL injection.
 */

// ── List semua user beserta role ──
const LIST_ALL_USERS = `
  SELECT
    u.id,
    u.username,
    u.avatar,
    u.is_active,
    u.created_at,
    r.name AS role
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  WHERE u.deleted_at IS NULL
  ORDER BY u.created_at ASC
`;

// ── Get satu user by id ──
const GET_USER_BY_ID = `
  SELECT
    u.id,
    u.username,
    u.avatar,
    u.is_active,
    u.created_at,
    r.name AS role
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  WHERE u.id = ?
  LIMIT 1
`;

// ── Cek username sudah dipakai atau belum ──
const CHECK_USERNAME_EXISTS = `
  SELECT id FROM users WHERE username = ? LIMIT 1
`;

// ── Get role id by name ──
const GET_ROLE_ID_BY_NAME = `
  SELECT id FROM roles WHERE name = ? LIMIT 1
`;

// ── Insert user baru ──
const INSERT_USER = `
  INSERT INTO users (id, username, password_hash, is_active, is_verified)
  VALUES (?, ?, ?, ?, 1)
`;

// ── Assign role ke user ──
const INSERT_USER_ROLE = `
  INSERT INTO user_roles (id, user_id, role_id)
  VALUES (?, ?, ?)
`;

// ── Hapus role lama (sebelum pasang role baru saat edit) ──
const DELETE_USER_ROLE = `
  DELETE FROM user_roles WHERE user_id = ?
`;

// ── Update username & status aktif ──
const UPDATE_USER_INFO = `
  UPDATE users SET username = ?, is_active = ? WHERE id = ?
`;

// ── Update password user (oleh admin) ──
const UPDATE_USER_PASSWORD = `
  UPDATE users SET password_hash = ? WHERE id = ?
`;

// ── Soft delete user ──
const SOFT_DELETE_USER = `
  UPDATE users SET deleted_at = NOW() WHERE id = ?
`;

module.exports = {
  LIST_ALL_USERS,
  GET_USER_BY_ID,
  CHECK_USERNAME_EXISTS,
  GET_ROLE_ID_BY_NAME,
  INSERT_USER,
  INSERT_USER_ROLE,
  DELETE_USER_ROLE,
  UPDATE_USER_INFO,
  UPDATE_USER_PASSWORD,
  SOFT_DELETE_USER,
};