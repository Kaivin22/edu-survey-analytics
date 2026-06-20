const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Role, Notification } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

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

// 1. Get all users (Admin sees all, Manager only sees Employer)
router.get('/', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
  try {
    const whereClause = {};

    if (req.user.role === 'Manager') {
      // Manager can only see Employer accounts
      whereClause.roleId = 6;
    } else if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách tài khoản.', error: error.message });
  }
});

// 2. Create User (Admin only)
router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { email, password, fullName, code, roleId, department, class: classVal } = req.body;

    if (!email || !password || !fullName || !roleId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
    }

    const admin = await User.findByPk(req.user.id);
    if (!admin) {
      return res.status(403).json({ message: 'Không xác định được thông tin quản trị viên.' });
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
      code: code || null,
      roleId,
      school: admin.school || 'Trường Đại học Kiến trúc Đà Nẵng',
      department: department || null,
      class: classVal || null,
      status: 'Active'
    });

    res.status(201).json({ message: 'Tạo tài khoản thành công!', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo tài khoản.', error: error.message });
  }
});

// 2.1 Edit User details (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { email, password, fullName, code, roleId, department, class: classVal } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    const admin = await User.findByPk(req.user.id);
    if (!admin) {
      return res.status(403).json({ message: 'Không xác định được thông tin quản trị viên.' });
    }

    // Block from changing their own role
    if (user.id === req.user.id && roleId && parseInt(roleId) !== user.roleId) {
      return res.status(400).json({ message: 'Bạn không thể tự thay đổi vai trò của chính mình.' });
    }

    const targetRoleId = roleId || user.roleId;
    const codeError = validateCode(code, targetRoleId);
    if (codeError) {
      return res.status(400).json({ message: codeError });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email này đã được sử dụng.' });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (code !== undefined) user.code = code || null;
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
      user.roleId = roleId;
    }
    
    user.department = department || null;
    user.class = classVal || null;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: 'Cập nhật thông tin tài khoản thành công!', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật tài khoản.', error: error.message });
  }
});

// 2.2 Change User Role (Admin only)
router.put('/:id/role', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { roleId } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng này.' });
    }

    const admin = await User.findByPk(req.user.id);
    if (!admin) {
      return res.status(403).json({ message: 'Không xác định được thông tin quản trị viên.' });
    }

    // Block from changing their own role
    if (user.id === req.user.id && parseInt(roleId) !== user.roleId) {
      return res.status(400).json({ message: 'Bạn không thể tự thay đổi vai trò của chính mình.' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    }

    user.roleId = roleId;
    await user.save();

    res.json({ message: 'Cập nhật vai trò người dùng thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật vai trò người dùng.', error: error.message });
  }
});

// 2.3 Approve Pending Account (Admin & Manager)
router.put('/:id/approve', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần phê duyệt.' });
    }

    if (user.status !== 'Pending') {
      return res.status(400).json({ message: 'Tài khoản này không ở trạng thái chờ phê duyệt.' });
    }

    if (req.user.role === 'Manager' && user.roleId !== 6) {
      return res.status(403).json({ message: 'Cán bộ quản lý chỉ có quyền phê duyệt tài khoản Nhà tuyển dụng.' });
    }

    user.status = 'Active';
    await user.save();

    res.json({ message: 'Phê duyệt tài khoản thành công! Tài khoản đã được kích hoạt.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi phê duyệt tài khoản.', error: error.message });
  }
});

// 3. Delete User (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần xóa.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
    }

    const admin = await User.findByPk(req.user.id);
    if (!admin) {
      return res.status(403).json({ message: 'Không xác định được thông tin quản trị viên.' });
    }

    await user.destroy();
    res.json({ message: 'Xóa tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa tài khoản.', error: error.message });
  }
});

// 4. Get current user's notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách thông báo.', error: error.message });
  }
});

// 5. Mark all notifications as read for current user
router.put('/notifications/read', authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: 'Đã đọc toàn bộ thông báo.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật thông báo.', error: error.message });
  }
});

module.exports = router;
