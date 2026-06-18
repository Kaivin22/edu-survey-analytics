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
    const { createdOnly } = req.query;

    if (createdOnly === 'true' || userRole === 'Admin' || userRole === 'Manager') {
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
        // Filter: survey must match user's school or be null (global)
        surveyWhere.school = {
          [Op.or]: [null, user.school]
        };
        // Filter: survey must match user's department or be null
        surveyWhere.department = {
          [Op.or]: [null, user.department]
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
          // Filter: for students, survey must match user's class if survey.class is specified
          if (userRole === 'Student' && s.class) {
            if (!user.class) return false;
            const targetClasses = s.class.split(',').map(c => c.trim().toLowerCase());
            if (!targetClasses.includes(user.class.toLowerCase())) {
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
    if (!['Admin', 'Manager'].includes(userRole)) {
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
router.post('/', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
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
          order: q.order || i
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
router.put('/:id', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
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
          order: q.order || i
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
router.delete('/:id', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
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
router.get('/:id/stats', authenticateToken, authorizeRoles(['Admin', 'Manager']), async (req, res) => {
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
      const excludedRoles = await Role.findAll({ where: { name: ['Admin', 'Manager'] } });
      const excludedIds = excludedRoles.map(r => r.id);
      assignedWhere.roleId = { [Op.notIn]: excludedIds };
    }

    // Apply survey school/department/class filters
    if (survey.school) {
      assignedWhere.school = survey.school;
    }
    if (survey.department) {
      assignedWhere.department = survey.department;
    }
    if (survey.class) {
      const classes = survey.class.split(',').map(c => c.trim()).filter(Boolean);
      if (classes.length > 1) {
        assignedWhere.class = { [Op.in]: classes };
      } else if (classes.length === 1) {
        assignedWhere.class = classes[0];
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
      totalResponses,
      totalAssigned,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê cuộc khảo sát.', error: error.message });
  }
});

module.exports = router;
