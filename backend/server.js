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
const templatesRouter = require('./routes/templates');
const ticketsRouter = require('./routes/tickets');

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
app.use('/api/surveys', templatesRouter);
app.use('/api/surveys', surveyRouter);
app.use('/api/users', userRouter);
app.use('/api/reports', reportRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tickets', ticketsRouter);

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
        'ALTER TABLE "Surveys" ADD COLUMN IF NOT EXISTS "class" VARCHAR(255);',
        'ALTER TABLE "Questions" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255);',
        'ALTER TABLE "SupportTickets" ADD COLUMN IF NOT EXISTS "guestName" VARCHAR(255);',
        'ALTER TABLE "SupportTickets" ADD COLUMN IF NOT EXISTS "guestEmail" VARCHAR(255);'
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
        { table: 'Surveys', column: 'class', type: 'VARCHAR(255)' },
        { table: 'Questions', column: 'category', type: 'VARCHAR(255)' },
        { table: 'SupportTickets', column: 'guestName', type: 'VARCHAR(255)' },
        { table: 'SupportTickets', column: 'guestEmail', type: 'VARCHAR(255)' }
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

      // Check if we need to reset the database (force seed) to clean up old admin and survey schemas
      let needsReset = false;
      try {
        const { User } = require('./models');
        const oldAdminExists = await User.findOne({ where: { email: 'admin@edu.vn' } });
        const newAdminExists = await User.findOne({ where: { email: 'trankimlien31072004@gmail.com' } });
        if (oldAdminExists || !newAdminExists || newAdminExists.roleId !== 1) {
          console.log('Detected old database state (admin@edu.vn exists, trankimlien31072004@gmail.com is missing or has wrong roleId). Wiping and rebuilding database...');
          needsReset = true;
        }
      } catch (err) {
        // Tables do not exist or status column missing
        console.log('Query check failed (database tables might not exist yet or are in a legacy state):', err.message);
        // If query fails because the table doesn't have status, we should do a force sync to fix it cleanly!
        if (err.message.includes('status') || err.message.includes('no such column') || err.message.includes('does not exist')) {
          console.log('Missing status column. Forcing database reset...');
          needsReset = true;
        }
      }

      if (needsReset) {
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
    }

    // Ensure at least one Manager user exists (Genesis Manager)
    try {
      const { User } = require('./models');
      const managerExists = await User.findOne({ where: { roleId: 2 } });
      if (!managerExists) {
        console.log('No Manager account found in database. Creating genesis Manager...');
        const bcrypt = require('bcryptjs');
        const managerEmail = process.env.ADMIN_EMAIL || 'manager@edu.vn';
        const managerPassword = process.env.ADMIN_PASSWORD || '12345678';
        const hashedPw = await bcrypt.hash(managerPassword, 10);
        await User.create({
          email: managerEmail,
          password: hashedPw,
          fullName: 'Cán bộ Quản lý ĐBCL',
          code: 'CB_DBCL_01',
          roleId: 2,
          school: 'Trường Đại học Kiến trúc Đà Nẵng',
          department: 'Khoa Công nghệ thông tin',
          status: 'Active'
        });
        console.log(`Genesis Manager created successfully: ${managerEmail}`);
      }
    } catch (dbError) {
      console.error('Error checking/creating genesis Manager account:', dbError);
    }

    // Auto-close expired surveys on startup and periodically (every 5 minutes)
    const autoCloseExpiredSurveys = async () => {
      try {
        const { Survey } = require('./models');
        const { Op } = require('sequelize');
        const count = await Survey.update(
          { status: 'Closed' },
          {
            where: {
              status: 'Active',
              endDate: {
                [Op.ne]: null,
                [Op.lt]: new Date()
              }
            }
          }
        );
        if (count[0] > 0) {
          console.log(`[Auto-Close] Closed ${count[0]} expired surveys.`);
        }
      } catch (err) {
        console.error('[Auto-Close Error] Failed to auto-close expired surveys:', err.message);
      }
    };

    // Auto-send survey reminders to pending participants (deadline < 3 days)
    const autoSendSurveyReminders = async () => {
      try {
        const { Survey, User, Role, Response } = require('./models');
        const { sendEmail } = require('./utils/mailer');
        const { Op } = require('sequelize');

        const now = new Date();
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        // Find active surveys ending in less than 3 days
        const closeSurveys = await Survey.findAll({
          where: {
            status: 'Active',
            endDate: {
              [Op.ne]: null,
              [Op.gt]: now,
              [Op.lte]: threeDaysLater
            }
          }
        });

        for (const s of closeSurveys) {
          const submissions = await Response.findAll({
            where: { surveyId: s.id },
            attributes: ['userId']
          });
          const submittedUserIds = submissions.map(sub => sub.userId);

          const userWhere = {
            status: 'Active',
            id: { [Op.notIn]: submittedUserIds }
          };

          if (s.targetAudience !== 'All') {
            const role = await Role.findOne({ where: { name: s.targetAudience } });
            if (role) userWhere.roleId = role.id;
          } else {
            const excludedRoles = await Role.findAll({ where: { name: ['Admin', 'Manager'] } });
            const excludedIds = excludedRoles.map(r => r.id);
            userWhere.roleId = { [Op.notIn]: excludedIds };
          }

          if (s.school) userWhere.school = s.school;
          if (s.department) userWhere.department = s.department;
          if (s.class) {
            const classes = s.class.split(',').map(c => c.trim()).filter(Boolean);
            if (classes.length > 0) {
              userWhere.class = { [Op.in]: classes };
            }
          }

          const pendingUsers = await User.findAll({
            where: userWhere,
            attributes: ['fullName', 'email']
          });

          for (const u of pendingUsers) {
            const subject = `[Nhắc nhở] Khảo sát "${s.title}" sắp hết hạn!`;
            const htmlContent = `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #D2DBEA; border-radius: 16px; background-color: #F9FAFD;">
                <h2 style="color: #ea580c; margin-top: 0; text-align: center;">Nhắc Nhở Khảo Sát</h2>
                <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
                <p>Xin chào <strong>${u.fullName}</strong>,</p>
                <p>Hệ thống ghi nhận bạn chưa tham gia khảo sát ý kiến: <strong>"${s.title}"</strong>.</p>
                <p>Khảo sát này rất quan trọng để cải thiện chất lượng học tập và giảng dạy tại trường.</p>
                <p style="color: #dc2626;"><strong>Hạn chót thực hiện:</strong> ${new Date(s.endDate).toLocaleString('vi-VN')}</p>
                <p>Vui lòng đăng nhập vào hệ thống để hoàn thành khảo sát trước khi hết hạn.</p>
                <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
                <p style="font-size: 12px; color: #A0AEC0; text-align: center; margin-bottom: 0;">Trường Đại học Kiến trúc Đà Nẵng © 2026</p>
              </div>
            `;
            sendEmail(u.email, subject, `Khảo sát "${s.title}" của bạn sắp hết hạn. Vui lòng thực hiện sớm.`, htmlContent);
          }

          if (pendingUsers.length > 0) {
            console.log(`[Auto-Reminder] Sent reminders to ${pendingUsers.length} users for survey "${s.title}".`);
          }
        }
      } catch (err) {
        console.error('[Auto-Reminder Error] Failed to send reminders:', err.message);
      }
    };

    // Run immediately on startup
    await autoCloseExpiredSurveys();
    await autoSendSurveyReminders();
    
    // Set periodic jobs
    setInterval(autoCloseExpiredSurveys, 5 * 60 * 1000); // 5 mins
    setInterval(autoSendSurveyReminders, 24 * 60 * 60 * 1000); // 24 hours

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
