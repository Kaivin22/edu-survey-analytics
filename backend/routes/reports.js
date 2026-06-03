const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const path = require('path');
const {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, WidthType, BorderStyle, AlignmentType, ShadingType
} = require('docx');
const PDFDocument = require('pdfkit');
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

// Helper: Get survey data with responses (with school/dept/class filters)
async function getSurveyData(surveyId, filters = {}) {
  const survey = await Survey.findByPk(surveyId, {
    include: [
      {
        model: Question,
        as: 'Questions',
        include: [{ model: QuestionOption, as: 'options' }]
      }
    ]
  });

  const responseWhere = { surveyId };
  const userWhere = {};
  if (filters.school) userWhere.school = filters.school;
  if (filters.department) userWhere.department = filters.department;
  if (filters.class) userWhere.class = filters.class;

  const responses = await Response.findAll({
    where: responseWhere,
    include: [
      { 
        model: User, 
        as: 'respondent', 
        attributes: ['code', 'fullName', 'email', 'school', 'department', 'class'],
        where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        required: Object.keys(userWhere).length > 0
      },
      { model: Answer, as: 'answers', include: [{ model: Question, as: 'question' }] }
    ],
    order: [['submittedAt', 'ASC']]
  });

  return { survey, responses };
}

const typeMapping = {
  likert_scale: 'Thang điểm Likert (1-5)',
  single_choice: 'Trắc nghiệm (1 lựa chọn)',
  multiple_choice: 'Trắc nghiệm (nhiều lựa chọn)',
  open_text: 'Câu hỏi tự luận'
};

// Helper: format answer text
function getAnswerText(ans, q) {
  if (!ans) return '';
  if (['single_choice', 'multiple_choice'].includes(q.type)) {
    try {
      const selectedIds = JSON.parse(ans.selectedOptions || '[]');
      const optionTexts = selectedIds.map(id => {
        const opt = q.options.find(o => o.id == id);
        return opt ? opt.text : `[ID:${id}]`;
      });
      return optionTexts.join(', ');
    } catch (e) { return ''; }
  }
  return ans.answerText || '';
}

