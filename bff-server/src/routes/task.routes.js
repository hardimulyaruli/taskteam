const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const taskCtrl = require('../controllers/task.controller');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// GET  /tasks       — List all tasks (all roles, filtered by role in service)
router.get('/', taskCtrl.list);

// GET  /tasks/:id   — Task detail (all roles, access checked in service)
router.get('/:id', taskCtrl.detail);

// POST /tasks       — Create task (manager only)
router.post('/', authorize('manager'), taskCtrl.create);

// PUT  /tasks/:id   — Full update (manager only)
router.put('/:id', authorize('manager'), taskCtrl.update);

// PATCH /tasks/:id/status — Update status (team + manager)
router.patch('/:id/status', authorize('team', 'manager'), taskCtrl.updateStatus);

// DELETE /tasks/:id — Soft delete (manager only)
router.delete('/:id', authorize('manager'), taskCtrl.remove);

module.exports = router;
