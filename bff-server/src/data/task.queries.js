/**
 * SQL query constants for task CRUD operations.
 * All queries use parameterized placeholders (?) to prevent SQL injection.
 * JOIN queries are used to avoid N+1 problems.
 */

// ── List all tasks with status, priority and assignee info (single JOIN query) ──
const LIST_TASKS = `
  SELECT
    t.id,
    t.title,
    t.description,
    ts.name   AS status,
    tp.name   AS priority,
    tp.color  AS priority_color,
    t.due_date AS deadline,
    t.created_by,
    t.created_at,
    t.updated_at,
    GROUP_CONCAT(u.username SEPARATOR ',') AS assignees
  FROM tasks t
  INNER JOIN task_statuses   ts ON ts.id = t.status_id
  INNER JOIN task_priorities tp ON tp.id = t.priority_id
  LEFT  JOIN task_assignments ta ON ta.task_id = t.id
  LEFT  JOIN users            u ON u.id = ta.user_id
  WHERE t.deleted_at IS NULL
  GROUP BY t.id
  ORDER BY t.created_at DESC
`;

// ── List tasks assigned to a specific user or the entire 'team' ──
const LIST_TASKS_BY_ASSIGNEE = `
  SELECT
    t.id,
    t.title,
    t.description,
    ts.name   AS status,
    tp.name   AS priority,
    tp.color  AS priority_color,
    t.due_date AS deadline,
    t.created_by,
    t.created_at,
    t.updated_at,
    GROUP_CONCAT(u2.username SEPARATOR ',') AS assignees
  FROM tasks t
  INNER JOIN task_statuses    ts ON ts.id = t.status_id
  INNER JOIN task_priorities  tp ON tp.id = t.priority_id
  INNER JOIN task_assignments ta2 ON ta2.task_id = t.id AND (ta2.user_id = ? OR ta2.user_id = (SELECT id FROM users WHERE username = 'team' LIMIT 1))
  LEFT  JOIN task_assignments ta ON ta.task_id = t.id
  LEFT  JOIN users            u2 ON u2.id = ta.user_id
  WHERE t.deleted_at IS NULL
  GROUP BY t.id
  ORDER BY t.created_at DESC
`;

// ── Get single task by ID ──
const GET_TASK_BY_ID = `
  SELECT
    t.id,
    t.title,
    t.description,
    ts.name   AS status,
    tp.name   AS priority,
    tp.color  AS priority_color,
    t.due_date AS deadline,
    t.created_by,
    t.created_at,
    t.updated_at,
    GROUP_CONCAT(u.username SEPARATOR ',') AS assignees
  FROM tasks t
  INNER JOIN task_statuses   ts ON ts.id = t.status_id
  INNER JOIN task_priorities tp ON tp.id = t.priority_id
  LEFT  JOIN task_assignments ta ON ta.task_id = t.id
  LEFT  JOIN users            u ON u.id = ta.user_id
  WHERE t.id = ? AND t.deleted_at IS NULL
  GROUP BY t.id
`;

// ── Lookup helpers ──
const GET_STATUS_BY_NAME   = 'SELECT id FROM task_statuses WHERE name = ? LIMIT 1';
const GET_PRIORITY_BY_NAME = 'SELECT id FROM task_priorities WHERE name = ? LIMIT 1';
const GET_USER_BY_USERNAME = 'SELECT id FROM users WHERE username = ? LIMIT 1';

// ── Insert task ──
const INSERT_TASK = `
  INSERT INTO tasks (id, project_id, title, description, status_id, priority_id, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

// ── Insert task assignment ──
const INSERT_ASSIGNMENT = `
  INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)
`;

// ── Delete all assignments for a task (used before re-assigning) ──
const DELETE_ASSIGNMENTS = 'DELETE FROM task_assignments WHERE task_id = ?';

// ── Update task fields ──
const UPDATE_TASK = `
  UPDATE tasks
  SET title = ?, description = ?, status_id = ?, priority_id = ?, due_date = ?, updated_at = NOW()
  WHERE id = ? AND deleted_at IS NULL
`;

// ── Update status only ──
const UPDATE_TASK_STATUS = `
  UPDATE tasks SET status_id = ?, updated_at = NOW()
  WHERE id = ? AND deleted_at IS NULL
`;

// ── Soft delete ──
const SOFT_DELETE_TASK = `
  UPDATE tasks SET deleted_at = NOW()
  WHERE id = ? AND deleted_at IS NULL
`;

// ── Check if user is assigned to task (or if the task is assigned to the entire 'team') ──
const CHECK_ASSIGNMENT = `
  SELECT 1 FROM task_assignments 
  WHERE task_id = ? AND (user_id = ? OR user_id = (SELECT id FROM users WHERE username = 'team' LIMIT 1)) 
  LIMIT 1
`;

module.exports = {
  LIST_TASKS,
  LIST_TASKS_BY_ASSIGNEE,
  GET_TASK_BY_ID,
  GET_STATUS_BY_NAME,
  GET_PRIORITY_BY_NAME,
  GET_USER_BY_USERNAME,
  INSERT_TASK,
  INSERT_ASSIGNMENT,
  DELETE_ASSIGNMENTS,
  UPDATE_TASK,
  UPDATE_TASK_STATUS,
  SOFT_DELETE_TASK,
  CHECK_ASSIGNMENT,
};
