const crypto = require('crypto');
const { query, transaction } = require('../adapters/mysql');
const Q = require('../data/task.queries');

// ======================
// Helper
// ======================

function generateId() {
  return crypto.randomUUID();
}

function formatDeadline(value) {

  if (!value) return null;

  const d = new Date(value);

  if (isNaN(d.getTime())) {
    return null;
  }

  return d.toISOString().slice(0,10);
}

function mapTaskRow(row) {

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    priorityColor:
      row.priority_color || '#f59e0b',

    assignee:
      row.assignees || '',

    deadline:
      formatDeadline(
        row.deadline
      ),

    createdBy:
      row.created_by,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at
  };

}

// ======================
// Lookup
// ======================

async function lookupStatusId(
  statusName,
  conn
){

  const rows = conn
    ? (
        await conn.execute(
          Q.GET_STATUS_BY_NAME,
          [statusName]
        )
      )[0]

    : await query(
        Q.GET_STATUS_BY_NAME,
        [statusName]
      );

  if(!rows.length){

    throw Object.assign(
      new Error(
        `Status ${statusName} tidak ditemukan`
      ),
      {
        statusCode:400
      }
    );

  }

  return rows[0].id;

}

async function lookupPriorityId(
  priorityName,
  conn
){

  const rows = conn
    ? (
        await conn.execute(
          Q.GET_PRIORITY_BY_NAME,
          [priorityName]
        )
      )[0]

    : await query(
        Q.GET_PRIORITY_BY_NAME,
        [priorityName]
      );

  if(!rows.length){

    throw Object.assign(
      new Error(
        `Prioritas ${priorityName} tidak ditemukan`
      ),
      {
        statusCode:400
      }
    );

  }

  return rows[0].id;

}

async function lookupUserId(
  username,
  conn
){

  if(!username){
    return null;
  }

  const rows = conn
    ? (
        await conn.execute(
          Q.GET_USER_BY_USERNAME,
          [username]
        )
      )[0]

    : await query(
        Q.GET_USER_BY_USERNAME,
        [username]
      );

  if(!rows.length){
    return null;
  }

  return rows[0].id;

}

// ======================
// Get semua task
// ======================

async function getAllTasks(
  currentUser
){

  let rows;

  if(
    currentUser.role === 'team'
  ){

    const userId =
      await lookupUserId(
        currentUser.username
      );

    rows =
      await query(
        Q.LIST_TASKS_BY_ASSIGNEE,
        [userId]
      );

  }

  else{

    rows =
      await query(
        Q.LIST_TASKS
      );

  }

  return rows.map(
    mapTaskRow
  );

}

// ======================
// Get task by id
// ======================

async function getTaskById(
  taskId,
  currentUser
){

  const rows =
    await query(
      Q.GET_TASK_BY_ID,
      [taskId]
    );

  if(
    !rows.length
  ){

    throw Object.assign(
      new Error(
        'Task tidak ditemukan'
      ),
      {
        statusCode:404
      }
    );

  }

  return mapTaskRow(
    rows[0]
  );

}

// ======================
// CREATE TASK
// ======================

async function createTask(
  data,
  currentUser
){

  const taskId =
    generateId();

  const DEFAULT_PROJECT_ID =
    'a847a5bc-5746-11f1-886f-ce8e5c229585';

  await transaction(
    async(conn)=>{

      const statusId =
        await lookupStatusId(
          data.status || 'To Do',
          conn
        );

      const priorityId =
        await lookupPriorityId(
          data.priority || 'Sedang',
          conn
        );

      const creatorId =
        await lookupUserId(
          currentUser.username,
          conn
        );

      await conn.execute(
        Q.INSERT_TASK,
        [
          taskId,

          DEFAULT_PROJECT_ID,

          data.title,

          data.description || '',

          statusId,

          priorityId,

          creatorId,

          data.deadline || null
        ]
      );

      const assigneeId =
        await lookupUserId(
          data.assignee,
          conn
        );

      if(
        assigneeId
      ){

        await conn.execute(
          Q.INSERT_ASSIGNMENT,
          [
            taskId,
            assigneeId
          ]
        );

      }

    }
  );

  return await getTaskById(
    taskId,
    currentUser
  );

}

// ======================
// UPDATE TASK
// ======================

async function updateTask(
  taskId,
  data,
  currentUser
){

  const existing =
    await query(
      Q.GET_TASK_BY_ID,
      [taskId]
    );

  if(
    !existing.length
  ){

    throw Object.assign(
      new Error(
        'Task tidak ditemukan'
      ),
      {
        statusCode:404
      }
    );

  }

  const current =
    existing[0];

  await transaction(
    async(conn)=>{

      const statusId =
        data.status
        ? await lookupStatusId(
            data.status,
            conn
          )
        : current.status_id;

      const priorityId =
        data.priority
        ? await lookupPriorityId(
            data.priority,
            conn
          )
        : current.priority_id;

      await conn.execute(
        Q.UPDATE_TASK,
        [
          data.title
            || current.title,

          data.description
            || current.description,

          statusId,

          priorityId,

          data.deadline
            || current.deadline,

          taskId
        ]
      );

    }
  );

  return await getTaskById(
    taskId,
    currentUser
  );

}

// ======================
// Update status
// ======================

async function updateTaskStatus(
  taskId,
  status,
  currentUser
){

  const statusId =
    await lookupStatusId(
      status
    );

  await query(
    Q.UPDATE_TASK_STATUS,
    [
      statusId,
      taskId
    ]
  );

  return await getTaskById(
    taskId,
    currentUser
  );

}

// ======================
// Delete
// ======================

async function deleteTask(
  taskId
){

  await query(
    Q.SOFT_DELETE_TASK,
    [taskId]
  );

  return {
    message:
      'Task berhasil dihapus'
  };

}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};