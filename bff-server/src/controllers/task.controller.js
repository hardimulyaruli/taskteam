const { createTaskSchema, updateTaskSchema, updateStatusSchema } = require('../schemas/task.schema');
const taskService = require('../services/task.service');

async function list(req, res, next) {
  try {
    const tasks = await taskService.getAllTasks(req.user);
    return res.status(200).json({ tasks });
  } catch (err) {
    return next(err);
  }
}

async function detail(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user);
    return res.status(200).json({ task });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return next(err);
  }
}

async function create(req, res, next) {
  const { error, value } = createTaskSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const task = await taskService.createTask(value, req.user);
    return res.status(201).json({ task });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return next(err);
  }
}

async function update(req, res, next) {
  const { error, value } = updateTaskSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const task = await taskService.updateTask(req.params.id, value, req.user);
    return res.status(200).json({ task });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return next(err);
  }
}

async function updateStatus(req, res, next) {
  const { error, value } = updateStatusSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const task = await taskService.updateTaskStatus(req.params.id, value.status, req.user);
    return res.status(200).json({ task });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await taskService.deleteTask(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return next(err);
  }
}

module.exports = {
  list,
  detail,
  create,
  update,
  updateStatus,
  remove,
};
