const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const adminCtrl = require('../controllers/admin.controller');

const router = express.Router();

// Semua route butuh login & role admin
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminCtrl.list);
router.post('/users', adminCtrl.create);
router.put('/users/:id', adminCtrl.update);
router.delete('/users/:id', adminCtrl.remove);

module.exports = router;