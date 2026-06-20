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

    // 1. Seed Roles (Consolidated, including Admin)
    console.log('Seeding Roles...');
    await Role.bulkCreate([
      { id: 1, name: 'Admin' },
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

    // Seed Admin User (roleId: 1)
    console.log('Seeding Admin User...');
    const hashedPassword = await bcrypt.hash('12345678', 10);
    await User.create({
      email: 'trankimlien31072004@gmail.com',
      password: hashedPassword,
      fullName: 'Quản trị viên Hệ thống',
      code: 'ADMIN_01',
      roleId: 1, // Admin
      school: 'Trường Đại học Kiến trúc Đà Nẵng',
      department: 'Khoa Công nghệ thông tin',
      status: 'Active'
    });
    console.log('Admin User seeded.');

    // Seed Manager User (roleId: 2)
    console.log('Seeding Manager User...');
    await User.create({
      email: 'manager@edu.vn',
      password: hashedPassword,
      fullName: 'Cán bộ Quản lý ĐBCL',
      code: 'CB_DBCL_01',
      roleId: 2, // Manager
      school: 'Trường Đại học Kiến trúc Đà Nẵng',
      department: 'Khoa Công nghệ thông tin',
      status: 'Active'
    });
    console.log('Manager User seeded.');

    // Seed Demo Users
    console.log('Seeding demo users...');
    await User.bulkCreate([
      {
        email: 'student1@edu.vn',
        password: hashedPassword,
        fullName: 'Trần Kim Liên',
        code: 'SV_01',
        roleId: 3, // Student
        school: 'Trường Đại học Kiến trúc Đà Nẵng',
        department: 'Khoa Công nghệ thông tin',
        class: '22CT1',
        status: 'Active'
      },
      {
        email: 'student2@edu.vn',
        password: hashedPassword,
        fullName: 'Nguyễn Văn Tuấn',
        code: 'SV_02',
        roleId: 3, // Student
        school: 'Trường Đại học Kiến trúc Đà Nẵng',
        department: 'Khoa Công nghệ thông tin',
        class: '22CT2',
        status: 'Active'
      },
      {
        email: 'lecturer1@edu.vn',
        password: hashedPassword,
        fullName: 'Phạm Giảng Viên',
        code: 'GV_01',
        roleId: 4, // Lecturer
        school: 'Trường Đại học Kiến trúc Đà Nẵng',
        department: 'Khoa Công nghệ thông tin',
        status: 'Active'
      },
      {
        email: 'alumnus1@edu.vn',
        password: hashedPassword,
        fullName: 'Hoàng Cựu SV',
        code: 'CSV_01',
        roleId: 5, // Alumnus
        school: 'Trường Đại học Kiến trúc Đà Nẵng',
        department: 'Khoa Công nghệ thông tin',
        status: 'Active'
      },
      {
        email: 'employer1@edu.vn',
        password: hashedPassword,
        fullName: 'FPT Software',
        code: 'NTD_01',
        roleId: 6, // Employer
        school: 'Trường Đại học Kiến trúc Đà Nẵng',
        status: 'Active'
      },
      {
        email: 'employer2@edu.vn',
        password: hashedPassword,
        fullName: 'Viettel Group',
        code: 'NTD_02',
        roleId: 6, // Employer
        school: 'Trường Đại học Kiến trúc Đà Nẵng',
        status: 'Active'
      }
    ]);
    console.log('Demo Users seeded.');
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
