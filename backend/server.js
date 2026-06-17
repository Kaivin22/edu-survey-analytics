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

// Fallback to index.html for SPA routing (e.g. if BrowserRouter is used)
app.get('*', (req, res, next) => {
  // Do not intercept API requests
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống cục bộ.', error: err.message });
});

// Manual migrations to ensure new columns exist in pre-existing tables
async function runManualMigrations(sequelize) {
  try {
    const dialect = sequelize.getDialect();
    console.log(`Running manual migrations for dialect: ${dialect}...`);
    if (dialect === 'postgres') {
      const queries = [
        'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "status" VARCHAR(255) DEFAULT \'Active\';',
        'ALTER TABLE "Surveys" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP WITH TIME ZONE;',
        'ALTER TABLE "Surveys" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP WITH TIME ZONE;',
        'ALTER TABLE "Surveys" ADD COLUMN IF NOT EXISTS "school" VARCHAR(255);',
        'ALTER TABLE "Surveys" ADD COLUMN IF NOT EXISTS "department" VARCHAR(255);',
        'ALTER TABLE "Surveys" ADD COLUMN IF NOT EXISTS "class" VARCHAR(255);'
      ];
      for (const q of queries) {
        try {
          await sequelize.query(q);
        } catch (err) {
          console.warn(`PG Migration query failed: ${q}`, err.message);
        }
      }
    } else if (dialect === 'sqlite') {
      const migrations = [
        { table: 'Users', column: 'status', type: 'VARCHAR(255) DEFAULT \'Active\'' },
        { table: 'Surveys', column: 'startDate', type: 'DATETIME' },
        { table: 'Surveys', column: 'endDate', type: 'DATETIME' },
        { table: 'Surveys', column: 'school', type: 'VARCHAR(255)' },
        { table: 'Surveys', column: 'department', type: 'VARCHAR(255)' },
        { table: 'Surveys', column: 'class', type: 'VARCHAR(255)' }
      ];
      for (const m of migrations) {
        try {
          await sequelize.query(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type};`);
          console.log(`SQLite added column ${m.column} to table ${m.table}`);
        } catch (err) {
          if (!err.message.includes('duplicate column name') && !err.message.includes('already exists')) {
            console.warn(`SQLite Migration query failed for ${m.table}.${m.column}:`, err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error running manual migrations:', err);
  }
}

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
      console.log('Running database migration checks...');
      await runManualMigrations(sequelize);
      console.log('Syncing database schema...');
      await sequelize.sync({ alter: true });
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
        const adminEmail = process.env.ADMIN_EMAIL || 'trankimlien31072004@gmail.com';
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
