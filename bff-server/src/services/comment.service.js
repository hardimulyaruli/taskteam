const crypto = require('crypto');
const { query } = require('../adapters/mysql');
const Q = require('../data/comment.queries');
const TaskQ = require('../data/task.queries');

// ======================
// Helper
// ======================

function mapCommentRow(row) {
  return {
    id:        row.id,
    taskId:    row.task_id,
    content:   row.content,
    createdAt: row.created_at,
    username:  row.username,
    userId:    row.user_id,
  };
}

// ======================
// Cek task exists & akses
// (sama seperti submission.service.js)
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
// List comments
// ======================

async function getComments(taskId, currentUser) {
  await assertTaskAccess(taskId, currentUser);

  const rows = await query(Q.LIST_COMMENTS_BY_TASK, [taskId]);
  return rows.map(mapCommentRow);
}

// ======================
// Add comment
// ======================

async function addComment(taskId, content, currentUser) {
  await assertTaskAccess(taskId, currentUser);

  if (!content || !content.trim()) {
    throw Object.assign(new Error('Komentar tidak boleh kosong'), { statusCode: 400 });
  }

  const id = crypto.randomUUID();
  await query(Q.INSERT_COMMENT, [id, taskId, currentUser.id, content.trim()]);

  const rows = await query(Q.GET_COMMENT_BY_ID, [id]);
  return mapCommentRow(rows[0]);
}

// ======================
// Delete comment
// ======================

async function deleteComment(commentId, currentUser) {
  const rows = await query(Q.GET_COMMENT_BY_ID, [commentId]);

  if (!rows.length) {
    throw Object.assign(new Error('Komentar tidak ditemukan'), { statusCode: 404 });
  }

  const comment = rows[0];

  // Manager bisa hapus semua komentar, user lain hanya miliknya sendiri
  if (currentUser.role !== 'manager' && comment.user_id !== currentUser.id) {
    throw Object.assign(
      new Error('Anda tidak bisa menghapus komentar milik orang lain'),
      { statusCode: 403 }
    );
  }

  await query(Q.DELETE_COMMENT, [commentId]);
  return { message: 'Komentar berhasil dihapus' };
}

module.exports = {
  getComments,
  addComment,
  deleteComment,
};