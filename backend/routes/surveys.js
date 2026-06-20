const express = require('express');
const router = express.Router();
const {
  Survey,
  Question,
  QuestionOption,
  Response,
  Answer,
  User,
  Role,
  sequelize
} = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 1. Get Surveys List
// - Admins get all surveys.
// - Managers get surveys for their school.
// - Other roles get active surveys corresponding to their targetAudience that they haven't submitted yet.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    // Auto-close expired surveys
    await Survey.update(
      { status: 'Closed' },
      {
        where: {
          status: 'Active',
          endDate: {
            [Op.ne]: null,
            [Op.lt]: new Date()
          }
        }
      }
    );

    const userRole = req.user.role;
    const userId = req.user.id;
    const { createdOnly, history } = req.query;

    if (createdOnly === 'true' || userRole === 'Manager') {
      const whereClause = {};
      if (createdOnly === 'true') {
        whereClause.createdBy = userId;
      }

      // Manager can only see surveys from their school
      if (userRole === 'Manager') {
        const manager = await User.findByPk(userId);
        if (manager && manager.school) {
          whereClause.school = manager.school;
        } else {
          return res.json([]);
        }
      }

      const surveys = await Survey.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'creator', attributes: ['fullName', 'email'] },
          { model: Question, attributes: ['id'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Map count of questions
      const formatted = surveys.map(s => ({
        ...s.toJSON(),
        questionCount: s.Questions ? s.Questions.length : 0
      }));
      return res.json(formatted);
    } else {
      if (history === 'true') {
        const userResponses = await Response.findAll({
          where: { userId },
          include: [{
            model: Survey,
            include: [{ model: Question, attributes: ['id'] }]
          }],
          order: [['submittedAt', 'DESC']]
        });

        const formattedHistory = userResponses.map(r => {
          if (!r.Survey) return null;
          return {
            ...r.Survey.toJSON(),
            responseId: r.id,
            questionCount: r.Survey.Questions ? r.Survey.Questions.length : 0,
            submittedAt: r.submittedAt
          };
        }).filter(Boolean);

        return res.json(formattedHistory);
      }

      // Find the logged-in user to filter surveys targeted to their school/dept/class
      const user = await User.findByPk(userId);

      const now = new Date();
      const surveyWhere = {
        status: 'Active',
        targetAudience: [userRole, 'All'],
        // Datetime scheduling: only show surveys within valid time range
        [Op.or]: [
          { startDate: null },
          { startDate: { [Op.lte]: now } }
        ]
      };

      if (user) {
        // Filter: survey must match user's school or be null/empty
        surveyWhere.school = {
          [Op.or]: [null, '', user.school]
        };
        // Filter: survey must match user's department or be null/empty
        surveyWhere.department = {
          [Op.or]: [null, '', user.department]
        };
      }

      const surveys = await Survey.findAll({
        where: surveyWhere,
        include: [{ model: Question, attributes: ['id'] }],
        order: [['createdAt', 'DESC']]
      });

      // Filter out expired surveys and already submitted ones
      const submittedResponses = await Response.findAll({
        where: { userId },
        attributes: ['surveyId']
      });
      const submittedIds = submittedResponses.map(r => r.surveyId);

      const filtered = surveys
        .filter(s => {
          // Filter out already submitted
          if (submittedIds.includes(s.id)) return false;
          // Filter out expired surveys
          if (s.endDate && new Date(s.endDate) < now) return false;
          // Filter: for students and alumni, survey must match user's class if survey.class is specified
          if (['Student', 'Alumnus'].includes(userRole) && s.class && s.class.trim() !== '') {
            if (!user.class) return false;
            const targetClasses = s.class.split(',').map(c => c.trim().toLowerCase());
            if (!targetClasses.includes(user.class.toLowerCase())) {
              return false;
            }
          }
          // Filter: for employers, check specific targeted email address lists in s.class if specified
          if (userRole === 'Employer' && s.class && s.class.trim() !== '') {
            const targetEmails = s.class.split(',').map(e => e.trim().toLowerCase());
            if (!targetEmails.includes(user.email.toLowerCase())) {
              return false;
            }
          }
          return true;
        })
        .map(s => ({
          ...s.toJSON(),
          questionCount: s.Questions ? s.Questions.length : 0
        }));

      return res.json(filtered);
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách cuộc khảo sát.', error: error.message });
  }
});

