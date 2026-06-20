const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 1. Predefined Survey Templates
const SURVEY_TEMPLATES = [
  {
    id: 'student_course',
    title: 'Khảo sát ý kiến Sinh viên về môn học',
    description: 'Khảo sát nhằm thu thập ý kiến phản hồi của sinh viên về chất lượng giảng dạy, tài liệu và nội dung học phần nhằm cải tiến chất lượng đào tạo.',
    targetAudience: 'Student',
    questions: [
      { text: 'Giảng viên lên lớp đúng giờ và thực hiện đầy đủ thời gian quy định.', type: 'likert_scale', required: true, category: 'Phương pháp giảng dạy' },
      { text: 'Phương pháp giảng dạy của giảng viên giúp sinh viên dễ tiếp thu bài học.', type: 'likert_scale', required: true, category: 'Phương pháp giảng dạy' },
      { text: 'Giảng viên nhiệt tình giải đáp thắc mắc và hỗ trợ sinh viên trong quá trình học.', type: 'likert_scale', required: true, category: 'Phương pháp giảng dạy' },
      { text: 'Tài liệu học tập, giáo trình môn học được cung cấp đầy đủ và có ích.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Nội dung học phần thiết thực, bổ ích cho chuyên ngành của bạn.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Góp ý hoặc đề xuất khác của bạn để cải tiến môn học này.', type: 'open_text', required: false, category: 'Dịch vụ hỗ trợ' }
    ]
  },
  {
    id: 'lecturer_facilities',
    title: 'Khảo sát ý kiến Giảng viên về điều kiện giảng dạy',
    description: 'Thu thập ý kiến của giảng viên về cơ sở vật chất giảng đường, trang thiết bị kỹ thuật hỗ trợ và môi trường làm việc tại trường.',
    targetAudience: 'Lecturer',
    questions: [
      { text: 'Phòng học được vệ sinh sạch sẽ, đủ ánh sáng và thoáng mát.', type: 'likert_scale', required: true, category: 'Cơ sở vật chất' },
      { text: 'Thiết bị giảng dạy (máy chiếu, âm thanh, Wi-Fi, bảng viết) hoạt động ổn định.', type: 'likert_scale', required: true, category: 'Cơ sở vật chất' },
      { text: 'Công tác hỗ trợ kỹ thuật tại các khu giảng đường nhanh chóng và kịp thời.', type: 'likert_scale', required: true, category: 'Dịch vụ hỗ trợ' },
      { text: 'Các chính sách hỗ trợ nghiên cứu khoa học và giảng dạy của nhà trường phù hợp.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Ý kiến đóng góp hoặc đề xuất cải thiện cơ sở vật chất phòng học của giảng viên.', type: 'open_text', required: false, category: 'Cơ sở vật chất' }
    ]
  },
  {
    id: 'alumni_program',
    title: 'Khảo sát Cựu sinh viên về chất lượng chương trình đào tạo',
    description: 'Khảo sát đánh giá mức độ phù hợp và hữu ích của chương trình đào tạo đối với công việc thực tế của cựu sinh viên sau khi tốt nghiệp.',
    targetAudience: 'Alumnus',
    questions: [
      { text: 'Kiến thức chuyên môn được trang bị giúp bạn nhanh chóng tiếp cận và làm quen với công việc.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Các kỹ năng thực hành nghề nghiệp được đào tạo đáp ứng tốt yêu cầu công việc.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Các kỹ năng mềm (giao tiếp, làm việc nhóm, thuyết trình) được rèn luyện tốt khi học tại trường.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Hoạt động hỗ trợ giới thiệu việc làm và hướng nghiệp của nhà trường có hiệu quả.', type: 'likert_scale', required: true, category: 'Dịch vụ hỗ trợ' },
      { text: 'Đóng góp ý kiến của cựu sinh viên để cải tiến và phát triển chương trình đào tạo tốt hơn.', type: 'open_text', required: false, category: 'Chương trình đào tạo' }
    ]
  },
  {
    id: 'employer_evaluation',
    title: 'Khảo sát Nhà tuyển dụng về chất lượng sinh viên tốt nghiệp',
    description: 'Ý kiến đánh giá từ phía doanh nghiệp về năng lực chuyên môn, thái độ làm việc và kỹ năng thích ứng của sinh viên trường sau khi được tuyển dụng.',
    targetAudience: 'Employer',
    questions: [
      { text: 'Kiến thức chuyên môn của sinh viên tốt nghiệp đáp ứng yêu cầu công việc thực tế tại cơ quan/doanh nghiệp.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Khả năng ứng dụng công nghệ thông tin và ngoại ngữ của sinh viên trong công việc tốt.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Sinh viên có ý thức tổ chức kỷ luật, tác phong làm việc chuyên nghiệp và tuân thủ quy định.', type: 'likert_scale', required: true, category: 'Phương pháp giảng dạy' },
      { text: 'Khả năng làm việc nhóm, kỹ năng giao tiếp và giải quyết vấn đề của sinh viên tốt.', type: 'likert_scale', required: true, category: 'Chương trình đào tạo' },
      { text: 'Doanh nghiệp mong muốn nhà trường bổ sung hoặc tập trung đào tạo thêm các kỹ năng/kiến thức nào?', type: 'open_text', required: false, category: 'Chương trình đào tạo' }
    ]
  }
];

