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
  Notification,
  School,
  Department,
  Classroom
} = require('../models');

async function seed() {
  try {
    console.log('Synchronizing database models...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully!');

    // 1. Seed Roles (Consolidated, no Admin)
    console.log('Seeding Roles...');
    await Role.bulkCreate([
      { id: 2, name: 'Manager' },
      { id: 3, name: 'Student' },
      { id: 4, name: 'Lecturer' },
      { id: 5, name: 'Alumnus' },
      { id: 6, name: 'Employer' }
    ]);
    console.log('Roles seeded.');

    // 1.1. Seed School, Departments, and Classrooms (Single school DAU)
    console.log('Seeding School, Departments, and Classrooms...');
    const schoolDAU = await School.create({ name: 'Trường Đại học Kiến trúc Đà Nẵng' });

    const dauIT = await Department.create({ name: 'Khoa Công nghệ thông tin', schoolId: schoolDAU.id });
    const dauArch = await Department.create({ name: 'Khoa Kiến trúc', schoolId: schoolDAU.id });
    const dauBuild = await Department.create({ name: 'Khoa Xây dựng', schoolId: schoolDAU.id });
    const dauEcon = await Department.create({ name: 'Khoa Kinh tế', schoolId: schoolDAU.id });

    await Classroom.bulkCreate([
      { name: '22CT1', departmentId: dauIT.id },
      { name: '22CT2', departmentId: dauIT.id },
      { name: '22CT3', departmentId: dauIT.id },
      { name: '22CT4', departmentId: dauIT.id }
    ]);
    
    await Classroom.bulkCreate([
      { name: '22KT1', departmentId: dauArch.id },
      { name: '22KT2', departmentId: dauArch.id }
    ]);

    await Classroom.create({ name: '22XD1', departmentId: dauBuild.id });
    await Classroom.create({ name: '22KTQD1', departmentId: dauEcon.id });

    console.log('Schools, Departments, Classrooms seeded.');

    // Seed Manager User (roleId: 2)
    console.log('Seeding Manager User...');
    const hashedPassword = await bcrypt.hash('12345678', 10);
    await User.create({
      email: 'trankimlien31072004@gmail.com',
      password: hashedPassword,
      fullName: 'Cán bộ Quản lý ĐBCL',
      code: 'CB_DBCL_01',
      roleId: 2, // Manager
      school: 'Trường Đại học Kiến trúc Đà Nẵng',
      department: 'Khoa Công nghệ thông tin',
      status: 'Active'
    });
    console.log('Manager User seeded.');
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
