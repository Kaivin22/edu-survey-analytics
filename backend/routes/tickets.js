const express = require('express');
const router = express.Router();
const { SupportTicket, User, Role } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 1. Submit a Support Ticket (All logged-in users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Tiêu đề và Nội dung.' });
    }

    const ticket = await SupportTicket.create({
      userId: req.user.id,
      subject,
      message,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Gửi yêu cầu hỗ trợ thành công!', ticket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi tạo yêu cầu hỗ trợ.' });
  }
});

// 2. List Support Tickets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'Manager') {
      // Manager can see all tickets
      const tickets = await SupportTicket.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['fullName', 'email', 'code', 'school', 'department', 'class'],
            include: [{ model: Role, as: 'role', attributes: ['name'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.json(tickets);
    } else {
      // Standard users can only see their own tickets
      const tickets = await SupportTicket.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });
      return res.json(tickets);
    }
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi tải danh sách hỗ trợ.' });
  }
});

// 3. Reply to a Support Ticket (Manager only)
router.put('/:id/reply', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;

    if (!reply || !status) {
      return res.status(400).json({ message: 'Vui lòng cung cấp câu trả lời phản hồi và trạng thái cập nhật.' });
    }

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hỗ trợ.' });
    }

    ticket.reply = reply;
    ticket.status = status; // e.g. 'Processing' or 'Resolved'
    await ticket.save();

    res.json({ message: 'Phản hồi yêu cầu hỗ trợ thành công!', ticket });
  } catch (error) {
    console.error('Error replying to support ticket:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi phản hồi yêu cầu.' });
  }
});

module.exports = router;
