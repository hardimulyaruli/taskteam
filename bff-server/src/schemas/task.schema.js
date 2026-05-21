const Joi = require('joi');

const VALID_STATUSES = ['To Do', 'Dikerjakan', 'Selesai'];
const VALID_PRIORITIES = ['Rendah', 'Sedang', 'Tinggi'];

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(2000).allow('', null).default(''),
  assignee: Joi.string().trim().max(100).allow('', null).default(''),
  deadline: Joi.date().iso().allow(null).default(null),
  priority: Joi.string().valid(...VALID_PRIORITIES).default('Sedang'),
  status: Joi.string().valid(...VALID_STATUSES).default('To Do'),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255),
  description: Joi.string().trim().max(2000).allow('', null),
  assignee: Joi.string().trim().max(100).allow('', null),
  deadline: Joi.date().iso().allow(null),
  priority: Joi.string().valid(...VALID_PRIORITIES),
  status: Joi.string().valid(...VALID_STATUSES),
}).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...VALID_STATUSES).required(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
};