// ─────────────────────────────────────────────────────────
// Route 1: Export Excel
// ─────────────────────────────────────────────────────────
router.get('/:surveyId/excel', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
  try {
    const { school, department, class: classVal } = req.query;
    const { survey, responses } = await getSurveyData(req.params.surveyId, { school, department, class: classVal });
    if (!survey) return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát này.' });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hệ thống Khảo sát Ý kiến Giáo dục';
    workbook.lastModifiedBy = req.user.fullName;
    workbook.created = new Date();

    // Sheet 1: Overview
    const sheet1 = workbook.addWorksheet('Tổng quan');
    sheet1.getColumn('A').width = 30;
    sheet1.getColumn('B').width = 80;

    sheet1.addRow(['BÁO CÁO KẾT QUẢ KHẢO SÁT Ý KIẾN CÁC BÊN LIÊN QUAN']).font = { size: 16, bold: true, color: { argb: 'FF1F497D' } };
    sheet1.addRow([]);
    sheet1.addRow(['Tiêu đề khảo sát:', survey.title]).font = { bold: true };
    sheet1.addRow(['Mô tả:', survey.description || 'Không có mô tả']);
    sheet1.addRow(['Đối tượng tham gia:', survey.targetAudience]);
    sheet1.addRow(['Trạng thái:', survey.status]);
    sheet1.addRow(['Thời gian kết thúc:', survey.endDate ? new Date(survey.endDate).toLocaleDateString('vi-VN') : 'N/A']);
    sheet1.addRow(['Tổng số người đã tham gia:', responses.length]).font = { bold: true, color: { argb: 'FFC00000' } };
    sheet1.addRow([]);

    sheet1.addRow(['DANH SÁCH CÂU HỎI']).font = { size: 12, bold: true, color: { argb: 'FF1F497D' } };
    const qHeader = sheet1.addRow(['STT', 'Nội dung câu hỏi', 'Loại câu hỏi', 'Bắt buộc']);
    qHeader.font = { bold: true };
    qHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEAEA' } };

    survey.Questions.sort((a, b) => a.order - b.order).forEach((q, idx) => {
      sheet1.addRow([idx + 1, q.text, typeMapping[q.type] || q.type, q.required ? 'Có' : 'Không']);
    });

    // Sheet 2: Detailed Results
    const sheet2 = workbook.addWorksheet('Kết quả chi tiết');
    const questionsSorted = [...survey.Questions].sort((a, b) => a.order - b.order);
    const headers = ['STT', 'Thời gian gửi', 'Mã số', 'Họ và tên', 'Email'];
    questionsSorted.forEach((q, idx) => {
      headers.push(`Câu ${idx + 1}: ${q.text.substring(0, 40)}...`);
    });

    const headerRow = sheet2.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F497D' } };

    sheet2.getColumn(1).width = 8;
    sheet2.getColumn(2).width = 20;
    sheet2.getColumn(3).width = 15;
    sheet2.getColumn(4).width = 25;
    sheet2.getColumn(5).width = 25;
    questionsSorted.forEach((q, idx) => { sheet2.getColumn(6 + idx).width = 30; });

    responses.forEach((resp, respIdx) => {
      const rowData = [
        respIdx + 1,
        new Date(resp.submittedAt).toLocaleString('vi-VN'),
        resp.respondent ? resp.respondent.code || 'N/A' : 'Nặc danh',
        resp.respondent ? resp.respondent.fullName : 'Nặc danh',
        resp.respondent ? resp.respondent.email : 'N/A'
      ];
      questionsSorted.forEach(q => {
        const ans = resp.answers.find(a => a.questionId === q.id);
        rowData.push(getAnswerText(ans, q));
      });
      sheet2.addRow(rowData);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''bao_cao_${req.params.surveyId}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xuất báo cáo Excel.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
// Route 2: Export Word (.docx)
// ─────────────────────────────────────────────────────────
router.get('/:surveyId/word', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
  try {
    const { school, department, class: classVal } = req.query;
    const { survey, responses } = await getSurveyData(req.params.surveyId, { school, department, class: classVal });
    if (!survey) return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát này.' });

    const questionsSorted = [...survey.Questions].sort((a, b) => a.order - b.order);

    const children = [];

    // Title
    children.push(new Paragraph({
      text: 'BÁO CÁO KẾT QUẢ KHẢO SÁT Ý KIẾN CÁC BÊN LIÊN QUAN',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }));

    // Survey info
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Tên khảo sát: ', bold: true }),
        new TextRun({ text: survey.title })
      ], spacing: { after: 120 }
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Mô tả: ', bold: true }),
        new TextRun({ text: survey.description || 'Không có mô tả' })
      ], spacing: { after: 120 }
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Đối tượng: ', bold: true }),
        new TextRun({ text: survey.targetAudience || 'Tất cả' })
      ], spacing: { after: 120 }
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Tổng số phản hồi: ', bold: true }),
        new TextRun({ text: `${responses.length} lượt`, bold: true, color: 'C00000' })
      ], spacing: { after: 300 }
    }));

    // Section: Questions
    children.push(new Paragraph({
      text: 'DANH SÁCH CÂU HỎI',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 }
    }));

    questionsSorted.forEach((q, idx) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${idx + 1}. ${q.text}  `, bold: true }),
          new TextRun({ text: `[${typeMapping[q.type] || q.type}]`, italics: true, color: '1F497D' })
        ], spacing: { after: 80 }
      }));
      if (q.options && q.options.length > 0) {
        q.options.forEach(opt => {
          children.push(new Paragraph({
            text: `   • ${opt.text}`,
            spacing: { after: 40 },
            indent: { left: 400 }
          }));
        });
      }
    });

    // Section: Detailed Responses (table)
    if (responses.length > 0) {
      children.push(new Paragraph({
        text: 'KẾT QUẢ CHI TIẾT',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      }));

      const tableRows = [];

      // Header row
      const headerCells = [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true })] })], shading: { type: ShadingType.SOLID, color: '1F497D', fill: '1F497D' } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Họ tên', bold: true, color: 'FFFFFF' })] })], shading: { type: ShadingType.SOLID, color: '1F497D', fill: '1F497D' } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true, color: 'FFFFFF' })] })], shading: { type: ShadingType.SOLID, color: '1F497D', fill: '1F497D' } }),
      ];
      questionsSorted.forEach((q, idx) => {
        headerCells.push(new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: `Câu ${idx + 1}`, bold: true, color: 'FFFFFF' })] })],
          shading: { type: ShadingType.SOLID, color: '1F497D', fill: '1F497D' },
          width: { size: 2000, type: WidthType.DXA }
        }));
      });
      tableRows.push(new TableRow({ children: headerCells, tableHeader: true }));

      // Data rows
      responses.forEach((resp, respIdx) => {
        const cells = [
          new TableCell({ children: [new Paragraph({ text: `${respIdx + 1}` })] }),
          new TableCell({ children: [new Paragraph({ text: resp.respondent ? resp.respondent.fullName : 'Nặc danh' })] }),
          new TableCell({ children: [new Paragraph({ text: resp.respondent ? resp.respondent.email : 'N/A' })] }),
        ];
        questionsSorted.forEach(q => {
          const ans = resp.answers.find(a => a.questionId === q.id);
          cells.push(new TableCell({ children: [new Paragraph({ text: getAnswerText(ans, q) || '—' })] }));
        });
        tableRows.push(new TableRow({ children: cells }));
      });

      children.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''bao_cao_${req.params.surveyId}.docx`);
    res.send(buffer);
  } catch (error) {
    console.error('Word export error:', error);
    res.status(500).json({ message: 'Lỗi xuất báo cáo Word.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────
// Route 3: Export PDF
// ─────────────────────────────────────────────────────────
router.get('/:surveyId/pdf', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
  try {
    const { school, department, class: classVal } = req.query;
    const { survey, responses } = await getSurveyData(req.params.surveyId, { school, department, class: classVal });
    if (!survey) return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát này.' });

    const questionsSorted = [...survey.Questions].sort((a, b) => a.order - b.order);

    const fontPath = path.join(__dirname, '../fonts/arial.ttf');
    const fontBoldPath = path.join(__dirname, '../fonts/arialbd.ttf');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''bao_cao_${req.params.surveyId}.pdf`);
    doc.pipe(res);

    // Register fonts for Vietnamese support
    doc.registerFont('Arial', fontPath);
    doc.registerFont('Arial-Bold', fontBoldPath);

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 80).fill('#1F497D');
    doc.fillColor('white').font('Arial-Bold').fontSize(16)
      .text('BÁO CÁO KẾT QUẢ KHẢO SÁT', 50, 25, { align: 'center' });
    doc.fontSize(11).font('Arial')
      .text('Hệ thống Khảo sát Ý kiến các Bên Liên quan trong Giáo dục', 50, 50, { align: 'center' });

    doc.moveDown(3);
    doc.fillColor('#1F497D').font('Arial-Bold').fontSize(14)
      .text(survey.title, { align: 'center' });

    doc.moveDown(0.5);
    doc.fillColor('#555555').font('Arial').fontSize(10)
      .text(survey.description || 'Không có mô tả', { align: 'center' });

    doc.moveDown(1);

    // ── Info box ──
    const infoY = doc.y;
    doc.rect(50, infoY, doc.page.width - 100, 70).fillAndStroke('#EEF4FD', '#D2DBEA');
    doc.fillColor('#2d4771').font('Arial-Bold').fontSize(10);
    doc.text(`Đối tượng: ${survey.targetAudience || 'Tất cả'}`, 65, infoY + 10);
    doc.text(`Trạng thái: ${survey.status}`, 65, infoY + 28);
    doc.text(`Tổng số phản hồi: ${responses.length} lượt`, 65, infoY + 46);
    doc.text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, 300, infoY + 10);
    doc.text(`Người xuất: ${req.user.fullName}`, 300, infoY + 28);

    doc.moveDown(4.5);

    // ── Questions ──
    doc.fillColor('#1F497D').font('Arial-Bold').fontSize(13)
      .text('DANH SÁCH CÂU HỎI', { underline: true });
    doc.moveDown(0.5);

    questionsSorted.forEach((q, idx) => {
      if (doc.y > doc.page.height - 120) doc.addPage();
      doc.fillColor('#2d4771').font('Arial-Bold').fontSize(10)
        .text(`${idx + 1}. ${q.text}`, { continued: false });
      doc.fillColor('#6E9AE0').font('Arial').fontSize(9)
        .text(`   [${typeMapping[q.type] || q.type}]`);
      if (q.options && q.options.length > 0) {
        q.options.forEach(opt => {
          doc.fillColor('#555555').font('Arial').fontSize(9)
            .text(`   • ${opt.text}`, { indent: 15 });
        });
      }
      doc.moveDown(0.4);
    });

    // ── Responses ──
    if (responses.length > 0) {
      doc.addPage();
      doc.fillColor('#1F497D').font('Arial-Bold').fontSize(13)
        .text('KẾT QUẢ CHI TIẾT PHẢN HỒI', { underline: true });
      doc.moveDown(0.5);

      responses.forEach((resp, respIdx) => {
        if (doc.y > doc.page.height - 150) doc.addPage();

        const respName = resp.respondent ? resp.respondent.fullName : 'Nặc danh';
        const respEmail = resp.respondent ? resp.respondent.email : 'N/A';
        const submittedAt = new Date(resp.submittedAt).toLocaleString('vi-VN');

        // Response block header
        const blockY = doc.y;
        doc.rect(50, blockY, doc.page.width - 100, 20).fill('#D2DBEA');
        doc.fillColor('#1F497D').font('Arial-Bold').fontSize(10)
          .text(`#${respIdx + 1}  ${respName}  |  ${respEmail}  |  ${submittedAt}`, 55, blockY + 5, { lineBreak: false });
        doc.moveDown(1.2);

        questionsSorted.forEach((q, qIdx) => {
          const ans = resp.answers.find(a => a.questionId === q.id);
          const ansText = getAnswerText(ans, q) || '(Không có câu trả lời)';
          doc.fillColor('#444').font('Arial-Bold').fontSize(9)
            .text(`  Câu ${qIdx + 1}: `, { continued: true });
          doc.fillColor('#666').font('Arial').fontSize(9)
            .text(ansText);
        });

        doc.moveDown(0.8);
      });
    } else {
      doc.moveDown(1);
      doc.fillColor('#999').font('Arial').fontSize(11)
        .text('Chưa có phản hồi nào cho cuộc khảo sát này.', { align: 'center' });
    }

    // ── Footer ──
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#aaa').font('Arial').fontSize(8)
        .text(`Academic Synergy © ${new Date().getFullYear()} — Trang ${i + 1}/${range.count}`, 50, doc.page.height - 40, { align: 'center', lineBreak: false });
    }

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'Lỗi xuất báo cáo PDF.', error: error.message });
  }
});

module.exports = router;
