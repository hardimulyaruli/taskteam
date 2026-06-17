const crypto = require('crypto');
const { query } = require('../adapters/mysql');
const Q = require('../data/admin.queries');

// ======================
// Helper
// ======================

function mapUserRow(row) {
  return {
    id:        row.id,
    name:      row.username,
    username:  row.username,
    role:      String(row.role || 'team').toLowerCase(),
    status:    row.is_active ? 'Aktif' : 'Nonaktif',
    avatar:    row.avatar || null,
    createdAt: row.created_at,
  };
}

async function getRoleId(roleName) {
  const rows = await query(Q.GET_ROLE_ID_BY_NAME, [roleName]);
  if (!rows.length) {
    throw Object.assign(
      new Error(`Role "${roleName}" tidak ditemukan di sistem`),
      { statusCode: 400 }
    );
  }
  return rows[0].id;
}

// ======================
// List semua user
// ======================
async function listUsers() {
  const rows = await query(Q.LIST_ALL_USERS);
  return rows.map(mapUserRow);
}

// ======================
// Buat user baru
// ======================
async function createUser({ name, username, password, role, status }) {
  if (!username || !username.trim()) {
    throw Object.assign(new Error('Username tidak boleh kosong'), { statusCode: 400 });
  }
  if (!password || password.length < 6) {
    throw Object.assign(new Error('Password minimal 6 karakter'), { statusCode: 400 });
  }

  const existing = await query(Q.CHECK_USERNAME_EXISTS, [username.trim()]);
  if (existing.length) {
    throw Object.assign(new Error('Username sudah digunakan'), { statusCode: 409 });
  }

  const roleId = await getRoleId(String(role || 'team').toLowerCase());
  const isActive = status === 'Nonaktif' ? 0 : 1;

  const id = crypto.randomUUID();
  await query(Q.INSERT_USER, [id, username.trim(), password, isActive]);
  await query(Q.INSERT_USER_ROLE, [crypto.randomUUID(), id, roleId]);

  const rows = await query(Q.GET_USER_BY_ID, [id]);
  return mapUserRow(rows[0]);
}

// ======================
// Update user (info + role)
// ======================
async function updateUser(userId, { username, role, status, password }) {
  const existingRows = await query(Q.GET_USER_BY_ID, [userId]);
  if (!existingRows.length) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
  }

  if (username && username.trim()) {
    const isActive = status === 'Nonaktif' ? 0 : 1;
    await query(Q.UPDATE_USER_INFO, [username.trim(), isActive, userId]);
  }

  if (role) {
    const roleId = await getRoleId(String(role).toLowerCase());
    await query(Q.DELETE_USER_ROLE, [userId]);
    await query(Q.INSERT_USER_ROLE, [crypto.randomUUID(), userId, roleId]);
  }

  if (password && password.trim()) {
    if (password.length < 6) {
      throw Object.assign(new Error('Password minimal 6 karakter'), { statusCode: 400 });
    }
    await query(Q.UPDATE_USER_PASSWORD, [password, userId]);
  }

  const rows = await query(Q.GET_USER_BY_ID, [userId]);
  return mapUserRow(rows[0]);
}

// ======================
// Hapus user (soft delete)
// ======================
async function deleteUser(userId) {
  const rows = await query(Q.GET_USER_BY_ID, [userId]);
  if (!rows.length) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
  }

  await query(Q.SOFT_DELETE_USER, [userId]);
  return { message: 'User berhasil dihapus' };
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};