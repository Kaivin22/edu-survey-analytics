const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 1. Role Model
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { timestamps: false });

// 2. User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  school: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  class: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// 3. Survey Model
const Survey = sequelize.define('Survey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetAudience: {
    type: DataTypes.STRING,
    allowNull: false // 'Student', 'Lecturer', 'Alumnus', 'Employer', 'All'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Draft' // 'Draft', 'Active', 'Closed'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  school: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  class: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// 4. Question Model
const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false // 'single_choice', 'multiple_choice', 'likert_scale', 'open_text'
  },
  required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, { timestamps: false });

// 5. QuestionOption Model
const QuestionOption = sequelize.define('QuestionOption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, { timestamps: false });

// 6. Response Model
const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { timestamps: false });

// 7. Answer Model
const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  answerText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  selectedOptions: {
    type: DataTypes.TEXT, // Store selected option ID(s) as JSON string
    allowNull: true
  }
}, { timestamps: false });

// 8. Notification Model
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// 9. School Model
const School = sequelize.define('School', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { timestamps: false });

// 10. Department Model
const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

// 11. Classroom Model
const Classroom = sequelize.define('Classroom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

// --- Associations ---

// User <-> Role
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// User <-> Survey (Created by Admin)
User.hasMany(Survey, { foreignKey: 'createdBy' });
Survey.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Survey <-> Question
Survey.hasMany(Question, { foreignKey: 'surveyId', onDelete: 'CASCADE' });
Question.belongsTo(Survey, { foreignKey: 'surveyId' });

// Question <-> QuestionOption
Question.hasMany(QuestionOption, { foreignKey: 'questionId', onDelete: 'CASCADE', as: 'options' });
QuestionOption.belongsTo(Question, { foreignKey: 'questionId' });

// Survey <-> Response
Survey.hasMany(Response, { foreignKey: 'surveyId', onDelete: 'CASCADE' });
Response.belongsTo(Survey, { foreignKey: 'surveyId' });

// User <-> Response
User.hasMany(Response, { foreignKey: 'userId', onDelete: 'CASCADE' });
Response.belongsTo(User, { foreignKey: 'userId', as: 'respondent' });

// Response <-> Answer
Response.hasMany(Answer, { foreignKey: 'responseId', onDelete: 'CASCADE', as: 'answers' });
Answer.belongsTo(Response, { foreignKey: 'responseId' });

// Question <-> Answer
Question.hasMany(Answer, { foreignKey: 'questionId', onDelete: 'CASCADE' });
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// School <-> Department
School.hasMany(Department, { foreignKey: 'schoolId', onDelete: 'CASCADE', as: 'departments' });
Department.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

// Department <-> Classroom
Department.hasMany(Classroom, { foreignKey: 'departmentId', onDelete: 'CASCADE', as: 'classrooms' });
Classroom.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

module.exports = {
  sequelize,
  Role,
  User,
  Survey,
  Question,
  QuestionOption,
  Response,
  Answer,
  Notification,
  School,
  Department,
  Classroom
};
