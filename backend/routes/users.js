const express = require('express');
const router = express.Router();
const { User, Role, Notification } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 1. Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách tài khoản.', error: error.message });
  }
});

// 2. Change User Role (Admin only)
router.put('/:id/role', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { roleId } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng này.' });
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
