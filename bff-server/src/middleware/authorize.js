/**
 * Role-based authorization middleware.
 * Usage: authorize('manager', 'admin') — allows only those roles.
 * Must be used AFTER the authenticate middleware (req.user must exist).
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
      });
    }

    next();
  };
}

module.exports = {
  authorize,
};
