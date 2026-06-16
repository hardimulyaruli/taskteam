const { query } = require('../adapters/mysql');
const { demoUsers } = require('../data/demo-data');
const Q = require('../data/auth.queries');

function isRecoverableDbError(error) {
  return [
    'ER_NO_SUCH_TABLE',
    'ER_BAD_FIELD_ERROR',
    'ER_PARSE_ERROR'
  ].includes(error.code);
}

function normalizeRole(role) {
  const value = String(role || 'team').toLowerCase();

  if (
    value === 'admin' ||
    value === 'manager' ||
    value === 'team'
  ) {
    return value;
  }

  return 'team';
}

function toPublicUser(rawUser) {
  return {
    id: rawUser.id,
    username: rawUser.username,
    name: rawUser.username,
    role: normalizeRole(rawUser.role),
    avatar: rawUser.avatar || null,
    createdAt: rawUser.created_at || null,
  };
}

function fromDbUser(dbUser) {
  return {
    id: dbUser.id,
    username: dbUser.username,
    role: dbUser.role,

    password:
      dbUser.password_hash ??
      dbUser.password ??
      '',
  };
}

async function authenticateUser(username, password) {

  try {

    const rows = await query(`
      SELECT
      u.id,
      u.username,
      u.password_hash,
      r.name AS role

      FROM users u

      LEFT JOIN user_roles ur
      ON ur.user_id = u.id

      LEFT JOIN roles r
      ON r.id = ur.role_id

      WHERE u.username = ?

      LIMIT 1
    `,[username]);

    const dbUser = rows[0]
      ? fromDbUser(rows[0])
      : null;

    if (!dbUser) {
      return null;
    }

    if (dbUser.password !== password) {
      return null;
    }

    return toPublicUser(dbUser);

  } catch(error){

    if(!isRecoverableDbError(error)){
      throw error;
    }

  }

  const demoUser = demoUsers.find(
    user =>
      user.username === username &&
      user.password === password
  );

  return demoUser
    ? toPublicUser(demoUser)
    : null;
}

// ======================
// Get user by id (untuk refresh data profile)
// ======================
async function getUserById(userId) {
  const rows = await query(Q.GET_USER_BY_ID, [userId]);
  if (!rows.length) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
  }
  return toPublicUser(rows[0]);
}

// ======================
// Update username / nama lengkap
// ======================
async function updateUsername(userId, newUsername) {
  if (!newUsername || !newUsername.trim()) {
    throw Object.assign(new Error('Username tidak boleh kosong'), { statusCode: 400 });
  }

  await query(Q.UPDATE_USERNAME, [newUsername.trim(), userId]);
  return getUserById(userId);
}

// ======================
// Update password
// ======================
async function updatePassword(userId, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw Object.assign(
      new Error('Password baru minimal 6 karakter'),
      { statusCode: 400 }
    );
  }

  // NOTE: password disimpan plain sesuai pola authenticateUser yang sudah ada
  // (dbUser.password !== password, tanpa hashing).
  await query(Q.UPDATE_PASSWORD, [newPassword, userId]);
  return { message: 'Password berhasil diubah' };
}

// ======================
// Update avatar
// ======================
async function updateAvatar(userId, filename) {
  await query(Q.UPDATE_AVATAR, [filename, userId]);
  return getUserById(userId);
}

// ======================
// Hapus avatar
// ======================
async function removeAvatar(userId) {
  await query(Q.REMOVE_AVATAR, [userId]);
  return getUserById(userId);
}

async function getAvatarFilename(userId) {
  const rows = await query(Q.GET_AVATAR_BY_ID, [userId]);
  return rows[0]?.avatar || null;
}

module.exports = {
  authenticateUser,
  getUserById,
  updateUsername,
  updatePassword,
  updateAvatar,
  removeAvatar,
  getAvatarFilename,
};