// 2. Get Survey Detail with Questions & Options
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    // Auto-close expired surveys
    await Survey.update(
      { status: 'Closed' },
      {
        where: {
          status: 'Active',
          endDate: {
            [Op.ne]: null,
            [Op.lt]: new Date()
          }
        }
      }
    );

    const survey = await Survey.findByPk(req.params.id, {
      include: [
        {
          model: Question,
          as: 'Questions',
          include: [
            {
              model: QuestionOption,
              as: 'options'
            }
          ]
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát này.' });
    }

    // Check datetime validity for non-admin/manager users wanting to take the survey
    const userRole = req.user.role;
    if (userRole !== 'Manager') {
      const now = new Date();
      if (survey.startDate && new Date(survey.startDate) > now) {
        return res.status(400).json({ message: 'Khảo sát này chưa bắt đầu.' });
      }
      if (survey.endDate && new Date(survey.endDate) < now) {
        return res.status(400).json({ message: 'Khảo sát này đã hết hạn.' });
      }
    }

    // Sort questions and options by order
    const data = survey.toJSON();
    if (data.Questions) {
      data.Questions.sort((a, b) => a.order - b.order);
      data.Questions.forEach(q => {
        if (q.options) {
          q.options.sort((a, b) => a.order - b.order);
        }
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết cuộc khảo sát.', error: error.message });
  }
});

// 3. Create Survey (Admin, Manager)
router.post('/', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, description, targetAudience, status, startDate, endDate, questions, school, department, class: classVal } = req.body;

    if (!title || !targetAudience) {
      return res.status(400).json({ message: 'Tiêu đề và đối tượng khảo sát là bắt buộc.' });
    }

    let finalSchool = school || null;
    if (req.user.role === 'Manager') {
      const manager = await User.findByPk(req.user.id);
      if (!manager || !manager.school) {
        return res.status(403).json({ message: 'Không xác định được trường của bạn.' });
      }
      finalSchool = manager.school;
    }

    const survey = await Survey.create({
      title,
      description,
      targetAudience,
      status: status || 'Draft',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      createdBy: req.user.id,
      school: finalSchool,
      department: department || null,
      class: classVal || null
    }, { transaction });

    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const newQuestion = await Question.create({
          surveyId: survey.id,
          text: q.text,
          type: q.type,
          required: q.required || false,
          order: q.order || i,
          category: q.category || null
        }, { transaction });

        if (q.options && Array.isArray(q.options) && ['single_choice', 'multiple_choice'].includes(q.type)) {
          for (let j = 0; j < q.options.length; j++) {
            await QuestionOption.create({
              questionId: newQuestion.id,
              text: q.options[j].text,
              order: q.options[j].order || j
            }, { transaction });
          }
        }
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Tạo khảo sát thành công!', surveyId: survey.id });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Lỗi tạo cuộc khảo sát.', error: error.message });
  }
});

// 4. Update Survey (Admin, Manager)
router.put('/:id', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, description, targetAudience, status, startDate, endDate, questions, school, department, class: classVal } = req.body;
    const surveyId = req.params.id;

    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Không tìm thấy khảo sát để chỉnh sửa.' });
    }

    let finalSchool = school || null;
    if (req.user.role === 'Manager') {
      const manager = await User.findByPk(req.user.id);
      if (!manager || !manager.school || survey.school !== manager.school) {
        return res.status(403).json({ message: 'Bạn chỉ có thể chỉnh sửa khảo sát của trường mình.' });
      }
      finalSchool = manager.school;
    }

    // Update main fields
    await survey.update({
      title,
      description,
      targetAudience,
      status,
      startDate,
      endDate,
      school: finalSchool,
      department: department || null,
      class: classVal || null
    }, { transaction });

    // Handle questions. Easy method: delete old questions and options, insert new ones.
    // This maintains database integrity and is safe inside transactions.
    const oldQuestions = await Question.findAll({ where: { surveyId } });
    const oldQuestionIds = oldQuestions.map(q => q.id);

    // Cascade deletes Options and Answers automatically due to CASCADE rules
    await Question.destroy({ where: { surveyId }, transaction });

    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const newQuestion = await Question.create({
          surveyId: survey.id,
          text: q.text,
          type: q.type,
          required: q.required || false,
          order: q.order || i,
          category: q.category || null
        }, { transaction });

        if (q.options && Array.isArray(q.options) && ['single_choice', 'multiple_choice'].includes(q.type)) {
          for (let j = 0; j < q.options.length; j++) {
            await QuestionOption.create({
              questionId: newQuestion.id,
              text: q.options[j].text,
              order: q.options[j].order || j
            }, { transaction });
          }
        }
      }
    }

    await transaction.commit();
    res.json({ message: 'Cập nhật cuộc khảo sát thành công!' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Lỗi cập nhật cuộc khảo sát.', error: error.message });
  }
});

