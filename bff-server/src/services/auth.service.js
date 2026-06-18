const crypto = require('crypto');
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
      u.is_active,
      r.name AS role

      FROM users u

      LEFT JOIN user_roles ur
      ON ur.user_id = u.id

      LEFT JOIN roles r
      ON r.id = ur.role_id

      WHERE u.username = ?
      AND u.deleted_at IS NULL

      LIMIT 1
    `,[username]);

    const dbUser = rows[0]
      ? fromDbUser(rows[0])
      : null;

    if (!dbUser) {
      return null;
    }

    if (rows[0].is_active === 0) {
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

// ======================
// Generate kode reset 6 digit (mudah diketik manual untuk demo)
// ======================
function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// ======================
// Request reset password — HANYA untuk role admin
// ======================
async function requestPasswordReset(username) {
  if (!username || !username.trim()) {
    throw Object.assign(new Error('Username tidak boleh kosong'), { statusCode: 400 });
  }

  const rows = await query(Q.GET_ADMIN_USER_BY_USERNAME, [username.trim()]);

  if (!rows.length) {
    throw Object.assign(
      new Error('Username tidak ditemukan atau bukan akun Admin. Silakan hubungi Admin lain untuk reset password.'),
      { statusCode: 404 }
    );
  }

  const adminUser = rows[0];
  const code = generateResetCode();
  const tokenHash = hashCode(code);
  const tokenId = crypto.randomUUID();

  // Berlaku 15 menit
  const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

  await query(Q.INSERT_RESET_TOKEN, [tokenId, adminUser.id, tokenHash, expiredAt]);

  // NOTE: Di aplikasi nyata, 'code' ini dikirim lewat email.
  // Untuk keperluan demo tanpa server email, kode ditampilkan langsung ke pengguna.
  return { code, username: adminUser.username };
}

// ======================
// Reset password menggunakan kode
// ======================
async function resetPasswordWithToken(code, newPassword) {
  if (!code || !code.trim()) {
    throw Object.assign(new Error('Kode reset tidak boleh kosong'), { statusCode: 400 });
  }
  if (!newPassword || newPassword.length < 6) {
    throw Object.assign(new Error('Password baru minimal 6 karakter'), { statusCode: 400 });
  }

  const tokenHash = hashCode(code.trim());
  const rows = await query(Q.GET_VALID_RESET_TOKEN, [tokenHash]);

  if (!rows.length) {
    throw Object.assign(new Error('Kode reset tidak valid'), { statusCode: 400 });
  }

  const tokenRow = rows[0];

  if (tokenRow.used_at) {
    throw Object.assign(new Error('Kode reset sudah digunakan'), { statusCode: 400 });
  }

  if (new Date(tokenRow.expired_at) < new Date()) {
    throw Object.assign(new Error('Kode reset sudah kedaluwarsa'), { statusCode: 400 });
  }

  await query(Q.UPDATE_PASSWORD, [newPassword, tokenRow.user_id]);
  await query(Q.MARK_TOKEN_USED, [tokenRow.id]);

  return { message: 'Password berhasil direset. Silakan login dengan password baru.' };
}

module.exports = {
  authenticateUser,
  getUserById,
  updateUsername,
  updatePassword,
  updateAvatar,
  removeAvatar,
  getAvatarFilename,
  requestPasswordReset,
  resetPasswordWithToken,
};