const { query } = require('../adapters/mysql');
const { buildActivities, demoTasks, demoUsers } = require('../data/demo-data');

function isRecoverableDbError(error) {
  return ['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR', 'ER_PARSE_ERROR'].includes(error.code);
}

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'done' || value === 'selesai') return 'Selesai';
  if (value === 'in_progress' || value === 'dikerjakan') return 'Dikerjakan';
  return 'To Do';
}

function mapDbTask(task, index) {
  const deadlineValue = task.deadline ?? task.due_date ?? task.dueDate;

  return {
    id: task.id ?? task.task_id ?? `task-${index + 1}`,
    title: task.title ?? task.task_name ?? `Task ${index + 1}`,
    status: normalizeStatus(task.status),
    assignee: task.assignees ?? task.assignee ?? task.assignee_username ?? task.username ?? 'team',
    deadline: deadlineValue ? String(deadlineValue).slice(0, 10) : '-',
    updatedAt: task.updated_at ?? null,
  };
}

function mapDbUser(user, index) {
  return {
    id: user.id ?? user.user_id ?? `user-${index + 1}`,
    username: user.username ?? `user${index + 1}`,
    name: user.name ?? user.full_name ?? user.username ?? `User ${index + 1}`,
    role: user.role ?? 'team',
  };
}

// ── SQL query with proper JOINs (matching task.service.js pattern) ──
const LIST_DASHBOARD_TASKS = `
  SELECT
    t.id,
    t.title,
    t.description,
    ts.name   AS status,
    tp.name   AS priority,
    tp.color  AS priority_color,
    t.due_date AS deadline,
    t.is_revisi,
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

const LIST_DASHBOARD_USERS = `
  SELECT
    u.id,
    u.username,
    r.name AS role
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  WHERE u.deleted_at IS NULL
  ORDER BY u.username ASC
`;

function buildOverview(tasks, users, currentUser) {
  const filteredTasks =
    currentUser.role === 'team'
      ? tasks.filter((task) => {
          // assignee bisa berisi comma-separated usernames (dari GROUP_CONCAT)
          const assignees = String(task.assignee || '').split(',').map(s => s.trim().toLowerCase());
          return assignees.includes(currentUser.username.toLowerCase()) || assignees.includes('team');
        })
      : tasks;

  return {
    tasks: filteredTasks,
    users,
    activities: buildActivities(filteredTasks),
  };
}

async function getDashboardOverview(currentUser) {
  try {
    const [taskRows, userRows] = await Promise.all([
      query(LIST_DASHBOARD_TASKS),
      query(LIST_DASHBOARD_USERS),
    ]);

    const tasks = taskRows.map(mapDbTask);
    const users = userRows.map(mapDbUser);
    return buildOverview(tasks, users, currentUser);
  } catch (error) {
    if (!isRecoverableDbError(error)) {
      throw error;
    }

    return buildOverview(demoTasks, demoUsers.map(mapDbUser), currentUser);
  }
}

module.exports = {
  getDashboardOverview,
};
