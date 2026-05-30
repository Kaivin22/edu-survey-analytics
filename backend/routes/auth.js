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

module.exports = router;
