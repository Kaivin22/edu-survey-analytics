const express = require('express');
const router = express.Router();
const { School, Department, Classroom } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 1. Get entire nested categories tree (Public)
router.get('/', async (req, res) => {
  try {
    const schools = await School.findAll({
      include: [{ model: Department, as: 'departments', include: [{ model: Classroom, as: 'classrooms' }] }],
      order: [
        ['name', 'ASC'],
        [{ model: Department, as: 'departments' }, 'name', 'ASC'],
        [{ model: Department, as: 'departments' }, { model: Classroom, as: 'classrooms' }, 'name', 'ASC']
      ]
    });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh mục trường học.', error: error.message });
  }
});

// ── School CRUD ─────────────────────────────────────────────────────────────
router.post('/schools', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Tên trường không được để trống.' });
    const existing = await School.findOne({ where: { name: name.trim() } });
    if (existing) return res.status(400).json({ message: 'Tên trường này đã tồn tại.' });
    const school = await School.create({ name: name.trim() });
    res.status(201).json({ message: 'Thêm trường học thành công!', school });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm trường học.', error: error.message });
  }
});

router.put('/schools/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Tên trường không được để trống.' });
    const school = await School.findByPk(req.params.id);
    if (!school) return res.status(404).json({ message: 'Không tìm thấy trường học.' });
    const existing = await School.findOne({ where: { name: name.trim() } });
    if (existing && existing.id !== school.id) return res.status(400).json({ message: 'Tên trường này đã tồn tại.' });
    school.name = name.trim();
    await school.save();
    res.json({ message: 'Cập nhật trường học thành công!', school });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trường học.', error: error.message });
  }
});

router.delete('/schools/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const school = await School.findByPk(req.params.id);
    if (!school) return res.status(404).json({ message: 'Không tìm thấy trường học.' });
    await school.destroy();
    res.json({ message: 'Xóa trường học thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa trường học.', error: error.message });
  }
});

// ── Department CRUD ─────────────────────────────────────────────────────────
// Nested create: POST /schools/:schoolId/departments  (used by frontend UI)
router.post('/schools/:schoolId/departments', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name } = req.body;
    const { schoolId } = req.params;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Tên khoa không được để trống.' });
    const school = await School.findByPk(schoolId);
    if (!school) return res.status(404).json({ message: 'Trường học không tồn tại.' });
    const existing = await Department.findOne({ where: { name: name.trim(), schoolId } });
    if (existing) return res.status(400).json({ message: 'Khoa này đã tồn tại trong trường này.' });
    const department = await Department.create({ name: name.trim(), schoolId });
    res.status(201).json({ message: 'Thêm khoa thành công!', department });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm khoa.', error: error.message });
  }
});

// Flat create (legacy): POST /departments
router.post('/departments', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name, schoolId } = req.body;
    if (!name || !name.trim() || !schoolId) return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên khoa và trường liên kết.' });
    const school = await School.findByPk(schoolId);
    if (!school) return res.status(400).json({ message: 'Trường học liên kết không tồn tại.' });
    const existing = await Department.findOne({ where: { name: name.trim(), schoolId } });
    if (existing) return res.status(400).json({ message: 'Khoa này đã tồn tại trong trường này.' });
    const department = await Department.create({ name: name.trim(), schoolId });
    res.status(201).json({ message: 'Thêm khoa thành công!', department });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm khoa.', error: error.message });
  }
});

// PUT department - only requires name (schoolId taken from existing record)
router.put('/departments/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Tên khoa không được để trống.' });
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Không tìm thấy khoa.' });
    const existing = await Department.findOne({ where: { name: name.trim(), schoolId: dept.schoolId } });
    if (existing && existing.id !== dept.id) return res.status(400).json({ message: 'Khoa này đã tồn tại trong trường này.' });
    dept.name = name.trim();
    await dept.save();
    res.json({ message: 'Cập nhật khoa thành công!', department: dept });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật khoa.', error: error.message });
  }
});

router.delete('/departments/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Không tìm thấy khoa.' });
    await dept.destroy();
    res.json({ message: 'Xóa khoa thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa khoa.', error: error.message });
  }
});

// ── Classroom CRUD ──────────────────────────────────────────────────────────
// Nested create: POST /departments/:deptId/classrooms  (used by frontend UI)
router.post('/departments/:deptId/classrooms', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name } = req.body;
    const { deptId } = req.params;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Tên lớp không được để trống.' });
    const dept = await Department.findByPk(deptId);
    if (!dept) return res.status(404).json({ message: 'Khoa không tồn tại.' });
    const existing = await Classroom.findOne({ where: { name: name.trim(), departmentId: deptId } });
    if (existing) return res.status(400).json({ message: 'Lớp này đã tồn tại trong khoa này.' });
    const classroom = await Classroom.create({ name: name.trim(), departmentId: deptId });
    res.status(201).json({ message: 'Thêm lớp học thành công!', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm lớp học.', error: error.message });
  }
});

// Flat create (legacy): POST /classes
router.post('/classes', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    if (!name || !name.trim() || !departmentId) return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên lớp và khoa liên kết.' });
    const dept = await Department.findByPk(departmentId);
    if (!dept) return res.status(400).json({ message: 'Khoa liên kết không tồn tại.' });
    const existing = await Classroom.findOne({ where: { name: name.trim(), departmentId } });
    if (existing) return res.status(400).json({ message: 'Lớp này đã tồn tại trong khoa này.' });
    const classroom = await Classroom.create({ name: name.trim(), departmentId });
    res.status(201).json({ message: 'Thêm lớp học thành công!', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm lớp học.', error: error.message });
  }
});

// PUT classroom via /classrooms/:id (new - used by frontend UI)
router.put('/classrooms/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Tên lớp không được để trống.' });
    const classroom = await Classroom.findByPk(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Không tìm thấy lớp học.' });
    const existing = await Classroom.findOne({ where: { name: name.trim(), departmentId: classroom.departmentId } });
    if (existing && existing.id !== classroom.id) return res.status(400).json({ message: 'Lớp này đã tồn tại trong khoa này.' });
    classroom.name = name.trim();
    await classroom.save();
    res.json({ message: 'Cập nhật lớp học thành công!', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật lớp học.', error: error.message });
  }
});

// DELETE classroom via /classrooms/:id (new - used by frontend UI)
router.delete('/classrooms/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const classroom = await Classroom.findByPk(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Không tìm thấy lớp học.' });
    await classroom.destroy();
    res.json({ message: 'Xóa lớp học thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa lớp học.', error: error.message });
  }
});

// PUT/DELETE via /classes/:id (legacy)
router.put('/classes/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    if (!name || !name.trim() || !departmentId) return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên lớp và khoa liên kết.' });
    const classroom = await Classroom.findByPk(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Không tìm thấy lớp học.' });
    const dept = await Department.findByPk(departmentId);
    if (!dept) return res.status(400).json({ message: 'Khoa liên kết không tồn tại.' });
    const existing = await Classroom.findOne({ where: { name: name.trim(), departmentId } });
    if (existing && existing.id !== classroom.id) return res.status(400).json({ message: 'Lớp này đã tồn tại trong khoa này.' });
    classroom.name = name.trim();
    classroom.departmentId = departmentId;
    await classroom.save();
    res.json({ message: 'Cập nhật lớp học thành công!', classroom });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật lớp học.', error: error.message });
  }
});

router.delete('/classes/:id', authenticateToken, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const classroom = await Classroom.findByPk(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Không tìm thấy lớp học.' });
    await classroom.destroy();
    res.json({ message: 'Xóa lớp học thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa lớp học.', error: error.message });
  }
});

module.exports = router;
