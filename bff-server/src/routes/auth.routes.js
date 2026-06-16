const express = require('express');
const { login, getMe, updateProfile, changePassword, uploadAvatar, deleteAvatar } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/authenticate');
const { avatarUpload, handleAvatarUploadError } = require('../middleware/avatarUpload');

const router = express.Router();

router.post('/login', login);

// Semua route di bawah butuh login
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.post('/avatar', authenticate, avatarUpload.single('avatar'), handleAvatarUploadError, uploadAvatar);
router.delete('/avatar', authenticate, deleteAvatar);

module.exports = router;