// 5. Delete Survey (Admin, Manager)
router.delete('/:id', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát cần xóa.' });
    }

    if (req.user.role === 'Manager') {
      const manager = await User.findByPk(req.user.id);
      if (!manager || !manager.school || survey.school !== manager.school) {
        return res.status(403).json({ message: 'Bạn chỉ có thể xóa khảo sát của trường mình.' });
      }
    }

    await survey.destroy(); // Cascades deletes to Questions, Options, Responses
    res.json({ message: 'Xóa cuộc khảo sát thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa cuộc khảo sát.', error: error.message });
  }
});

// 6. Submit Survey Response (All authenticated users targeting the survey)
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const surveyId = req.params.id;
    const userId = req.user.id;
    const { answers } = req.body;

    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Khảo sát không tồn tại.' });
    }

    if (survey.status !== 'Active') {
      return res.status(400).json({ message: 'Cuộc khảo sát này hiện tại đã đóng hoặc chưa được kích hoạt.' });
    }

    // Check datetime validity
    const now = new Date();
    if (survey.startDate && new Date(survey.startDate) > now) {
      return res.status(400).json({ message: 'Khảo sát này chưa bắt đầu.' });
    }
    if (survey.endDate && new Date(survey.endDate) < now) {
      return res.status(400).json({ message: 'Khảo sát này đã hết hạn. Bạn không thể gửi phản hồi nữa.' });
    }

    // Check if user already submitted
    const existing = await Response.findOne({ where: { surveyId, userId } });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã thực hiện cuộc khảo sát này rồi.' });
    }

    // Create response
    const response = await Response.create({
      surveyId,
      userId
    }, { transaction });

    // Store answers
    if (answers && Array.isArray(answers)) {
      for (let ans of answers) {
        const question = await Question.findByPk(ans.questionId);
        if (!question) continue;

        let selected = null;
        let textAns = null;

        if (['single_choice', 'multiple_choice'].includes(question.type)) {
          selected = JSON.stringify(ans.selectedOptions || []);
        } else {
          textAns = String(ans.answerText || '');
        }

        await Answer.create({
          responseId: response.id,
          questionId: ans.questionId,
          answerText: textAns,
          selectedOptions: selected
        }, { transaction });
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Gửi khảo sát thành công! Xin cảm ơn phản hồi của bạn.' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Lỗi gửi câu trả lời khảo sát.', error: error.message });
  }
});

