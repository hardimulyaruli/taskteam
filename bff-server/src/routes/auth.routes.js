const express = require('express');
const {
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/authenticate');
const { avatarUpload, handleAvatarUploadError } = require('../middleware/avatarUpload');

const router = express.Router();

router.post('/login', login);

// ── Reset password (publik, tanpa login) ──
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Semua route di bawah butuh login
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.post('/avatar', authenticate, avatarUpload.single('avatar'), handleAvatarUploadError, uploadAvatar);
router.delete('/avatar', authenticate, deleteAvatar);

module.exports = router;