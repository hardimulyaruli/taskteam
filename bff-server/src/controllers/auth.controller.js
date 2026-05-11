const { loginSchema } = require('../schemas/auth.schema');
const { authenticateUser } = require('../services/auth.service');
const { createToken } = require('../utils/token');

async function login(req, res, next) {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await authenticateUser(value.username, value.password);
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const token = createToken(user);
    return res.status(200).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
};
