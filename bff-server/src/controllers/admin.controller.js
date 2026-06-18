const adminService = require('../services/admin.service');

// ======================
// GET /admin/users
// List semua user
// ======================
async function list(req, res, next) {
  try {
    const users = await adminService.listUsers();
    return res.status(200).json({ users });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// Buat user baru
async function create(req, res, next) {
  try {
    const { name, username, password, role, status } = req.body;
    const user = await adminService.createUser({ name, username, password, role, status });
    return res.status(201).json({ user });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// Update user
async function update(req, res, next) {
  try {
    const { username, role, status, password } = req.body;
    const user = await adminService.updateUser(req.params.id, { username, role, status, password });
    return res.status(200).json({ user });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// Hapus user
async function remove(req, res, next) {
  try {
    const result = await adminService.deleteUser(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

module.exports = { list, create, update, remove };