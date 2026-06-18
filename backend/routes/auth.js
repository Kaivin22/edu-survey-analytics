const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'edu_survey_stakeholder_secret_key_2026';

// 1. Get all roles (for registration page)
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách vai trò.', error: error.message });
  }
});

// 2. Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, code, roleId } = req.body;

    if (!email || !password || !fullName || !roleId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
      code,
      roleId
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        code: newUser.code,
        role: role.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký tài khoản.', error: error.message });
  }
});

// 3. Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền email và mật khẩu.' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name
      },
      JWT_SECRET,
      { expiresIn: '7d' } // 7 days expiration
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        code: user.code,
        role: user.role.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập.', error: error.message });
  }
});

// 4. Get Current User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy hồ sơ cá nhân.', error: error.message });
  }
});

// 5. Change Password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 8 ký tự trở lên.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu.', error: error.message });
  }
});

// --- NEW FEATURES: GOOGLE LOGIN, FORGOT PASSWORD WITH REAL EMAIL OTP ---

const nodemailer = require('nodemailer');

const demoEmails = [
  'admin@edu.vn',
  'manager@edu.vn',
  'student1@edu.vn',
  'student2@edu.vn',
  'lecturer1@edu.vn',
  'alumnus1@edu.vn',
  'employer1@edu.vn'
];

// In-memory OTP storage: email -> { otp, expires }
const otpStore = new Map();

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 6. Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email.' });
    }

    // Check if it is a demo account
    if (demoEmails.includes(email.toLowerCase())) {
      return res.status(400).json({
        message: 'Không hỗ trợ đặt lại mật khẩu cho tài khoản demo hệ thống. Vui lòng đăng ký tài khoản mới bằng email của bạn để dùng thử tính năng này.'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(email.toLowerCase(), { otp, expires });

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Academic Synergy" <your-email@gmail.com>',
      to: email,
      subject: 'Mã xác minh khôi phục mật khẩu - Academic Synergy',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #D2DBEA; border-radius: 16px; background-color: #F9FAFD;">
          <h2 style="color: #6E9AE0; margin-top: 0; text-align: center;">Academic Synergy</h2>
          <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
          <p>Xin chào <strong>${user.fullName}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để hoàn tất:</p>
          <div style="background-color: #D2DBEA; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; color: #2d4771; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #718096; text-align: center;">Mã xác minh này có hiệu lực trong vòng 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
          <p style="font-size: 12px; color: #A0AEC0; text-align: center; margin-bottom: 0;">Academic Synergy © 2026</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Mã xác minh OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!' });

  } catch (error) {
    console.error('Lỗi gửi email OTP:', error);
    res.status(500).json({
      message: 'Gửi email thất bại. Vui lòng cấu hình tài khoản SMTP gửi mail thực tế trong file backend/.env hoặc kiểm tra lại kết nối.',
      error: error.message
    });
  }
});

// 7. Reset Password - Submit OTP & New Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: email, mã OTP và mật khẩu mới.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 8 ký tự trở lên.' });
    }

    const emailKey = email.toLowerCase();
    const storedData = otpStore.get(emailKey);

    if (!storedData) {
      return res.status(400).json({ message: 'Không tìm thấy yêu cầu khôi phục mật khẩu hoặc yêu cầu đã hết hạn.' });
    }

    if (storedData.expires < Date.now()) {
      otpStore.delete(emailKey);
      return res.status(400).json({ message: 'Mã xác minh OTP đã hết hạn. Vui lòng yêu cầu mã mới.' });
    }

    if (storedData.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Mã xác minh OTP không chính xác.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear OTP after successful reset
    otpStore.delete(emailKey);

    res.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đặt lại mật khẩu.', error: error.message });
  }
});

// 8. Google Sign-In (Mock Flow)
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, roleName } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: 'Thông tin đăng nhập Google thiếu email hoặc họ tên.' });
    }

    let user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      // Find role or default to Student (roleId: 3)
      let role = await Role.findOne({ where: { name: roleName || 'Student' } });
      if (!role) {
        role = await Role.findOne({ where: { name: 'Student' } });
      }

      // Create new user automatically for first time Google sign-in
      const randomPassword = await bcrypt.hash(Math.random().toString(36).substring(2, 10), 10);
      user = await User.create({
        email,
        password: randomPassword,
        fullName: name,
        code: 'GG-' + Math.floor(100000 + Math.random() * 900000),
        roleId: role.id
      });

      // Refetch with role association
      user = await User.findByPk(user.id, {
        include: [{ model: Role, as: 'role' }]
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập Google thành công!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        code: user.code,
        role: user.role.name
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập Google.', error: error.message });
  }
});

module.exports = router;
