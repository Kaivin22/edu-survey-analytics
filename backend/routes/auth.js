const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'edu_survey_stakeholder_secret_key_2026';

// Helper to detect school from email domain (excl. HCMUTE as requested)
const getSchoolFromEmail = (email) => {
  if (!email) return null;
  const domain = email.split('@')[1];
  if (!domain) return null;
  const domainLower = domain.toLowerCase();

  if (domainLower.endsWith('dau.edu.vn')) {
    return 'Kiến trúc Đà Nẵng (DAU)';
  }
  if (domainLower.endsWith('vku.udn.vn')) {
    return 'Việt Hàn (VKU)';
  }
  if (domainLower.endsWith('edu.vn') || domainLower.endsWith('gmail.com')) {
    // Development / Testing fallback
    return 'Kiến trúc Đà Nẵng (DAU)';
  }
  return null;
};

// Helper to extract student/lecturer code from email prefix
const getCodeFromEmail = (email) => {
  if (!email) return null;
  const username = email.split('@')[0];
  const parsedDigits = username.replace(/\D/g, '');
  return parsedDigits || username.toUpperCase();
};

// Helper to validate code (identification code)
const validateCode = (code, roleIdOrName) => {
  if (!code) return null;
  const isStudent = roleIdOrName == 3 || roleIdOrName === 'Student';
  if (isStudent) {
    if (!/^\d{8,12}$/.test(code)) {
      return 'Mã số sinh viên (MSSV) phải gồm từ 8 đến 12 chữ số.';
    }
  } else {
    if (!/^[a-zA-Z0-9]+$/.test(code)) {
      return 'Mã nhận diện chỉ được phép chứa chữ cái và số (không có ký tự đặc biệt, dấu cách hay số âm).';
    }
  }
  return null;
};

// 1. Get all roles (for registration page)
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách vai trò.', error: error.message });
  }
});

// 2. Register (Employers only)
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, code, roleId, school, department, class: classVal } = req.body;

    if (!email || !password || !fullName || !roleId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
    }

    if (parseInt(roleId) !== 6) {
      return res.status(400).json({ message: 'Sinh viên, Giảng viên và Cựu sinh viên vui lòng sử dụng tính năng Đăng nhập bằng Google.' });
    }

    const codeError = validateCode(code, roleId);
    if (codeError) {
      return res.status(400).json({ message: codeError });
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
      roleId,
      school: school || null,
      department: department || null,
      class: classVal || null,
      status: 'Pending' // Employers need manual approval
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công! Tài khoản của bạn hiện đang ở trạng thái chờ Cán bộ quản lý trường phê duyệt.',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        code: newUser.code,
        role: role.name,
        school: newUser.school,
        department: newUser.department,
        class: newUser.class,
        status: newUser.status
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

    if (user.status === 'Pending') {
      return res.status(403).json({ message: 'Tài khoản của bạn đang chờ Cán bộ quản lý trường phê duyệt. Vui lòng quay lại sau.' });
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
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        code: user.code,
        role: user.role.name,
        school: user.school,
        department: user.department,
        class: user.class
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

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, code, currentPassword, newPassword, school, department, class: classVal } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    const codeError = validateCode(code, user.roleId);
    if (codeError) {
      return res.status(400).json({ message: codeError });
    }

    if (newPassword) {
      if (demoEmails.includes(user.email.toLowerCase())) {
        return res.status(400).json({ message: 'Không thể đổi mật khẩu cho tài khoản demo.' });
      }
      if (!currentPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Mật khẩu mới phải từ 8 ký tự trở lên.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (fullName) user.fullName = fullName;
    if (code !== undefined) user.code = code;
    if (school !== undefined) user.school = school;
    if (department !== undefined) user.department = department;
    if (classVal !== undefined) user.class = classVal;
    
    await user.save();

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    });

    res.json({
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        code: updatedUser.code,
        role: updatedUser.role.name,
        school: updatedUser.school,
        department: updatedUser.department,
        class: updatedUser.class
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật hồ sơ cá nhân.', error: error.message });
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
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4, // Force IPv4 resolution to prevent ENETUNREACH errors on IPv6-unsupported networks (like Render)
  connectionTimeout: 5000, // 5 seconds
  greetingTimeout: 5000,   // 5 seconds
  socketTimeout: 5000,     // 5 seconds
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
// 8. Google Sign-In
router.post('/google-login', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: 'Thông tin đăng nhập Google thiếu email hoặc họ tên.' });
    }

    let user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      // Auto-detect school from email domain for new user info
      const detectedSchool = getSchoolFromEmail(email);
      const detectedCode = getCodeFromEmail(email);
      return res.json({ isNewUser: true, email, name, detectedSchool, detectedCode });
    }

    // Check pending status
    if (user.status === 'Pending') {
      return res.status(403).json({ message: 'Tài khoản của bạn đang chờ Cán bộ quản lý trường phê duyệt. Vui lòng quay lại sau.' });
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
        role: user.role.name,
        school: user.school,
        department: user.department,
        class: user.class
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập Google.', error: error.message });
  }
});

