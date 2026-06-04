const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { upload, handleUploadError } = require('../middleware/upload');
const submissionCtrl = require('../controllers/submission.controller');

const router = express.Router();

// Semua route butuh login
router.use(authenticate);

// POST /tasks/:id/submissions — upload file (team only, maks 5 file)
router.post(
  '/tasks/:id/submissions',
  authorize('team'),
  upload.array('files', 5),
  handleUploadError,
  submissionCtrl.upload
);

// GET /tasks/:id/submissions — list submissions (team + manager)
router.get(
  '/tasks/:id/submissions',
  authorize('team', 'manager'),
  submissionCtrl.list
);

// DELETE /tasks/:id/submissions/:subId — hapus submission (team pemilik / manager)
router.delete(
  '/tasks/:id/submissions/:subId',
  authorize('team', 'manager'),
  submissionCtrl.remove
);

// GET /submissions/:subId/download — download file (team + manager)
router.get(
  '/submissions/:subId/download',
  authorize('team', 'manager'),
  submissionCtrl.download
);

module.exports = router;