// 2. Predefined Question Bank Items
const QUESTION_BANK = [
  { text: 'Phòng học lý thuyết được trang bị đầy đủ bàn ghế, bảng viết chất lượng tốt.', type: 'likert_scale', category: 'Cơ sở vật chất', targetAudience: 'Student' },
  { text: 'Hệ thống máy tính phòng thực hành có cấu hình tốt, đáp ứng nhu cầu thực tập môn học.', type: 'likert_scale', category: 'Cơ sở vật chất', targetAudience: 'Student' },
  { text: 'Hệ thống mạng Wi-Fi của nhà trường ổn định, tốc độ truy cập tốt.', type: 'likert_scale', category: 'Cơ sở vật chất', targetAudience: 'Student' },
  { text: 'Thư viện trường có nguồn tài liệu học tập, giáo trình tham khảo phong phú.', type: 'likert_scale', category: 'Cơ sở vật chất', targetAudience: 'Student' },
  
  { text: 'Đề cương chi tiết môn học được công bố rõ ràng ngay từ khi bắt đầu học phần.', type: 'likert_scale', category: 'Chương trình đào tạo', targetAudience: 'Student' },
  { text: 'Phương pháp kiểm tra, đánh giá kết quả học tập khách quan, chính xác và công bằng.', type: 'likert_scale', category: 'Chương trình đào tạo', targetAudience: 'Student' },
  
  { text: 'Giảng viên giải thích rõ các nội dung khó và hướng dẫn sinh viên tự nghiên cứu.', type: 'likert_scale', category: 'Phương pháp giảng dạy', targetAudience: 'Student' },
  { text: 'Giảng viên tổ chức các hoạt động thảo luận nhóm sôi nổi tại lớp học.', type: 'likert_scale', category: 'Phương pháp giảng dạy', targetAudience: 'Student' },
  
  { text: 'Thủ tục hành chính (đăng ký môn học, rút môn...) nhanh chóng, thuận tiện.', type: 'likert_scale', category: 'Dịch vụ hỗ trợ', targetAudience: 'Student' },
  { text: 'Các câu lạc bộ, hoạt động văn thể mỹ bổ ích cho sự phát triển toàn diện của sinh viên.', type: 'likert_scale', category: 'Dịch vụ hỗ trợ', targetAudience: 'Student' },
  
  { text: 'Nhà trường cung cấp đầy đủ các trang thiết bị phục vụ công tác giảng dạy.', type: 'likert_scale', category: 'Cơ sở vật chất', targetAudience: 'Lecturer' },
  { text: 'Môi trường làm việc tại trường thân thiện, chuyên nghiệp và có sự gắn kết.', type: 'likert_scale', category: 'Dịch vụ hỗ trợ', targetAudience: 'Lecturer' },
  
  { text: 'Doanh nghiệp đánh giá thế nào về khả năng học hỏi và tự nâng cao trình độ của sinh viên tốt nghiệp?', type: 'likert_scale', category: 'Chương trình đào tạo', targetAudience: 'Employer' },
  { text: 'Mức độ đáp ứng của sinh viên tốt nghiệp đối với văn hóa doanh nghiệp của đơn vị.', type: 'likert_scale', category: 'Chương trình đào tạo', targetAudience: 'Employer' }
];

// GET /api/surveys/templates
router.get('/templates', authenticateToken, (req, res) => {
  res.json(SURVEY_TEMPLATES);
});

// GET /api/question-bank
router.get('/question-bank', authenticateToken, (req, res) => {
  const { targetAudience } = req.query;
  if (targetAudience) {
    const filtered = QUESTION_BANK.filter(q => q.targetAudience === targetAudience || q.targetAudience === 'All');
    return res.json(filtered);
  }
  res.json(QUESTION_BANK);
});

module.exports = router;
