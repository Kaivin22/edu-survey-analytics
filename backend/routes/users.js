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

// 1. Get all users (Manager sees users in their school)
router.get('/', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const whereClause = {};

    const manager = await User.findByPk(req.user.id);
    if (manager && manager.school) {
      whereClause.school = manager.school;
    } else {
      return res.json([]);
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

// 2. Create User (Manager)
router.post('/', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const { email, password, fullName, code, roleId, school, department, class: classVal } = req.body;

    if (!email || !password || !fullName || !roleId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
    }

    const manager = await User.findByPk(req.user.id);
    if (!manager || !manager.school) {
      return res.status(403).json({ message: 'Không xác định được trường của bạn.' });
    }

    // Force the school to be manager's school
    if (school && school !== manager.school) {
      return res.status(403).json({ message: 'Bạn chỉ có thể tạo tài khoản trong trường của mình.' });
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
      school: manager.school,
      department: department || null,
      class: classVal || null,
      status: 'Active'
    });

    res.status(201).json({ message: 'Tạo tài khoản thành công!', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo tài khoản.', error: error.message });
  }
});

// 2.1 Edit User details (Manager)
router.put('/:id', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const { email, password, fullName, code, roleId, school, department, class: classVal } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    const manager = await User.findByPk(req.user.id);
    if (!manager || user.school !== manager.school) {
      return res.status(403).json({ message: 'Bạn chỉ có thể chỉnh sửa tài khoản trong trường của mình.' });
    }

    // Block Manager from changing their own role
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
    
    // Always keep manager's school
    user.school = manager.school;
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

// 2.2 Change User Role (Manager)
router.put('/:id/role', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const { roleId } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng này.' });
    }

    const manager = await User.findByPk(req.user.id);
    if (!manager || user.school !== manager.school) {
      return res.status(403).json({ message: 'Bạn chỉ có thể thay đổi vai trò của người dùng trong trường của mình.' });
    }

    // Block Manager from changing their own role
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

// 2.3 Approve Pending Account (Manager)
router.put('/:id/approve', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần phê duyệt.' });
    }

    if (user.status !== 'Pending') {
      return res.status(400).json({ message: 'Tài khoản này không ở trạng thái chờ phê duyệt.' });
    }

    const manager = await User.findByPk(req.user.id);
    if (!manager || (user.school && user.school !== manager.school)) {
      return res.status(403).json({ message: 'Bạn chỉ có thể phê duyệt tài khoản trong trường của mình.' });
    }


    user.status = 'Active';
    await user.save();

    res.json({ message: 'Phê duyệt tài khoản thành công! Tài khoản đã được kích hoạt.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi phê duyệt tài khoản.', error: error.message });
  }
});

// 3. Delete User (Manager)
router.delete('/:id', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần xóa.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
    }

    const manager = await User.findByPk(req.user.id);
    if (!manager || user.school !== manager.school) {
      return res.status(403).json({ message: 'Bạn chỉ có thể xóa tài khoản trong trường của mình.' });
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
