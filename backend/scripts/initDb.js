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

    // 1.1. Seed Schools, Departments, and Classrooms
    console.log('Seeding Schools, Departments, and Classrooms...');
    const schoolDAU = await School.create({ name: 'Kiến trúc Đà Nẵng (DAU)' });
    const schoolVKU = await School.create({ name: 'Việt Hàn (VKU)' });

    const dauIT = await Department.create({ name: 'Công nghệ thông tin', schoolId: schoolDAU.id });
    const dauArch = await Department.create({ name: 'Kiến trúc', schoolId: schoolDAU.id });
    const dauBuild = await Department.create({ name: 'Xây dựng', schoolId: schoolDAU.id });
    const dauEcon = await Department.create({ name: 'Kinh tế', schoolId: schoolDAU.id });

    const vkuCS = await Department.create({ name: 'Khoa học Máy tính', schoolId: schoolVKU.id });
    const vkuCE = await Department.create({ name: 'Kỹ thuật Máy tính', schoolId: schoolVKU.id });
    const vkuBiz = await Department.create({ name: 'Kinh tế số & Thương mại điện tử', schoolId: schoolVKU.id });

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

    await Classroom.bulkCreate([
      { name: '22IT1', departmentId: vkuCS.id },
      { name: '22IT2', departmentId: vkuCS.id }
    ]);

    await Classroom.create({ name: '22CE1', departmentId: vkuCE.id });
    await Classroom.create({ name: '22EC1', departmentId: vkuBiz.id });

    console.log('Schools, Departments, Classrooms seeded.');

    // Seed Admin User Only
    console.log('Seeding Admin User...');
    const hashedPassword = await bcrypt.hash('12345678', 10);
    await User.create({
      email: 'trankimlien31072004@gmail.com',
      password: hashedPassword,
      fullName: 'Nguyễn Quản Trị',
      code: 'ADMIN001',
      roleId: 1,
      school: 'Kiến trúc Đà Nẵng (DAU)',
      department: 'Công nghệ thông tin',
      status: 'Active'
    });
    console.log('Admin User seeded.');
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
