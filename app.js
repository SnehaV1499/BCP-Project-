const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// --- Import routes ---
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const messagesRoutes = require('./routes/messages');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- API Routes ---
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('HR Dashboard API is running!');
});

module.exports = app;