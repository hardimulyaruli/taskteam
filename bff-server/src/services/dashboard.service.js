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
    assignee: task.assignee ?? task.assignee_username ?? task.username ?? 'team',
    deadline: deadlineValue ? String(deadlineValue).slice(0, 10) : '-',
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

function buildOverview(tasks, users, currentUser) {
  const filteredTasks =
    currentUser.role === 'team'
      ? tasks.filter((task) => task.assignee === currentUser.username || task.assignee === 'team')
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
      query('SELECT * FROM tasks ORDER BY id DESC'),
      query('SELECT * FROM users ORDER BY id ASC'),
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
