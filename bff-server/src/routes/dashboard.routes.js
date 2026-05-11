const express = require('express');
const { getOverview } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.get('/overview', authenticate, getOverview);

module.exports = router;
