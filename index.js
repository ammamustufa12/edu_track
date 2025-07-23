require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// 🔗 Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false } }
);

// 🧱 Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 🔀 Routes
const authRoutes = require('./routes/auth.routes')(supabase);
const apiRoutes = require('./routes/api.routes')(supabase);
const roleRoutes = require('./routes/roles.routes')(supabase);
const sessionRoutes = require('./routes/usersessions.routes')(supabase);
const invoiceRoutes = require('./routes/invoice.routes')(supabase);
const userRoutes = require('./routes/users.routes')(supabase);
const formationRoutes = require('./routes/formations.routes')(supabase);
const studentsRouter = require('./routes/studentsRouter')(supabase);

// Import forgot-password route
const forgotPasswordRoute = require('./routes/forgot-password-route')(supabase);

// Mount routers
app.use('/api/v1/students', studentsRouter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1', invoiceRoutes);
app.use('/api/v1/formations', formationRoutes);
app.use('/api/v1', userRoutes);

// Mount forgot-password route under /api/v1/auth
app.use('/api/v1/auth', forgotPasswordRoute);

// ✅ Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 🧯 Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Supabase: ${process.env.SUPABASE_URL}`);
});