// 9. Google Register (Complete Information)
router.post('/google-register', async (req, res) => {
  try {
    const { email, name, roleId, school, department, class: classVal, code } = req.body;
    if (!email || !name || !roleId) {
      return res.status(400).json({ message: 'Thông tin đăng ký Google thiếu email, họ tên hoặc vai trò.' });
    }

    const parsedRoleId = parseInt(roleId);

    if (parsedRoleId === 1 || parsedRoleId === 2) {
      return res.status(403).json({ message: 'Không thể đăng ký tài khoản Quản trị viên hoặc Cán bộ quản lý công khai.' });
    }

    // For Student/Lecturer/Alumnus (roleId 3,4,5): require school-domain email
    const detectedSchool = getSchoolFromEmail(email);
    const detectedCode = getCodeFromEmail(email);

    if ([3, 4, 5].includes(parsedRoleId) && !detectedSchool) {
      return res.status(400).json({ message: 'Email này không thuộc tên miền của trường đại học được liên kết.' });
    }

    // Use detected values for school and code (auto-extraction from email)
    const finalSchool = detectedSchool || school || null;
    const finalCode = detectedCode || code || null;

    const codeError = validateCode(finalCode, roleId);
    if (codeError) {
      return res.status(400).json({ message: codeError });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản email này đã được đăng ký.' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    }

    // Create user with a secure random password
    const randomPassword = await bcrypt.hash(Math.random().toString(36).substring(2, 10), 10);
    const newUser = await User.create({
      email,
      password: randomPassword,
      fullName: name,
      code: finalCode,
      roleId,
      school: finalSchool,
      department: department || null,
      class: classVal || null,
      status: 'Active' // Google-authenticated users are auto-approved
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: role.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký tài khoản Google thành công!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        code: newUser.code,
        role: role.name,
        school: newUser.school,
        department: newUser.department,
        class: newUser.class
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký tài khoản Google.', error: error.message });
  }
});

// 10. Contact Form - Send real email to admin
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ họ tên, email và nội dung tin nhắn.' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'trankimlien31072004@gmail.com';

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Academic Synergy" <your-email@gmail.com>',
      to: adminEmail,
      subject: `[Liên hệ] ${subject || 'Tin nhắn mới từ ' + name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #D2DBEA; border-radius: 16px; background-color: #F9FAFD;">
          <h2 style="color: #6E9AE0; margin-top: 0; text-align: center;">Academic Synergy - Tin nhắn Liên hệ</h2>
          <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
          <p><strong>Họ tên:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Chủ đề:</strong> ${subject || 'Không có chủ đề'}</p>
          <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
          <p><strong>Nội dung:</strong></p>
          <div style="background-color: #EEF4FD; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p style="white-space: pre-wrap; color: #2d4771;">${message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
          <p style="font-size: 12px; color: #A0AEC0; text-align: center;">Email này được gửi tự động từ hệ thống Academic Synergy © ${new Date().getFullYear()}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.' });
  } catch (error) {
    console.error('Lỗi gửi email liên hệ:', error);
    res.status(500).json({
      message: 'Gửi tin nhắn thất bại. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua email.',
      error: error.message
    });
  }
});

module.exports = router;
