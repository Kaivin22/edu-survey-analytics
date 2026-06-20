const express = require('express');
const router = express.Router();
const { SupportTicket, User, Role } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Submit a guest Support Ticket (No authentication required)
router.post('/public', async (req, res) => {
  try {
    const { guestName, guestEmail, subject, message } = req.body;
    if (!guestName || !guestEmail || !subject || !message) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Họ tên, Email, Tiêu đề và Nội dung.' });
    }

    const ticket = await SupportTicket.create({
      userId: null,
      guestName,
      guestEmail,
      subject,
      message,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Gửi yêu cầu hỗ trợ thành công!', ticket });
  } catch (error) {
    console.error('Error creating public support ticket:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi tạo yêu cầu hỗ trợ.' });
  }
});

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

    if (userRole === 'Admin') {
      // Admin can see all tickets
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

// 3. Reply to a Support Ticket (Admin only)
router.put('/:id/reply', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;

    if (!reply || !status) {
      return res.status(400).json({ message: 'Vui lòng cung cấp câu trả lời phản hồi và trạng thái cập nhật.' });
    }

    const ticket = await SupportTicket.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hỗ trợ.' });
    }

    ticket.reply = reply;
    ticket.status = status; // e.g. 'Processing' or 'Resolved'
    await ticket.save();

    // Send email notification to user or guest
    const recipientEmail = ticket.userId ? ticket.user?.email : ticket.guestEmail;
    const recipientName = ticket.userId ? ticket.user?.fullName : ticket.guestName;

    if (recipientEmail) {
      const { sendEmail } = require('../utils/mailer');
      const emailSubject = `Phản hồi yêu cầu hỗ trợ: ${ticket.subject}`;
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #D2DBEA; border-radius: 16px; background-color: #F9FAFD;">
          <h2 style="color: #6E9AE0; margin-top: 0; text-align: center;">ĐBCL - Đại học Kiến trúc Đà Nẵng</h2>
          <h3 style="color: #2d4771; text-align: center;">Phản Hồi Yêu Cầu Hỗ Trợ Kỹ Thuật</h3>
          <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
          <p>Xin chào <strong>${recipientName}</strong>,</p>
          <p>Yêu cầu hỗ trợ kỹ thuật của bạn về tiêu đề "<strong>${ticket.subject}</strong>" đã được Cán bộ quản lý phản hồi.</p>
          
          <div style="background-color: #EEF4FD; border-left: 4px solid #6E9AE0; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #2d4771;">Nội dung phản hồi:</p>
            <p style="margin: 10px 0 0 0; color: #4a5568; white-space: pre-line;">${reply}</p>
          </div>
          
          <p>Trạng thái yêu cầu hiện tại: <strong style="color: ${status === 'Resolved' ? '#16a34a' : '#d97706'}">${status === 'Resolved' ? 'Đã xử lý (Resolved)' : status}</strong></p>
          <hr style="border: 0; border-top: 1px solid #D2DBEA; margin: 20px 0;">
          <p style="font-size: 11px; color: #718096; text-align: center;">Đây là email tự động từ Hệ thống Khảo sát Ý kiến các Bên Liên quan.</p>
        </div>
      `;
      // Send asynchronously so we don't block the API response
      sendEmail(recipientEmail, emailSubject, `Xin chào ${recipientName}, yêu cầu hỗ trợ của bạn đã được phản hồi: ${reply}`, emailHtml);
    }

    res.json({ message: 'Phản hồi yêu cầu hỗ trợ thành công!', ticket });
  } catch (error) {
    console.error('Error replying to support ticket:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi phản hồi yêu cầu.' });
  }
});

// 4. Edit a Support Ticket (User/Sender can edit, Manager can edit)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Tiêu đề và Nội dung.' });
    }

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hỗ trợ.' });
    }

    // Check permissions
    if (req.user.id !== ticket.userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Bạn không có quyền sửa đổi yêu cầu hỗ trợ này.' });
    }

    ticket.subject = subject;
    ticket.message = message;
    await ticket.save();

    res.json({ message: 'Cập nhật yêu cầu hỗ trợ thành công!', ticket });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật yêu cầu.' });
  }
});

// 5. Delete a Support Ticket (User can delete own, Manager can delete any)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hỗ trợ.' });
    }

    // Check permissions
    if (req.user.id !== ticket.userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa yêu cầu hỗ trợ này.' });
    }

    await ticket.destroy();
    res.json({ message: 'Xóa yêu cầu hỗ trợ thành công!' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi xóa yêu cầu.' });
  }
});

module.exports = router;