// 7. Get Survey Statistical Data (Admin, Manager)
router.get('/:id/stats', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const { Op } = require('sequelize');
    // Auto-close expired surveys
    await Survey.update(
      { status: 'Closed' },
      {
        where: {
          status: 'Active',
          endDate: {
            [Op.ne]: null,
            [Op.lt]: new Date()
          }
        }
      }
    );

    const surveyId = req.params.id;
    const { school, department, class: classVal } = req.query;

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
      return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát.' });
    }

    // Manager can only view stats for surveys in their school
    if (req.user.role === 'Manager') {
      const manager = await User.findByPk(req.user.id);
      if (manager && manager.school && survey.school && survey.school !== manager.school) {
        return res.status(403).json({ message: 'Bạn chỉ có thể xem thống kê khảo sát trong trường của mình.' });
      }
    }

    // Filter responses based on school, department, class
    const responseWhere = { surveyId };
    const userWhere = {};
    if (school) userWhere.school = school;
    if (department) userWhere.department = department;
    if (classVal) userWhere.class = classVal;

    const matchingResponses = await Response.findAll({
      where: responseWhere,
      include: [{
        model: User,
        as: 'respondent',
        where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        required: Object.keys(userWhere).length > 0
      }]
    });

    const responseIds = matchingResponses.map(r => r.id);
    const totalResponses = responseIds.length;

    // Calculate totalAssigned: count users matching survey criteria
    const assignedWhere = {};
    assignedWhere.status = 'Active';

    // Match target audience
    if (survey.targetAudience && survey.targetAudience !== 'All') {
      // Find role by name
      const targetRole = await Role.findOne({ where: { name: survey.targetAudience } });
      if (targetRole) {
        assignedWhere.roleId = targetRole.id;
      }
    } else {
      // "All" means all non-admin, non-manager roles
      const excludedRoles = await Role.findAll({ where: { name: 'Manager' } });
      const excludedIds = excludedRoles.map(r => r.id);
      assignedWhere.roleId = { [Op.notIn]: excludedIds };
    }

    // Apply survey school/department/class filters based on targetAudience compatibility
    if (survey.school) {
      assignedWhere.school = survey.school;
    }
    const canHaveDept = ['Student', 'Lecturer', 'Alumnus', 'All'].includes(survey.targetAudience);
    if (survey.department && canHaveDept) {
      assignedWhere.department = survey.department;
    }
    if (survey.class) {
      const classes = survey.class.split(',').map(c => c.trim()).filter(Boolean);
      if (classes.length > 0) {
        if (survey.targetAudience === 'Employer') {
          // For Employer, survey.class stores targeted emails
          assignedWhere.email = { [Op.in]: classes };
        } else if (['Student', 'Alumnus', 'All'].includes(survey.targetAudience)) {
          // For Student/Alumnus, survey.class stores target classes
          if (classes.length > 1) {
            assignedWhere.class = { [Op.in]: classes };
          } else if (classes.length === 1) {
            assignedWhere.class = classes[0];
          }
        }
      }
    }

    // Also apply query filters from frontend
    if (school) assignedWhere.school = school;
    if (department) assignedWhere.department = department;
    if (classVal) assignedWhere.class = classVal;

    const totalAssigned = await User.count({ where: assignedWhere });

    const stats = [];

    for (let question of survey.Questions) {
      const answers = totalResponses > 0 ? await Answer.findAll({
        where: {
          questionId: question.id,
          responseId: responseIds
        }
      }) : [];

      const questionStat = {
        id: question.id,
        text: question.text,
        type: question.type,
        totalAnswers: answers.length,
        data: {}
      };

      if (question.type === 'likert_scale') {
        // Likert scale statistics (1-5 ratings)
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        let count = 0;

        answers.forEach(a => {
          const val = parseInt(a.answerText);
          if (val >= 1 && val <= 5) {
            counts[val]++;
            sum += val;
            count++;
          }
        });

        questionStat.data = {
          distribution: counts,
          average: count > 0 ? parseFloat((sum / count).toFixed(2)) : 0
        };
      } else if (['single_choice', 'multiple_choice'].includes(question.type)) {
        // Multiple choice stats
        const optionCounts = {};
        question.options.forEach(o => {
          optionCounts[o.text] = 0;
        });

        answers.forEach(a => {
          try {
            const selectedIds = JSON.parse(a.selectedOptions || '[]');
            selectedIds.forEach(id => {
              const opt = question.options.find(o => o.id == id);
              if (opt) {
                optionCounts[opt.text] = (optionCounts[opt.text] || 0) + 1;
              }
            });
          } catch (e) {
            // Safe parse error fallback
          }
        });

        questionStat.data = {
          options: optionCounts
        };
      } else if (question.type === 'open_text') {
        // Open text answers
        questionStat.data = {
          comments: answers.map(a => a.answerText).filter(Boolean)
        };
      }

      stats.push(questionStat);
    }

    res.json({
      surveyTitle: survey.title,
      description: survey.description,
      targetAudience: survey.targetAudience,
      school: survey.school,
      department: survey.department,
      class: survey.class,
      startDate: survey.startDate,
      endDate: survey.endDate,
      totalResponses,
      totalAssigned,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê cuộc khảo sát.', error: error.message });
  }
});

