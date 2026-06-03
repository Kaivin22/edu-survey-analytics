const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const {
  Role,
  User,
  Survey,
  Question,
  QuestionOption,
  Response,
  Answer,
  Notification
} = require('../models');

async function seed() {
  try {
    console.log('Synchronizing database models...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully!');

    // 1. Seed Roles
    console.log('Seeding Roles...');
    const roles = await Role.bulkCreate([
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Manager' },
      { id: 3, name: 'Student' },
      { id: 4, name: 'Lecturer' },
      { id: 5, name: 'Alumnus' },
      { id: 6, name: 'Employer' }
    ]);
    console.log('Roles seeded.');

    // 2. Seed Users
    console.log('Seeding Users...');
    const hashedPassword = await bcrypt.hash('12345678', 10);
    const users = await User.bulkCreate([
      {
        email: 'admin@edu.vn',
        password: hashedPassword,
        fullName: 'Nguyễn Quản Trị',
        code: 'ADMIN001',
        roleId: 1,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Công nghệ thông tin'
      },
      {
        email: 'manager@edu.vn',
        password: hashedPassword,
        fullName: 'Trần Cán Bộ',
        code: 'CBQL001',
        roleId: 2,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Công nghệ thông tin'
      },
      {
        email: 'student1@edu.vn',
        password: hashedPassword,
        fullName: 'Trần Kim Liên',
        code: '2251220153',
        roleId: 3,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Công nghệ thông tin',
        class: '22CT4'
      },
      {
        email: 'student2@edu.vn',
        password: hashedPassword,
        fullName: 'Nguyễn Văn Tuấn',
        code: '2251220274',
        roleId: 3,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Công nghệ thông tin',
        class: '22CT4'
      },
      {
        email: 'lecturer1@edu.vn',
        password: hashedPassword,
        fullName: 'Phạm Giảng Viên',
        code: 'GV202201',
        roleId: 4,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Công nghệ thông tin'
      },
      {
        email: 'alumnus1@edu.vn',
        password: hashedPassword,
        fullName: 'Hoàng Cựu SV',
        code: 'CSV2020',
        roleId: 5,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Kinh tế'
      },
      {
        email: 'employer1@edu.vn',
        password: hashedPassword,
        fullName: 'FPT Software (Đại diện)',
        code: 'TAX_FPT_01',
        roleId: 6,
        school: 'Việt Hàn (VKU)',
        department: 'Khoa học Máy tính'
      },
      // Additional users for rich filter stats
      {
        email: 'student3@edu.vn',
        password: hashedPassword,
        fullName: 'Lê Văn Tám',
        code: '2251220333',
        roleId: 3,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Công nghệ thông tin',
        class: '22CT1'
      },
      {
        email: 'student4@edu.vn',
        password: hashedPassword,
        fullName: 'Phạm Thị Chín',
        code: '2251220444',
        roleId: 3,
        school: 'Kiến trúc Đà Nẵng (DAU)',
        department: 'Kinh tế',
        class: '22KTQD1'
      },
      {
        email: 'student5@edu.vn',
        password: hashedPassword,
        fullName: 'Hoàng Văn Mười',
        code: '2211220555',
        roleId: 3,
        school: 'Việt Hàn (VKU)',
        department: 'Khoa học Máy tính',
        class: '22IT1'
      },
      {
        email: 'student6@edu.vn',
        password: hashedPassword,
        fullName: 'Đỗ Thị Một',
        code: '2211220666',
        roleId: 3,
        school: 'Việt Hàn (VKU)',
        department: 'Kinh tế số & Thương mại điện tử',
        class: '22EC1'
      }
    ]);
    console.log('Users seeded.');

    // 3. Seed Surveys & Questions
    console.log('Seeding Surveys...');
    
    // --- Survey 1: Student Survey ---
    const survey1 = await Survey.create({
      title: 'Khảo sát Ý kiến Sinh viên về Chất lượng Môn học & Giảng dạy',
      description: 'Nhằm cải tiến chất lượng dạy và học tại nhà trường, mong các em sinh viên cung cấp phản hồi trung thực và khách quan nhất.',
      targetAudience: 'Student',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdBy: 1,
      school: 'Kiến trúc Đà Nẵng (DAU)',
      department: 'Công nghệ thông tin',
      class: '22CT4'
    });

    const q1_1 = await Question.create({
      surveyId: survey1.id,
      text: 'Môn học cung cấp cho bạn nhiều kiến thức thực tế bổ ích?',
      type: 'likert_scale',
      required: true,
      order: 1
    });

    const q1_2 = await Question.create({
      surveyId: survey1.id,
      text: 'Giảng viên truyền đạt kiến thức rõ ràng, dễ hiểu và nhiệt tình?',
      type: 'likert_scale',
      required: true,
      order: 2
    });

    const q1_3 = await Question.create({
      surveyId: survey1.id,
      text: 'Phương pháp đánh giá, thi cử của môn học này là:',
      type: 'single_choice',
      required: true,
      order: 3
    });
    await QuestionOption.bulkCreate([
      { questionId: q1_3.id, text: 'Quá dễ, không đánh giá đúng thực lực', order: 1 },
      { questionId: q1_3.id, text: 'Phù hợp, khách quan, phân loại tốt', order: 2 },
      { questionId: q1_3.id, text: 'Quá nặng, lý thuyết suông và khó hiểu', order: 3 }
    ]);

    const q1_4 = await Question.create({
      surveyId: survey1.id,
      text: 'Cơ sở vật chất của phòng học (máy chiếu, âm thanh, điều hòa) đáp ứng yêu cầu học tập?',
      type: 'likert_scale',
      required: false,
      order: 4
    });

    const q1_5 = await Question.create({
      surveyId: survey1.id,
      text: 'Hãy đóng góp ý kiến khác để nhà trường cải tiến tốt hơn môn học này:',
      type: 'open_text',
      required: false,
      order: 5
    });

    // --- Survey 2: Lecturer Survey ---
    const survey2 = await Survey.create({
      title: 'Khảo sát Điều kiện Giảng dạy & Hỗ trợ Chuyên môn cho Giảng viên',
      description: 'Khảo sát định kỳ thu thập phản hồi từ Quý Thầy/Cô về cơ sở vật chất, giáo trình và chế độ đãi ngộ của nhà trường.',
      targetAudience: 'Lecturer',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      createdBy: 1,
      school: 'Kiến trúc Đà Nẵng (DAU)',
      department: 'Công nghệ thông tin'
    });

    const q2_1 = await Question.create({
      surveyId: survey2.id,
      text: 'Môi trường làm việc và sự hỗ trợ của Ban Giám hiệu đối với giảng viên rất tốt?',
      type: 'likert_scale',
      required: true,
      order: 1
    });

    const q2_2 = await Question.create({
      surveyId: survey2.id,
      text: 'Công cụ và thiết bị giảng dạy (phòng máy, lab, thư viện) đáp ứng tốt yêu cầu nghiên cứu và giảng dạy?',
      type: 'likert_scale',
      required: true,
      order: 2
    });

    const q2_3 = await Question.create({
      surveyId: survey2.id,
      text: 'Đề xuất nâng cấp nào Thầy/Cô thấy cấp thiết nhất?',
      type: 'multiple_choice',
      required: true,
      order: 3
    });
    await QuestionOption.bulkCreate([
      { questionId: q2_3.id, text: 'Trang bị máy tính cấu hình cao tại phòng Lab', order: 1 },
      { questionId: q2_3.id, text: 'Hệ thống điều hòa và âm thanh giảng đường', order: 2 },
      { questionId: q2_3.id, text: 'Mua bản quyền phần mềm chuyên ngành và tài liệu số', order: 3 },
      { questionId: q2_3.id, text: 'Hỗ trợ kinh phí công bố bài báo khoa học quốc tế', order: 4 }
    ]);

    const q2_4 = await Question.create({
      surveyId: survey2.id,
      text: 'Ý kiến đóng góp khác của Thầy/Cô:',
      type: 'open_text',
      required: false,
      order: 4
    });

    // --- Survey 3: Alumnus Survey ---
    const survey3 = await Survey.create({
      title: 'Khảo sát Tình hình Việc làm & Đánh giá CTĐT sau Tốt nghiệp',
      description: 'Ý kiến của cựu sinh viên giúp nhà trường cải tiến chương trình đào tạo bám sát thực tiễn doanh nghiệp.',
      targetAudience: 'Alumnus',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      createdBy: 1,
      school: 'Kiến trúc Đà Nẵng (DAU)',
      department: 'Kinh tế'
    });

    const q3_1 = await Question.create({
      surveyId: survey3.id,
      text: 'Thời gian bạn tìm được công việc đầu tiên sau khi tốt nghiệp là:',
      type: 'single_choice',
      required: true,
      order: 1
    });
    await QuestionOption.bulkCreate([
      { questionId: q3_1.id, text: 'Có việc trước khi tốt nghiệp', order: 1 },
      { questionId: q3_1.id, text: 'Dưới 3 tháng', order: 2 },
      { questionId: q3_1.id, text: '3 đến 6 tháng', order: 3 },
      { questionId: q3_1.id, text: 'Trên 6 tháng', order: 4 }
    ]);

    const q3_2 = await Question.create({
      surveyId: survey3.id,
      text: 'Kiến thức được đào tạo tại trường đáp ứng tốt cho công việc hiện tại của bạn?',
      type: 'likert_scale',
      required: true,
      order: 2
    });

    const q3_3 = await Question.create({
      surveyId: survey3.id,
      text: 'Kỹ năng nào bạn phải tự trau dồi thêm ngoài chương trình học nhiều nhất?',
      type: 'multiple_choice',
      required: true,
      order: 3
    });
    await QuestionOption.bulkCreate([
      { questionId: q3_3.id, text: 'Kỹ năng ngoại ngữ (Tiếng Anh/Nhật...)', order: 1 },
      { questionId: q3_3.id, text: 'Kỹ năng giao tiếp và làm việc nhóm', order: 2 },
      { questionId: q3_3.id, text: 'Kỹ năng công nghệ mới (Cloud, AI, DevOps)', order: 3 },
      { questionId: q3_3.id, text: 'Kỹ năng quản trị dự án, giải quyết vấn đề', order: 4 }
    ]);

    const q3_4 = await Question.create({
      surveyId: survey3.id,
      text: 'Góp ý cụ thể của bạn về chương trình đào tạo của Khoa:',
      type: 'open_text',
      required: false,
      order: 4
    });

    // --- Survey 4: Employer Survey ---
    const survey4 = await Survey.create({
      title: 'Khảo sát Doanh nghiệp tuyển dụng về Chất lượng Sinh viên Tốt nghiệp',
      description: 'Khảo sát ý kiến đóng góp từ các nhà tuyển dụng để nâng cao chất lượng nguồn nhân lực đáp ứng tốt thị trường.',
      targetAudience: 'Employer',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: 1,
      school: 'Việt Hàn (VKU)',
      department: 'Khoa học Máy tính'
    });

    const q4_1 = await Question.create({
      surveyId: survey4.id,
      text: 'Sinh viên trường có kiến thức nền tảng chuyên môn rất vững vàng?',
      type: 'likert_scale',
      required: true,
      order: 1
    });

    const q4_2 = await Question.create({
      surveyId: survey4.id,
      text: 'Thái độ làm việc, kỷ luật và tính chủ động của sinh viên:',
      type: 'likert_scale',
      required: true,
      order: 2
    });

    const q4_3 = await Question.create({
      surveyId: survey4.id,
      text: 'Khả năng sử dụng ngoại ngữ trong công việc thực tế của sinh viên đáp ứng:',
      type: 'single_choice',
      required: true,
      order: 3
    });
    await QuestionOption.bulkCreate([
      { questionId: q4_3.id, text: 'Rất tốt, làm việc trực tiếp với khách hàng nước ngoài', order: 1 },
      { questionId: q4_3.id, text: 'Đủ dùng cho đọc hiểu tài liệu và giao tiếp cơ bản', order: 2 },
      { questionId: q4_3.id, text: 'Còn yếu, cần đào tạo lại nhiều', order: 3 }
    ]);

    const q4_4 = await Question.create({
      surveyId: survey4.id,
      text: 'Doanh nghiệp đánh giá kỹ năng mềm nào của sinh viên cần cải thiện nhất?',
      type: 'multiple_choice',
      required: true,
      order: 4
    });
    await QuestionOption.bulkCreate([
      { questionId: q4_4.id, text: 'Kỹ năng thuyết trình & đàm phán', order: 1 },
      { questionId: q4_4.id, text: 'Kỹ năng giải quyết khủng hoảng và áp lực', order: 2 },
      { questionId: q4_4.id, text: 'Kỹ năng tư duy logic và thuật toán', order: 3 }
    ]);

    const q4_5 = await Question.create({
      surveyId: survey4.id,
      text: 'Những đóng góp cụ thể khác của Doanh nghiệp với nhà trường:',
      type: 'open_text',
      required: false,
      order: 5
    });

    console.log('Surveys & Questions seeded.');

    // 4. Seed Mock Responses and Answers to make beautiful charts!
    console.log('Seeding Mock Responses and Answers for Survey 1...');
    
    // We will simulate 10 mock submissions for Survey 1 from different students
    // q1_1: Likert scale 1-5 (Môn học bổ ích)
    // q1_2: Likert scale 1-5 (Giảng viên rõ ràng)
    // q1_3: Single Choice: Option 1 (Quá dễ), Option 2 (Phù hợp), Option 3 (Quá nặng)
    // q1_4: Likert scale 1-5 (Cơ sở vật chất)
    // q1_5: Open Text
    
    const mockStudents = [
      { id: 3, name: 'Trần Kim Liên' },
      { id: 4, name: 'Nguyễn Văn Tuấn' }
    ];

    const survey1Options = await QuestionOption.findAll({
      include: [{ model: Question, where: { surveyId: survey1.id } }]
    });

    const optId1 = survey1Options.find(o => o.text.includes('Quá dễ')).id;
    const optId2 = survey1Options.find(o => o.text.includes('Phù hợp')).id;
    const optId3 = survey1Options.find(o => o.text.includes('Quá nặng')).id;

    const mockSubmissions = [
      { studentId: 3, q1: '5', q2: '5', q3: optId2, q4: '4', q5: 'Môn học rất bổ ích, mong muốn thực hành nhiều hơn' },
      { studentId: 4, q1: '4', q2: '4', q3: optId2, q4: '3', q5: 'Giảng viên giảng dạy rất hay' },
      { studentId: 8, q1: '5', q2: '4', q3: optId2, q4: '5', q5: 'Cơ sở vật chất của khoa đã cải thiện nhiều' },
      { studentId: 9, q1: '3', q2: '3', q3: optId3, q4: '2', q5: 'Lý thuyết hơi nặng, thi khó' },
      { studentId: 10, q1: '4', q2: '5', q3: optId2, q4: '4', q5: 'Học tập ở trường rất tốt.' },
      { studentId: 11, q1: '5', q2: '5', q3: optId2, q4: '4', q5: 'Thầy cô tận tâm hỗ trợ nhiệt tình!' },
      { studentId: 8, q1: '2', q2: '3', q3: optId3, q4: '3', q5: 'Cần cập nhật giáo trình mới hơn' },
      { studentId: 3, q1: '4', q2: '4', q3: optId2, q4: '5', q5: 'Rất hài lòng về chất lượng dạy' },
      { studentId: 4, q1: '5', q2: '4', q3: optId1, q4: '4', q5: 'Đề thi hơi dễ so với kiến thức học' },
      { studentId: 10, q1: '4', q2: '5', q3: optId2, q4: '3', q5: 'Chúc khoa phát triển!' }
    ];

    for (let sub of mockSubmissions) {
      const resp = await Response.create({
        surveyId: survey1.id,
        userId: sub.studentId,
        submittedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) // within last 5 days
      });

      await Answer.create({ responseId: resp.id, questionId: q1_1.id, answerText: sub.q1 });
      await Answer.create({ responseId: resp.id, questionId: q1_2.id, answerText: sub.q2 });
      await Answer.create({ responseId: resp.id, questionId: q1_3.id, selectedOptions: JSON.stringify([sub.q3]) });
      await Answer.create({ responseId: resp.id, questionId: q1_4.id, answerText: sub.q4 });
      if (sub.q5) {
        await Answer.create({ responseId: resp.id, questionId: q1_5.id, answerText: sub.q5 });
      }
    }

    // Seed mock responses for Employer Survey to look very professional
    console.log('Seeding Mock Responses for Employer Survey...');
    const employerOptions = await QuestionOption.findAll({
      include: [{ model: Question, where: { surveyId: survey4.id } }]
    });

    const empOpt1 = employerOptions.find(o => o.text.includes('Rất tốt')).id;
    const empOpt2 = employerOptions.find(o => o.text.includes('Đủ dùng')).id;
    const empOpt3 = employerOptions.find(o => o.text.includes('Còn yếu')).id;

    const empSoftSkills = employerOptions.filter(o => o.questionId === q4_4.id);
    const empSoft1 = empSoftSkills[0].id;
    const empSoft2 = empSoftSkills[1].id;

    const mockEmpSubmissions = [
      { userId: 7, q1: '4', q2: '5', q3: empOpt1, q4: [empSoft1], q5: 'Sinh viên trường có thái độ làm việc cực kỳ tốt' },
      { userId: 7, q1: '5', q2: '4', q3: empOpt2, q4: [empSoft1, empSoft2], q5: 'Kiến thức chuyên môn vững vàng, tuy nhiên kỹ năng đàm phán cần cải thiện' },
      { userId: 7, q1: '4', q2: '4', q3: empOpt2, q4: [empSoft2], q5: 'Đáp ứng tốt nhu cầu phát triển phần mềm' }
    ];

    for (let sub of mockEmpSubmissions) {
      const resp = await Response.create({
        surveyId: survey4.id,
        userId: sub.userId,
        submittedAt: new Date()
      });

      await Answer.create({ responseId: resp.id, questionId: q4_1.id, answerText: sub.q1 });
      await Answer.create({ responseId: resp.id, questionId: q4_2.id, answerText: sub.q2 });
      await Answer.create({ responseId: resp.id, questionId: q4_3.id, selectedOptions: JSON.stringify([sub.q3]) });
      await Answer.create({ responseId: resp.id, questionId: q4_4.id, selectedOptions: JSON.stringify(sub.q4) });
      if (sub.q5) {
        await Answer.create({ responseId: resp.id, questionId: q4_5.id, answerText: sub.q5 });
      }
    }

    console.log('Mock responses seeded successfully!');

    // 5. Seed Notifications
    console.log('Seeding Notifications...');
    await Notification.bulkCreate([
      {
        userId: 3,
        title: 'Khảo sát mới',
        message: 'Bạn được mời thực hiện: "Khảo sát Ý kiến Sinh viên về Chất lượng Môn học & Giảng dạy"',
        isRead: false
      },
      {
        userId: 4,
        title: 'Khảo sát mới',
        message: 'Bạn được mời thực hiện: "Khảo sát Ý kiến Sinh viên về Chất lượng Môn học & Giảng dạy"',
        isRead: false
      },
      {
        userId: 5,
        title: 'Chào mừng Thầy/Cô',
        message: 'Chào mừng Quý Thầy/Cô đến với Hệ thống Khảo sát ý kiến các bên liên quan.',
        isRead: true
      }
    ]);
    console.log('Notifications seeded.');

    console.log('ALL DB SEEDING COMPLETED SUCCESSFULLY! 🎉');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// If run directly
if (require.main === module) {
  seed().then(() => sequelize.close());
}

module.exports = seed;
