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
const categoriesRouter = require('./routes/categories');

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
app.use('/api/categories', categoriesRouter);

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

      try {
        const { Role } = require('./models');
        const roleCount = await Role.count();
        if (roleCount === 0) {
          console.log('Roles table is empty. Running auto-seeding for PostgreSQL...');
          const seed = require('./scripts/initDb');
          await seed();
        }
      } catch (seedError) {
        console.error('Error auto-seeding database:', seedError);
      }
    }

    // Ensure at least one Admin user exists (Genesis Admin)
    try {
      const { User } = require('./models');
      const adminExists = await User.findOne({ where: { roleId: 1 } });
      if (!adminExists) {
        console.log('No Admin account found in database. Creating genesis Admin...');
        const bcrypt = require('bcryptjs');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@edu.vn';
        const adminPassword = process.env.ADMIN_PASSWORD || '12345678';
        const hashedPw = await bcrypt.hash(adminPassword, 10);
        await User.create({
          email: adminEmail,
          password: hashedPw,
          fullName: 'Nguyễn Quản Trị',
          code: 'ADMIN001',
          roleId: 1,
          school: 'Kiến trúc Đà Nẵng (DAU)',
          department: 'Công nghệ thông tin'
        });
        console.log(`Genesis Admin created successfully: ${adminEmail}`);
      }
    } catch (dbError) {
      console.error('Error checking/creating genesis Admin account:', dbError);
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