// 6. Get Survey Participants List (Admin, Manager only)
router.get('/:id/participants', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const surveyId = req.params.id;
    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Không tìm thấy khảo sát.' });
    }

    // Determine target users
    const whereClause = {
      status: 'Active' // only active users
    };

    // Filter by role/audience
    if (survey.targetAudience !== 'All') {
      const role = await Role.findOne({ where: { name: survey.targetAudience } });
      if (role) {
        whereClause.roleId = role.id;
      }
    } else {
      // Exclude Admin and Manager roles from participants list
      const excludedRoles = await Role.findAll({ where: { name: 'Manager' } });
      const excludedIds = excludedRoles.map(r => r.id);
      const { Op } = require('sequelize');
      whereClause.roleId = { [Op.notIn]: excludedIds };
    }

    // Filter by school
    if (survey.school) {
      whereClause.school = survey.school;
    }

    // Filter by department - Only apply to Student, Lecturer, Alumnus, All
    const canHaveDept = ['Student', 'Lecturer', 'Alumnus', 'All'].includes(survey.targetAudience);
    if (survey.department && canHaveDept) {
      whereClause.department = survey.department;
    }

    // Filter by class/email
    if (survey.class) {
      const classes = survey.class.split(',').map(c => c.trim()).filter(Boolean);
      if (classes.length > 0) {
        const { Op } = require('sequelize');
        if (survey.targetAudience === 'Employer') {
          // For Employer, survey.class stores targeted emails
          whereClause.email = { [Op.in]: classes };
        } else if (['Student', 'Alumnus', 'All'].includes(survey.targetAudience)) {
          // For Student/Alumnus, survey.class stores target classes
          whereClause.class = { [Op.in]: classes };
        }
      }
    }

    // Fetch all targeted users
    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'email', 'code', 'school', 'department', 'class'],
      include: [{ model: Role, as: 'role', attributes: ['name'] }]
    });

    // Fetch all responses for this survey
    const responses = await Response.findAll({
      where: { surveyId },
      attributes: ['userId', 'submittedAt']
    });

    // Create a map of user submissions
    const submissionMap = new Map();
    responses.forEach(r => {
      submissionMap.set(r.userId, r.submittedAt);
    });

    // Map users to participant objects
    const participants = users.map(u => {
      const submittedAt = submissionMap.get(u.id);
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        code: u.code,
        role: u.role ? u.role.name : 'Unknown',
        school: u.school,
        department: u.department,
        class: u.class,
        status: submittedAt ? 'submitted' : 'pending',
        submittedAt: submittedAt || null
      };
    });

    res.json(participants);
  } catch (error) {
    console.error('Error fetching survey participants:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách tham gia khảo sát.', error: error.message });
  }
});

