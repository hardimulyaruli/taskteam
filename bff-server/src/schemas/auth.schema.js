const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).required(),
  password: Joi.string().min(3).required(),
});

module.exports = {
  loginSchema,
};
