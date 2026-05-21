const crypto = require('crypto');
const { query, transaction } = require('../adapters/mysql');
const Q = require('../data/task.queries');

// ── Helpers ──

function generateId() {
  return crypto.randomUUID();
}

function formatDeadline(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function mapTaskRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    priorityColor: row.priority_color || '#f59e0b',
    assignee: row.assignees || '',
    deadline: formatDeadline(row.deadline),
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Lookup helpers ──

async function lookupStatusId(statusName, conn) {
  const rows = conn
    ? (await conn.execute(Q.GET_STATUS_BY_NAME, [statusName]))[0]
    : await query(Q.GET_STATUS_BY_NAME, [statusName]);

  if (!rows.length) {
    throw Object.assign(new Error(`Status '${statusName}' tidak ditemukan.`), { statusCode: 400 });
  }
  return rows[0].id;
}

async function lookupPriorityId(priorityName, conn) {
  const rows = conn
    ? (await conn.execute(Q.GET_PRIORITY_BY_NAME, [priorityName]))[0]
    : await query(Q.GET_PRIORITY_BY_NAME, [priorityName]);

  if (!rows.length) {
    throw Object.assign(new Error(`Prioritas '${priorityName}' tidak ditemukan.`), { statusCode: 400 });
  }
  return rows[0].id;
}

async function lookupUserId(username, conn) {
  if (!username) return null;

  const rows = conn
    ? (await conn.execute(Q.GET_USER_BY_USERNAME, [username]))[0]
    : await query(Q.GET_USER_BY_USERNAME, [username]);

  return rows.length ? rows[0].id : null;
}

// ── Service functions ──

/**
 * Get all tasks. For team role, only return tasks assigned to the user.
 */
async function getAllTasks(currentUser) {
  let rows;

  if (currentUser.role === 'team') {
    const userId = await lookupUserId(currentUser.username);
    if (!userId) return [];
    rows = await query(Q.LIST_TASKS_BY_ASSIGNEE, [userId]);
  } else {
    rows = await query(Q.LIST_TASKS);
  }

  return rows.map(mapTaskRow);
}

/**
 * Get a single task by ID.
 */
async function getTaskById(taskId, currentUser) {
  const rows = await query(Q.GET_TASK_BY_ID, [taskId]);

  if (!rows.length) {
    throw Object.assign(new Error('Tugas tidak ditemukan.'), { statusCode: 404 });
  }

  const task = mapTaskRow(rows[0]);

  // Team members can only view tasks assigned to them
  if (currentUser.role === 'team') {
    const assignees = (task.assignee || '').split(',').map(s => s.trim());
    if (!assignees.includes(currentUser.username) && !assignees.includes('team')) {
      throw Object.assign(new Error('Anda tidak memiliki akses ke tugas ini.'), { statusCode: 403 });
    }
  }

  return task;
}

/**
 * Create a new task. Only managers should call this (enforced at route level).
 * Uses transaction for atomicity: tasks + task_assignments.
 */
async function createTask(data, currentUser) {
  const taskId = generateId();
  const DEFAULT_PROJECT_ID = 'default-project';

  await transaction(async (conn) => {
    const statusId = await lookupStatusId(data.status || 'To Do', conn);
    const priorityId = await lookupPriorityId(data.priority || 'Sedang', conn);
    const creatorId = (await lookupUserId(currentUser.username, conn)) || currentUser.id;
    const deadlineValue = data.deadline || null;

    await conn.execute(Q.INSERT_TASK, [
      taskId,
      DEFAULT_PROJECT_ID,
      data.title,
      data.description || '',
      statusId,
      priorityId,
      creatorId,
      deadlineValue,
    ]);

    // Assign task to the specified user (or creator if none specified)
    const assigneeUsername = data.assignee || currentUser.username;
    const assigneeId = await lookupUserId(assigneeUsername, conn);

    if (assigneeId) {
      await conn.execute(Q.INSERT_ASSIGNMENT, [taskId, assigneeId]);
    }
  });

  // Return the created task
  return getTaskById(taskId, currentUser);
}

/**
 * Update a task (full update). Only managers should call this.
 */
async function updateTask(taskId, data, currentUser) {
  // Verify task exists
  const existing = await query(Q.GET_TASK_BY_ID, [taskId]);
  if (!existing.length) {
    throw Object.assign(new Error('Tugas tidak ditemukan.'), { statusCode: 404 });
  }

  const current = existing[0];

  await transaction(async (conn) => {
    const statusId = data.status
      ? await lookupStatusId(data.status, conn)
      : (await conn.execute(Q.GET_STATUS_BY_NAME, [current.status]))[0][0]?.id;

    const priorityId = data.priority
      ? await lookupPriorityId(data.priority, conn)
      : (await conn.execute(Q.GET_PRIORITY_BY_NAME, [current.priority]))[0][0]?.id;

    const title = data.title ?? current.title;
    const description = data.description ?? (current.description || '');
    const deadline = data.deadline !== undefined ? data.deadline : current.deadline;

    await conn.execute(Q.UPDATE_TASK, [
      title,
      description,
      statusId,
      priorityId,
      deadline || null,
      taskId,
    ]);

    // Update assignment if assignee changed
    if (data.assignee !== undefined) {
      await conn.execute(Q.DELETE_ASSIGNMENTS, [taskId]);
      const newAssigneeId = await lookupUserId(data.assignee, conn);
      if (newAssigneeId) {
        await conn.execute(Q.INSERT_ASSIGNMENT, [taskId, newAssigneeId]);
      }
    }
  });

  return getTaskById(taskId, currentUser);
}

/**
 * Update only the status of a task.
 * Team members can only update status of tasks assigned to them.
 */
async function updateTaskStatus(taskId, status, currentUser) {
  // Verify task exists
  const existing = await query(Q.GET_TASK_BY_ID, [taskId]);
  if (!existing.length) {
    throw Object.assign(new Error('Tugas tidak ditemukan.'), { statusCode: 404 });
  }

  // If team member, verify assignment
  if (currentUser.role === 'team') {
    const userId = await lookupUserId(currentUser.username);
    if (!userId) {
      throw Object.assign(new Error('User tidak ditemukan.'), { statusCode: 404 });
    }

    const assigned = await query(Q.CHECK_ASSIGNMENT, [taskId, userId]);
    if (!assigned.length) {
      throw Object.assign(new Error('Anda tidak ditugaskan pada tugas ini.'), { statusCode: 403 });
    }
  }

  const statusId = await lookupStatusId(status);
  await query(Q.UPDATE_TASK_STATUS, [statusId, taskId]);

  return getTaskById(taskId, currentUser);
}

/**
 * Soft-delete a task. Only managers should call this.
 */
async function deleteTask(taskId) {
  const existing = await query(Q.GET_TASK_BY_ID, [taskId]);
  if (!existing.length) {
    throw Object.assign(new Error('Tugas tidak ditemukan.'), { statusCode: 404 });
  }

  await query(Q.SOFT_DELETE_TASK, [taskId]);
  return { message: 'Tugas berhasil dihapus.' };
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
