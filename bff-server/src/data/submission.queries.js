/**
 * SQL query constants for task submission operations.
 * All queries use parameterized placeholders (?) to prevent SQL injection.
 */

// ── Insert submission ──
const INSERT_SUBMISSION = `
  INSERT INTO task_submissions (id, task_id, user_id, filename, original_name, mimetype, size)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// ── List submissions by task id (with uploader info) ──
const LIST_SUBMISSIONS_BY_TASK = `
  SELECT
    ts.id,
    ts.task_id,
    ts.filename,
    ts.original_name,
    ts.mimetype,
    ts.size,
    ts.uploaded_at,
    u.username  AS uploaded_by,
    u.id        AS user_id
  FROM task_submissions ts
  INNER JOIN users u ON u.id = ts.user_id
  WHERE ts.task_id = ?
  ORDER BY ts.uploaded_at DESC
`;

// ── Get single submission by id ──
const GET_SUBMISSION_BY_ID = `
  SELECT
    ts.id,
    ts.task_id,
    ts.filename,
    ts.original_name,
    ts.mimetype,
    ts.size,
    ts.uploaded_at,
    u.username  AS uploaded_by,
    u.id        AS user_id
  FROM task_submissions ts
  INNER JOIN users u ON u.id = ts.user_id
  WHERE ts.id = ?
  LIMIT 1
`;

// ── Delete submission by id ──
const DELETE_SUBMISSION = `
  DELETE FROM task_submissions WHERE id = ?
`;

// ── Check if user owns submission ──
const CHECK_SUBMISSION_OWNER = `
  SELECT 1 FROM task_submissions WHERE id = ? AND user_id = ? LIMIT 1
`;

module.exports = {
  INSERT_SUBMISSION,
  LIST_SUBMISSIONS_BY_TASK,
  GET_SUBMISSION_BY_ID,
  DELETE_SUBMISSION,
  CHECK_SUBMISSION_OWNER,
};