const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sequelize = require('./config/db');
const authRouter = require('./routes/auth');
const surveyRouter = require('./routes/surveys');
const userRouter = require('./routes/users');
const reportRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng bạn đến với API Hệ thống Khảo sát Ý kiến Giáo dục (Topic 2).' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/surveys', surveyRouter);
app.use('/api/users', userRouter);
app.use('/api/reports', reportRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống cục bộ.', error: err.message });
});

// Sync Database and Start Server
async function startServer() {
  try {
    const isSqlite = process.env.DB_DIALECT === 'sqlite' || !process.env.DB_DIALECT;
    const storagePath = process.env.DB_STORAGE || './data/database.sqlite';
    const dbFileExists = isSqlite && fs.existsSync(storagePath);

    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    // If it's a new SQLite DB, sync and auto-seed!
    if (isSqlite && !dbFileExists) {
      console.log('First time running with SQLite. Auto-seeding default stakeholder data...');
      const seed = require('./scripts/initDb');
      await seed();
    } else {
      console.log('Syncing database schema...');
      await sequelize.sync();
      console.log('Database schema synchronized.');
    }

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`Backend Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Unable to start backend server:', error);
    process.exit(1);
  }
}

startServer();
