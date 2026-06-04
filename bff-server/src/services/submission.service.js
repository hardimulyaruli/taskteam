const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { query } = require('../adapters/mysql');
const Q = require('../data/submission.queries');
const TaskQ = require('../data/task.queries');
const { UPLOAD_DIR } = require('../middleware/upload');

// ======================
// Helper
// ======================

function mapSubmissionRow(row) {
  return {
    id:           row.id,
    taskId:       row.task_id,
    filename:     row.filename,
    originalName: row.original_name,
    mimetype:     row.mimetype,
    size:         row.size,
    uploadedBy:   row.uploaded_by,
    userId:       row.user_id,
    uploadedAt:   row.uploaded_at,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ======================
// Cek task exists & akses
// ======================

async function assertTaskAccess(taskId, currentUser) {
  const rows = await query(TaskQ.GET_TASK_BY_ID, [taskId]);

  if (!rows.length) {
    throw Object.assign(new Error('Task tidak ditemukan'), { statusCode: 404 });
  }

  // Jika role team, cek apakah dia di-assign ke task ini
  if (currentUser.role === 'team') {
    const assigned = await query(TaskQ.CHECK_ASSIGNMENT, [taskId, currentUser.id]);
    if (!assigned.length) {
      throw Object.assign(
        new Error('Anda tidak memiliki akses ke task ini'),
        { statusCode: 403 }
      );
    }
  }

  return rows[0];
}

// ======================
// Upload submission
// ======================

async function uploadSubmissions(taskId, files, currentUser) {
  // Hanya role team yang boleh upload
  if (currentUser.role !== 'team') {
    throw Object.assign(
      new Error('Hanya team yang dapat mengupload submission'),
      { statusCode: 403 }
    );
  }

  await assertTaskAccess(taskId, currentUser);

  if (!files || files.length === 0) {
    throw Object.assign(new Error('Tidak ada file yang diupload'), { statusCode: 400 });
  }

  const inserted = [];

  for (const file of files) {
    const id = crypto.randomUUID();
    await query(Q.INSERT_SUBMISSION, [
      id,
      taskId,
      currentUser.id,
      file.filename,       // nama uuid di server
      file.originalname,   // nama asli
      file.mimetype,
      file.size,
    ]);
    inserted.push(id);
  }

  // Return semua submission yang baru diinsert
  const result = [];
  for (const id of inserted) {
    const rows = await query(Q.GET_SUBMISSION_BY_ID, [id]);
    if (rows.length) result.push(mapSubmissionRow(rows[0]));
  }

  return result;
}

// ======================
// List submissions
// ======================

async function getSubmissions(taskId, currentUser) {
  await assertTaskAccess(taskId, currentUser);

  const rows = await query(Q.LIST_SUBMISSIONS_BY_TASK, [taskId]);
  return rows.map(row => ({
    ...mapSubmissionRow(row),
    sizeFormatted: formatBytes(row.size),
  }));
}

// ======================
// Get single submission (untuk download)
// ======================

async function getSubmissionById(submissionId) {
  const rows = await query(Q.GET_SUBMISSION_BY_ID, [submissionId]);
  if (!rows.length) {
    throw Object.assign(new Error('Submission tidak ditemukan'), { statusCode: 404 });
  }
  return mapSubmissionRow(rows[0]);
}

// ======================
// Delete submission
// ======================

async function deleteSubmission(submissionId, currentUser) {
  const rows = await query(Q.GET_SUBMISSION_BY_ID, [submissionId]);

  if (!rows.length) {
    throw Object.assign(new Error('Submission tidak ditemukan'), { statusCode: 404 });
  }

  const sub = rows[0];

  // Manager bisa hapus semua, team hanya miliknya sendiri
  if (currentUser.role === 'team' && sub.user_id !== currentUser.id) {
    throw Object.assign(
      new Error('Anda tidak bisa menghapus submission milik orang lain'),
      { statusCode: 403 }
    );
  }

  // Hapus file fisik dari disk
  const filePath = path.join(UPLOAD_DIR, sub.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await query(Q.DELETE_SUBMISSION, [submissionId]);
  return { message: 'Submission berhasil dihapus' };
}

module.exports = {
  uploadSubmissions,
  getSubmissions,
  getSubmissionById,
  deleteSubmission,
};