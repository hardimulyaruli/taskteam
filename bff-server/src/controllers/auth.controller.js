const { loginSchema } = require('../schemas/auth.schema');
const {
  authenticateUser,
  getUserById,
  updateUsername,
  updatePassword,
  updateAvatar,
  removeAvatar,
  getAvatarFilename,
} = require('../services/auth.service');
const { createToken } = require('../utils/token');
const fs = require('fs');
const path = require('path');
const { AVATAR_DIR } = require('../middleware/avatarUpload');

async function login(req, res, next) {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await authenticateUser(value.username, value.password);
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const token = createToken(user);
    return res.status(200).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

// ======================
// GET /auth/me
// Ambil data profile terbaru (termasuk avatar)
// ======================
async function getMe(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// ======================
// PUT /auth/profile
// Update nama lengkap / username
// ======================
async function updateProfile(req, res, next) {
  try {
    const { username } = req.body;
    const user = await updateUsername(req.user.id, username);
    return res.status(200).json({ user });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// ======================
// PUT /auth/password
// Update password
// ======================
async function changePassword(req, res, next) {
  try {
    const { password } = req.body;
    const result = await updatePassword(req.user.id, password);
    return res.status(200).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// ======================
// POST /auth/avatar
// Upload / ganti foto profil
// ======================
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    // Hapus avatar lama jika ada
    const oldAvatar = await getAvatarFilename(req.user.id);
    if (oldAvatar) {
      const oldPath = path.join(AVATAR_DIR, oldAvatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const user = await updateAvatar(req.user.id, req.file.filename);
    return res.status(200).json({ user });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// ======================
// DELETE /auth/avatar
// Hapus foto profil
// ======================
async function deleteAvatar(req, res, next) {
  try {
    const oldAvatar = await getAvatarFilename(req.user.id);
    if (oldAvatar) {
      const oldPath = path.join(AVATAR_DIR, oldAvatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const user = await removeAvatar(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
};