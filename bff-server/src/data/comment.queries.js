/**
 * SQL query constants for task comment operations.
 * All queries use parameterized placeholders (?) to prevent SQL injection.
 */

// ── Insert comment ──
const INSERT_COMMENT = `
  INSERT INTO comments (id, task_id, user_id, content)
  VALUES (?, ?, ?, ?)
`;

// ── List comments by task id (with author info) ──
const LIST_COMMENTS_BY_TASK = `
  SELECT
    c.id,
    c.task_id,
    c.content,
    c.created_at,
    u.username AS username,
    u.id       AS user_id
  FROM comments c
  INNER JOIN users u ON u.id = c.user_id
  WHERE c.task_id = ?
  ORDER BY c.created_at ASC
`;

// ── Get single comment by id ──
const GET_COMMENT_BY_ID = `
  SELECT
    c.id,
    c.task_id,
    c.content,
    c.created_at,
    u.username AS username,
    u.id       AS user_id
  FROM comments c
  INNER JOIN users u ON u.id = c.user_id
  WHERE c.id = ?
  LIMIT 1
`;

// ── Delete comment by id ──
const DELETE_COMMENT = `
  DELETE FROM comments WHERE id = ?
`;

module.exports = {
  INSERT_COMMENT,
  LIST_COMMENTS_BY_TASK,
  GET_COMMENT_BY_ID,
  DELETE_COMMENT,
};