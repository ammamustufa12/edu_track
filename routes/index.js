const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth.routes');
const apiRoutes = require('./api.routes');

// Setup route prefixes
router.use('/auth', authRoutes);
router.use('/api', apiRoutes);

module.exports = router;