const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const commentCtrl = require('../controllers/comment.controller');

const router = express.Router();

// Semua route butuh login
router.use(authenticate);

// GET /tasks/:id/comments — list komentar (team + manager)
router.get(
  '/tasks/:id/comments',
  authorize('team', 'manager'),
  commentCtrl.list
);

// POST /tasks/:id/comments — tambah komentar (team + manager)
router.post(
  '/tasks/:id/comments',
  authorize('team', 'manager'),
  commentCtrl.create
);

// DELETE /tasks/:id/comments/:commentId — hapus komentar (team pemilik / manager)
router.delete(
  '/tasks/:id/comments/:commentId',
  authorize('team', 'manager'),
  commentCtrl.remove
);

module.exports = router;