const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const {
  Survey,
  Question,
  QuestionOption,
  Response,
  Answer,
  User,
  Role
} = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Export Survey Results to Excel (Admin and Manager only)
router.get('/:surveyId/excel', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
  try {
    const surveyId = req.params.surveyId;
    const survey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: Question,
          as: 'Questions',
          include: [{ model: QuestionOption, as: 'options' }]
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát này.' });
    }

    const responses = await Response.findAll({
      where: { surveyId },
      include: [
        { model: User, as: 'respondent', attributes: ['code', 'fullName', 'email'] },
        { model: Answer, as: 'answers', include: [{ model: Question, as: 'question' }] }
      ],
      order: [['submittedAt', 'ASC']]
    });

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hệ thống Khảo sát Ý kiến Giáo dục';
    workbook.lastModifiedBy = req.user.fullName;
    workbook.created = new Date();

    // --- SHEET 1: TỔNG QUAN ---
    const sheet1 = workbook.addWorksheet('Tổng quan');
    sheet1.views = [{ showGridLines: true }];

    // Styling helpers
    const titleCol = sheet1.getColumn('A');
    titleCol.width = 30;
    const valCol = sheet1.getColumn('B');
    valCol.width = 80;

    sheet1.addRow(['BÁO CÁO KẾT QUẢ KHẢO SÁT Ý KIẾN CÁC BÊN LIÊN QUAN']).font = { size: 16, bold: true, color: { argb: 'FF1F497D' } };
    sheet1.addRow([]);
    sheet1.addRow(['Tiêu đề khảo sát:', survey.title]).font = { bold: true };
    sheet1.addRow(['Mô tả:', survey.description || 'Không có mô tả']);
    sheet1.addRow(['Đối tượng tham gia:', survey.targetAudience]);
    sheet1.addRow(['Trạng thái:', survey.status]);
    sheet1.addRow(['Thời gian bắt đầu:', survey.startDate ? new Date(survey.startDate).toLocaleDateString('vi-VN') : 'N/A']);
    sheet1.addRow(['Thời gian kết thúc:', survey.endDate ? new Date(survey.endDate).toLocaleDateString('vi-VN') : 'N/A']);
    sheet1.addRow(['Tổng số người đã tham gia:', responses.length]).font = { bold: true, color: { argb: 'FFC00000' } };
    sheet1.addRow([]);

    // Add list of questions and their types
    sheet1.addRow(['DANH SÁCH CÂU HỎI TRONG PHIẾU']).font = { size: 12, bold: true, color: { argb: 'FF1F497D' } };
    const qHeader = sheet1.addRow(['STT', 'Nội dung câu hỏi', 'Loại câu hỏi', 'Bắt buộc']);
    qHeader.font = { bold: true };
    qHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEAEA' } };

    const typeMapping = {
      likert_scale: 'Thang điểm Likert (1-5)',
      single_choice: 'Trắc nghiệm (1 lựa chọn)',
      multiple_choice: 'Trắc nghiệm (nhiều lựa chọn)',
      open_text: 'Câu hỏi tự luận (mở)'
    };

    survey.Questions.sort((a, b) => a.order - b.order).forEach((q, idx) => {
      sheet1.addRow([
        idx + 1,
        q.text,
        typeMapping[q.type] || q.type,
        q.required ? 'Có' : 'Không'
      ]);
    });

    // --- SHEET 2: KẾT QUẢ CHI TIẾT ---
    const sheet2 = workbook.addWorksheet('Kết quả chi tiết');
    sheet2.views = [{ showGridLines: true }];

    // Prepare header row for Sheet 2
    // User Info + Answers
    const headers = ['STT', 'Thời gian gửi', 'Mã số', 'Họ và tên', 'Email'];
    const questionsSorted = [...survey.Questions].sort((a, b) => a.order - b.order);
    
    questionsSorted.forEach((q, idx) => {
      headers.push(`Câu ${idx + 1}: ${q.text.substring(0, 40)}...`);
    });

    const headerRow = sheet2.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F497D' }
    };
    
    // Style column widths for Sheet 2
    sheet2.getColumn(1).width = 8;
    sheet2.getColumn(2).width = 20;
    sheet2.getColumn(3).width = 15;
    sheet2.getColumn(4).width = 25;
    sheet2.getColumn(5).width = 25;
    
    questionsSorted.forEach((q, idx) => {
      sheet2.getColumn(6 + idx).width = 30;
    });

    // Add response rows
    responses.forEach((resp, respIdx) => {
      const rowData = [
        respIdx + 1,
        new Date(resp.submittedAt).toLocaleString('vi-VN'),
        resp.respondent ? resp.respondent.code || 'N/A' : 'Nặc danh',
        resp.respondent ? resp.respondent.fullName : 'Nặc danh',
        resp.respondent ? resp.respondent.email : 'N/A'
      ];

      // Add answer for each sorted question
      questionsSorted.forEach(q => {
        const ans = resp.answers.find(a => a.questionId === q.id);
        if (!ans) {
          rowData.push('');
        } else if (['single_choice', 'multiple_choice'].includes(q.type)) {
          // Parse option texts from selected option ids
          try {
            const selectedIds = JSON.parse(ans.selectedOptions || '[]');
            const optionTexts = selectedIds.map(id => {
              const opt = q.options.find(o => o.id == id);
              return opt ? opt.text : `[ID:${id}]`;
            });
            rowData.push(optionTexts.join(', '));
          } catch (e) {
            rowData.push('');
          }
        } else {
          rowData.push(ans.answerText || '');
        }
      });

      sheet2.addRow(rowData);
    });

    // Write workbook to response stream
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=bao_cao_khao_sat_${surveyId}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xuất báo cáo Excel.', error: error.message });
  }
});

module.exports = router;