// 7. Get Survey Decision Support Analytics (Admin, Manager only)
router.get('/:id/decision-support', authenticateToken, authorizeRoles('Manager'), async (req, res) => {
  try {
    const surveyId = req.params.id;
    const survey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: Question,
          include: [{ model: Answer, attributes: ['answerText'] }]
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc khảo sát.' });
    }

    // Group scores by category
    const categoryScores = {};

    survey.Questions.forEach(q => {
      if (q.type === 'likert_scale') {
        const cat = q.category || 'Khác';
        if (!categoryScores[cat]) {
          categoryScores[cat] = { sum: 0, count: 0, questions: [] };
        }

        let qSum = 0;
        let qCount = 0;

        if (q.Answers) {
          q.Answers.forEach(a => {
            const val = parseInt(a.answerText);
            if (val >= 1 && val <= 5) {
              qSum += val;
              qCount += 1;
            }
          });
        }

        categoryScores[cat].sum += qSum;
        categoryScores[cat].count += qCount;
        categoryScores[cat].questions.push({
          id: q.id,
          text: q.text,
          average: qCount > 0 ? parseFloat((qSum / qCount).toFixed(2)) : 0,
          responsesCount: qCount
        });
      }
    });

    // standard recommendations map
    const recommendationsMap = {
      'Cơ sở vật chất': [
        'Lập kế hoạch rà soát và nâng cấp thiết bị máy chiếu, Wi-Fi và hệ thống âm thanh tại các giảng đường có phản hồi kém.',
        'Tăng cường tần suất dọn dẹp vệ sinh và kiểm tra thiết bị phòng học trước ca học.',
        'Bổ sung trang thiết bị thực hành và nâng cấp phần mềm chuyên ngành tại phòng máy.'
      ],
      'Chương trình đào tạo': [
        'Cập nhật giáo trình môn học và tăng cường bổ sung nguồn tài liệu điện tử trên hệ thống thư viện trường.',
        'Rà soát và điều chỉnh đề cương chi tiết môn học để nâng cao tính thực tiễn, cập nhật công nghệ mới.',
        'Mở rộng các hoạt động chia sẻ, giao lưu chuyên môn giữa giảng viên các bộ môn để thống nhất nội dung.'
      ],
      'Phương pháp giảng dạy': [
        'Tổ chức các lớp tập huấn kỹ năng sư phạm hiện đại, đổi mới phương pháp giảng dạy lấy người học làm trung tâm.',
        'Khuyến khích giảng viên tăng cường giao lưu, đặt câu hỏi gợi mở và dành thời gian thảo luận tại lớp.',
        'Cung cấp phản hồi kết quả kiểm tra, đánh giá thường kỳ nhanh chóng và rõ ràng hơn cho người học.'
      ],
      'Dịch vụ hỗ trợ': [
        'Ứng dụng số hóa và tự động hóa các thủ tục hành chính, giấy tờ sinh viên trực tuyến để rút ngắn thời gian xử lý.',
        'Đẩy mạnh các hoạt động tư vấn tâm lý học đường, hỗ trợ hướng nghiệp và ngày hội việc làm liên kết doanh nghiệp.',
        'Nâng cao tinh thần thái độ phục vụ của cán bộ văn phòng các khoa, phòng ban đối với người học.'
      ],
      'Khác': [
        'Lên kế hoạch tổ chức đối thoại trực tiếp giữa Ban Giám hiệu/Khoa với người học để làm rõ các tồn đọng.',
        'Tiếp tục theo dõi các chỉ số hài lòng trong cuộc khảo sát chu kỳ tiếp theo.'
      ]
    };

    // Calculate averages and build recommendations
    const results = Object.keys(categoryScores).map(cat => {
      const { sum, count, questions } = categoryScores[cat];
      const average = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
      
      let status = 'Good'; // 'Strong', 'Good', 'Critical'
      let recommendations = [];

      if (count > 0) {
        if (average >= 4.0) {
          status = 'Strong';
        } else if (average < 3.5) {
          status = 'Critical';
          recommendations = recommendationsMap[cat] || recommendationsMap['Khác'];
        }
      }

      return {
        category: cat,
        average,
        totalResponses: count,
        questionsCount: questions.length,
        status,
        recommendations,
        questions
      };
    });

    res.json({
      surveyId: survey.id,
      surveyTitle: survey.title,
      categoriesAnalysis: results
    });
  } catch (error) {
    console.error('Error generating decision support analytics:', error);
    res.status(500).json({ message: 'Lỗi tạo phân tích hỗ trợ ra quyết định.', error: error.message });
  }
});

// 8. Delete survey response (User can delete their own history, Manager can delete any)
router.delete('/responses/:responseId', authenticateToken, async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await Response.findByPk(responseId);
    if (!response) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả nộp khảo sát này.' });
    }

    // Check permissions: either the owner or a Manager
    if (req.user.id !== response.userId && req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa lịch sử khảo sát này.' });
    }

    await response.destroy(); // Cascades deletes to Answers due to onDelete: CASCADE
    res.json({ message: 'Xóa lịch sử khảo sát thành công!' });
  } catch (error) {
    console.error('Error deleting survey response:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi xóa lịch sử khảo sát.', error: error.message });
  }
});

module.exports = router;
