// const express = require('express');
// const router = express.Router();

// // Import all route files
// const authRoutes = require('./auth.routes');
// const apiRoutes = require('./api.routes');

// // Setup route prefixes
// router.use('/auth', authRoutes);
// router.use('/api', apiRoutes);

// module.exports = router;
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const apiRoutes = require('./api.routes');
const forgotPasswordRoute = require('./forgot-password-route');
const supabase = require('../supabaseClient'); // import your supabase client

// Setup route prefixes
router.use('/auth', authRoutes);
router.use('/api', apiRoutes);

// Mount forgot-password route under /auth (e.g., /auth/forgot-password)
router.use('/auth', forgotPasswordRoute(supabase));

module.exports = router;
