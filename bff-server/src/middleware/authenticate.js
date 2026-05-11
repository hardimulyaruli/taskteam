const { verifyToken } = require('../utils/token');

function authenticate(req, res, next) {
  const authorizationHeader = req.headers.authorization || '';
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token tidak ditemukan.' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Token tidak valid.' });
  }
}

module.exports = {
  authenticate,
};
