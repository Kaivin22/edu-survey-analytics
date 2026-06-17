import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ClipboardList, Users, BarChart3, Plus, Trash2, Edit, FileSpreadsheet, Eye, CheckCircle, HelpCircle, User, Lock, School } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TARGET_LABELS = { Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng', All: 'Tất cả' };
const ROLE_LABELS = { Admin: 'Quản trị viên', Manager: 'Cán bộ quản lý', Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng' };

const SCHOOLS = [];
const DEPARTMENTS = {};
const CLASSES = {};

function AdminDashboard({ user, onLogout, onUpdateUser }) {
  const [surveys, setSurveys] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('surveys');
  const [stats, setStats] = useState({ total: 0, active: 0, users: 0 });
  const [userFilters, setUserFilters] = useState({ 
    role: '', 
    school: user.role === 'Manager' ? user.school : '', 
    department: '', 
    class: '' 
  });

  // Modal User Form States
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    fullName: '',
    code: '',
    roleId: '',
    school: '',
    department: '',
    class: ''
  });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Dynamic categories state for user forms/filters
  const [dynamicSchools, setDynamicSchools] = useState([]);
  const [dynamicDepartments, setDynamicDepartments] = useState({});
  const [dynamicClasses, setDynamicClasses] = useState({});
  const [categoriesTree, setCategoriesTree] = useState([]);

  // Selected entities for the category management columns
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState(null);

  // CRUD operation states for category modal/inputs
  const [categoryModal, setCategoryModal] = useState({ show: false, type: '', mode: 'create', parentId: null, targetId: null, name: '' });
  const [categoryError, setCategoryError] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  const fetchCategoriesTree = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategoriesTree(data);
      
      const schoolsList = data.map(s => s.name);
      const deptsMap = {};
      const classesMap = {};
      
      data.forEach(s => {
        deptsMap[s.name] = s.departments.map(d => d.name);
        s.departments.forEach(d => {
          classesMap[d.name] = d.classrooms.map(c => c.name);
        });
      });
      
      setDynamicSchools(schoolsList);
      setDynamicDepartments(deptsMap);
      setDynamicClasses(classesMap);

      // Auto-select manager's school
      if (user.role === 'Manager' && user.school) {
        const matchingSchool = data.find(s => s.name === user.school);
        if (matchingSchool) {
          setSelectedSchoolId(matchingSchool.id);
        }
      }
    } catch (err) {
      console.error('Error fetching categories in AdminDashboard:', err);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    if (userFilters.role) {
      const userRoleName = acc.role?.name || acc.role || '';
      if (userRoleName !== userFilters.role) return false;
    }
    if (userFilters.school && acc.school !== userFilters.school) return false;
    if (userFilters.department && acc.department !== userFilters.department) return false;
    if (userFilters.class && (!acc.class || !acc.class.toLowerCase().includes(userFilters.class.toLowerCase()))) return false;
    return true;
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSurveys();
    fetchCategoriesTree();
    if (['Admin', 'Manager'].includes(user.role)) {
      fetchAccounts();
      fetchRoles();
    }
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) { setSurveys(data); setStats(s => ({ ...s, total: data.length, active: data.filter(x => x.status === 'Active').length })); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) { setAccounts(data); setStats(s => ({ ...s, users: data.length })); }
    } catch (e) { console.error(e); }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/roles`);
      const data = await res.json();
      if (res.ok) setRoles(data);
    } catch (e) { console.error(e); }
  };

  // ── Category CRUD handlers ──────────────────────────────────────────────────
  const openCategoryModal = (type, mode, parentId = null, targetId = null, currentName = '') => {
    setCategoryError('');
    setCategoryModal({ show: true, type, mode, parentId, targetId, name: currentName });
  };
  const closeCategoryModal = () => setCategoryModal({ show: false, type: '', mode: 'create', parentId: null, targetId: null, name: '' });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    const { type, mode, parentId, targetId, name } = categoryModal;
    if (!name.trim()) { setCategoryError('Tên không được để trống.'); return; }
    setCategoryLoading(true);
    try {
      let url, method, body;
      if (type === 'school') {
        url = mode === 'create' ? `${API_URL}/categories/schools` : `${API_URL}/categories/schools/${targetId}`;
        method = mode === 'create' ? 'POST' : 'PUT';
        body = { name: name.trim() };
      } else if (type === 'department') {
        url = mode === 'create' ? `${API_URL}/categories/schools/${parentId}/departments` : `${API_URL}/categories/departments/${targetId}`;
        method = mode === 'create' ? 'POST' : 'PUT';
        body = { name: name.trim() };
      } else if (type === 'classroom') {
        url = mode === 'create' ? `${API_URL}/categories/departments/${parentId}/classrooms` : `${API_URL}/categories/classrooms/${targetId}`;
        method = mode === 'create' ? 'POST' : 'PUT';
        body = { name: name.trim() };
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đã xảy ra lỗi');
      closeCategoryModal();
      await fetchCategoriesTree();
      // Reset selected items if parent was modified
      if (type === 'school') { setSelectedSchoolId(null); setSelectedDeptId(null); }
      if (type === 'department') setSelectedDeptId(null);
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (type, id) => {
    const labels = { school: 'Trường này (và tất cả khoa, lớp bên trong)', department: 'Khoa này (và tất cả lớp bên trong)', classroom: 'Lớp này' };
    if (!confirm(`Xóa vĩnh viễn: ${labels[type]}?`)) return;
    const endpoints = { school: `${API_URL}/categories/schools/${id}`, department: `${API_URL}/categories/departments/${id}`, classroom: `${API_URL}/categories/classrooms/${id}` };
    try {
      const res = await fetch(endpoints[type], { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Lỗi xóa'); }
      await fetchCategoriesTree();
      if (type === 'school') { setSelectedSchoolId(null); setSelectedDeptId(null); }
      if (type === 'department') setSelectedDeptId(null);
    } catch (err) { alert(err.message); }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const deleteSurvey = async (id) => {
    if (!confirm('Xóa vĩnh viễn khảo sát này?')) return;
    const res = await fetch(`${API_URL}/surveys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { alert('Đã xóa!'); fetchSurveys(); } else { const d = await res.json(); alert(d.message); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Xóa tài khoản người dùng này?')) return;
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { alert('Đã xóa!'); fetchAccounts(); } else { const d = await res.json(); alert(d.message); }
  };

  const changeRole = async (userId, roleId) => {
    const res = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ roleId: parseInt(roleId) }),
    });
    if (res.ok) { alert('Đã cập nhật vai trò!'); fetchAccounts(); } else { const d = await res.json(); alert(d.message); }
  };

  const approveUser = async (id) => {
    if (!confirm('Phê duyệt kích hoạt tài khoản này?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Đã phê duyệt tài khoản thành công!');
        fetchAccounts();
      } else {
        alert(data.message || 'Lỗi phê duyệt tài khoản');
      }
    } catch (e) {
      console.error(e);
      alert('Đã xảy ra lỗi kết nối.');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUserId(null);
    setUserForm({
      email: '',
      password: '',
      fullName: '',
      code: '',
      roleId: roles.length > 0 ? roles.filter(r => !(user.role === 'Manager' && (r.name === 'Admin' || r.name === 'Manager' || r.id === 1 || r.id === 2)))[0]?.id : '',
      school: user.role === 'Manager' ? user.school : '',
      department: '',
      class: ''
    });
    setModalError('');
    setModalSuccess('');
    setShowUserModal(true);
  };

  const openEditModal = (acc) => {
    setModalMode('edit');
    setEditingUserId(acc.id);
    setUserForm({
      email: acc.email,
      password: '',
      fullName: acc.fullName || '',
      code: acc.code || '',
      roleId: acc.roleId || '',
      school: user.role === 'Manager' ? user.school : (acc.school || ''),
      department: acc.department || '',
      class: acc.class || ''
    });
    setModalError('');
    setModalSuccess('');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    
    if (!userForm.email || !userForm.fullName || !userForm.roleId) {
      setModalError('Vui lòng điền đầy đủ các trường bắt buộc (Email, Họ tên, Vai trò).');
      return;
    }
    if (modalMode === 'create' && !userForm.password) {
      setModalError('Mật khẩu là bắt buộc khi tạo tài khoản mới.');
      return;
    }

    // Code validation
    if (userForm.code) {
      const selectedRoleObj = roles.find(r => r.id === parseInt(userForm.roleId));
      const isStudent = selectedRoleObj?.name === 'Student';
      if (isStudent) {
        if (!/^\d{8,12}$/.test(userForm.code.trim())) {
          setModalError('Mã số sinh viên (MSSV) phải gồm từ 8 đến 12 chữ số.');
          return;
        }
      } else {
        if (!/^[a-zA-Z0-9]+$/.test(userForm.code.trim())) {
          setModalError('Mã nhận diện chỉ được phép chứa chữ cái và số (không có ký tự đặc biệt hay khoảng trắng).');
          return;
        }
      }
    }

    setModalLoading(true);
    try {
      const url = modalMode === 'create' ? `${API_URL}/users` : `${API_URL}/users/${editingUserId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const bodyData = {
        email: userForm.email,
        fullName: userForm.fullName,
        code: userForm.code || null,
        roleId: parseInt(userForm.roleId),
        school: userForm.school || null,
        department: userForm.department || null,
        class: userForm.class || null
      };
      if (userForm.password) {
        bodyData.password = userForm.password;
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setModalSuccess(data.message || 'Thành công!');
      fetchAccounts();
      setTimeout(() => setShowUserModal(false), 1000);
    } catch (err) {
      setModalError(err.message || 'Đã xảy ra lỗi.');
    } finally {
      setModalLoading(false);
    }
  };

  // Reusable stat card
  const StatCard = ({ icon: Icon, label, value, bg, iconColor }) => (
    <div className="rounded-2xl p-5 border shadow-sm flex items-center gap-4" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-xs uppercase font-bold tracking-wide" style={{ color: '#A0AEC0' }}>{label}</p>
        <h3 className="text-2xl font-black mt-0.5" style={{ color: '#2d4771' }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD', fontFamily: "'Outfit', 'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-decoration-none"><BarChart3 size={20} /></Link>
            <div>
              <Link to="/" style={{ textDecoration: 'none' }} className="text-lg font-extrabold text-white tracking-tight">Academic Synergy</Link>
              <span className="ml-2 text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg font-bold">
                {user.role === 'Admin' ? 'Admin Panel' : 'Manager Panel'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-white text-sm font-semibold">Xin chào, {user.fullName}</span>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 text-white transition-all">
              <LogOut size={15} /> Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard icon={ClipboardList} label="Tổng số khảo sát" value={stats.total} bg="#EEF4FD" iconColor="#6E9AE0" />
          <StatCard icon={CheckCircle} label="Khảo sát đang chạy" value={stats.active} bg="#F0FDF4" iconColor="#16a34a" />
          <StatCard icon={Users} label="Tổng số tài khoản" value={['Admin', 'Manager'].includes(user.role) ? stats.users : '—'} bg="#FFFBEB" iconColor="#D97706" />
        </div>

        {/* Tabs */}
        <div className="flex gap-3" style={{ borderBottom: '2px solid #D2DBEA', paddingBottom: '1px' }}>
          {[
            { key: 'surveys', icon: ClipboardList, label: 'Quản lý phiếu khảo sát' },
            ...(['Admin', 'Manager'].includes(user.role) ? [{ key: 'accounts', icon: Users, label: 'Quản lý phân quyền tài khoản' }] : []),
            { key: 'categories', icon: School, label: 'Quản lý danh mục (Trường, Khoa, Lớp)' },
            { key: 'profile', icon: User, label: 'Thông tin cá nhân' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all flex items-center gap-2"
              style={activeTab === key
                ? { background: '#6E9AE0', color: '#fff', marginBottom: '-2px', borderBottom: '2px solid #6E9AE0' }
                : { color: '#487bc9', background: 'transparent' }
              }
            >
              <Icon size={17} />{label}
            </button>
          ))}
        </div>

        {/* ── Tab: Surveys ── */}
        {activeTab === 'surveys' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Danh sách Cuộc Khảo Sát</h2>
                <p className="text-xs mt-0.5" style={{ color: '#6E9AE0' }}>Nhấn biểu tượng mắt để xem thống kê phân tích và tải xuống báo cáo Excel</p>
              </div>
              {['Admin', 'Manager'].includes(user.role) && (
                <button
                  onClick={() => navigate('/survey/create')}
                  className="px-5 py-2.5 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                >
                  <Plus size={17} /> Tạo Khảo Sát Mới
                </button>
              )}
            </div>

            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
              </div>
            ) : surveys.length === 0 ? (
              <div className="p-12 rounded-3xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
                <HelpCircle size={40} className="mx-auto mb-4" style={{ color: '#D2DBEA' }} />
                <h3 className="font-bold" style={{ color: '#2d4771' }}>Chưa có cuộc khảo sát nào</h3>
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#D2DBEA', background: '#fff' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr style={{ background: '#EEF4FD', borderBottom: '2px solid #D2DBEA' }}>
                        {['Tên khảo sát', 'Đối tượng', 'Trạng thái', 'Câu hỏi', 'Hạn chót', 'Hành động'].map(h => (
                          <th key={h} className="py-3.5 px-5 text-xs font-extrabold uppercase tracking-wide" style={{ color: '#6E9AE0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {surveys.map((s, i) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #D2DBEA', background: i % 2 === 0 ? '#fff' : '#FAFBFE' }}>
                          <td className="py-4 px-5 max-w-xs">
                            <p className="font-extrabold text-sm leading-tight" style={{ color: '#2d4771' }}>{s.title}</p>
                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#6E9AE0' }}>{s.description || '—'}</p>
                          </td>
                          <td className="py-4 px-5">
                            <span className="px-2 py-1 rounded-xl text-xs font-bold" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>
                              {TARGET_LABELS[s.targetAudience] || s.targetAudience}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="px-2 py-1 rounded-xl text-xs font-bold" style={{
                              background: s.status === 'Active' ? '#F0FDF4' : s.status === 'Closed' ? '#FFF5F5' : '#FFFBEB',
                              color: s.status === 'Active' ? '#16a34a' : s.status === 'Closed' ? '#dc2626' : '#D97706',
                            }}>
                              {s.status === 'Active' ? 'Đang chạy' : s.status === 'Closed' ? 'Đã đóng' : 'Bản nháp'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs font-bold" style={{ color: '#A0AEC0' }}>{s.questionCount}</td>
                          <td className="py-4 px-5 text-xs" style={{ color: '#487bc9' }}>{s.endDate ? new Date(s.endDate).toLocaleDateString('vi-VN') : '—'}</td>
                          <td className="py-4 px-5">
                            <div className="flex gap-2">
                              <button onClick={() => navigate(`/survey/${s.id}/stats`)} title="Xem thống kê" className="p-2 rounded-xl transition-all" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>
                                <Eye size={15} />
                              </button>
                              {(user.role === 'Admin' || (user.role === 'Manager' && s.school === user.school)) && (
                                <>
                                  <button onClick={() => navigate(`/survey/edit/${s.id}`)} title="Chỉnh sửa" className="p-2 rounded-xl transition-all" style={{ background: '#FFFBEB', color: '#D97706' }}>
                                    <Edit size={15} />
                                  </button>
                                  <button onClick={() => deleteSurvey(s.id)} title="Xóa" className="p-2 rounded-xl transition-all" style={{ background: '#FFF5F5', color: '#dc2626' }}>
                                    <Trash2 size={15} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Accounts (Admin & Manager) ── */}
        {activeTab === 'accounts' && ['Admin', 'Manager'].includes(user.role) && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Quản lý Phân Quyền Tài Khoản</h2>
                <p className="text-xs mt-0.5" style={{ color: '#6E9AE0' }}>Thay đổi vai trò trực tiếp qua dropdown hoặc tạo/sửa thông tin tài khoản</p>
              </div>
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
              >
                <Plus size={17} /> Tạo Tài Khoản Mới
              </button>
            </div>

            {/* Filter Bar */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
              background: '#fff', borderRadius: 20, border: '1.5px solid #D2DBEA',
              padding: '12px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#487bc9' }}>Bộ lọc vị trí:</span>
              </div>
              
              {/* Role filter */}
              <select value={userFilters.role} onChange={e => setUserFilters(f => ({ ...f, role: e.target.value }))} style={{ padding: '7px 14px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', color: '#2d4771', fontSize: 13, fontWeight: 600, outline: 'none' }}>
                <option value="">👥 Tất cả vai trò</option>
                <option value="Admin">Quản trị viên</option>
                <option value="Manager">Cán bộ quản lý</option>
                <option value="Student">Sinh viên</option>
                <option value="Lecturer">Giảng viên</option>
                <option value="Alumnus">Cựu sinh viên</option>
                <option value="Employer">Nhà tuyển dụng</option>
              </select>

              {/* School filter */}
              <select 
                value={userFilters.school} 
                disabled={user.role === 'Manager'}
                onChange={e => setUserFilters(f => ({ ...f, school: e.target.value, department: '', class: '' }))} 
                style={{ padding: '7px 14px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', color: '#2d4771', fontSize: 13, fontWeight: 600, outline: 'none', opacity: user.role === 'Manager' ? 0.7 : 1 }}
              >
                {user.role !== 'Manager' && <option value="">🏫 Tất cả trường</option>}
                {dynamicSchools
                  .filter(s => !(user.role === 'Manager' && s !== user.school))
                  .map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))
                }
              </select>

              {/* Department filter */}
              <select value={userFilters.department} disabled={!userFilters.school} onChange={e => setUserFilters(f => ({ ...f, department: e.target.value, class: '' }))} style={{ padding: '7px 14px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', color: '#2d4771', fontSize: 13, fontWeight: 600, outline: 'none', opacity: userFilters.school ? 1 : 0.5 }}>
                <option value="">📚 Tất cả khoa</option>
                {(dynamicDepartments[userFilters.school] || []).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Class filter */}
              <select
                value={userFilters.class}
                disabled={!userFilters.department}
                onChange={e => setUserFilters(f => ({ ...f, class: e.target.value }))}
                style={{
                  padding: '7px 14px', borderRadius: 12, border: '1.5px solid #D2DBEA',
                  background: '#fff', color: '#2d4771', fontSize: 13, fontWeight: 600,
                  outline: 'none', opacity: userFilters.department ? 1 : 0.5
                }}
              >
                <option value="">🎓 Tất cả lớp</option>
                {(dynamicClasses[userFilters.department] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Reset filter */}
              {(userFilters.role || (user.role !== 'Manager' && userFilters.school) || userFilters.department || userFilters.class) && (
                <button onClick={() => setUserFilters({ role: '', school: user.role === 'Manager' ? user.school : '', department: '', class: '' })} style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff5f5', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Xóa lọc
                </button>
              )}
            </div>

            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#D2DBEA', background: '#fff' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ background: '#EEF4FD', borderBottom: '2px solid #D2DBEA' }}>
                      {['Mã nhận diện', 'Họ và tên', 'Email', 'Vai trò', 'Trường / Khoa', 'Trạng thái', 'Hành động'].map(h => (
                        <th key={h} className="py-3.5 px-5 text-xs font-extrabold uppercase tracking-wide" style={{ color: '#6E9AE0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc, i) => (
                      <tr key={acc.id} style={{ borderBottom: '1px solid #D2DBEA', background: i % 2 === 0 ? '#fff' : '#FAFBFE' }}>
                        <td className="py-3.5 px-5 text-sm font-bold" style={{ color: '#487bc9' }}>{acc.code || '—'}</td>
                        <td className="py-3.5 px-5 text-sm font-extrabold" style={{ color: '#2d4771' }}>{acc.fullName}</td>
                        <td className="py-3.5 px-5 text-xs font-mono" style={{ color: '#6E9AE0' }}>{acc.email}</td>
                        <td className="py-3.5 px-5">
                          <select
                            value={acc.roleId}
                            onChange={e => changeRole(acc.id, e.target.value)}
                            disabled={acc.id === user.id || (user.role === 'Manager' && (acc.role?.name === 'Admin' || acc.role?.name === 'Manager' || acc.roleId === 1 || acc.roleId === 2))}
                            className="rounded-xl px-2 py-1 text-xs font-bold outline-none border disabled:opacity-40"
                            style={{ background: '#EEF4FD', borderColor: '#D2DBEA', color: '#2d4771' }}
                          >
                            {roles
                              .filter(r => !(user.role === 'Manager' && (r.name === 'Admin' || r.name === 'Manager' || r.id === 1 || r.id === 2)))
                              .map(r => <option key={r.id} value={r.id}>{ROLE_LABELS[r.name] || r.name}</option>)
                            }
                          </select>
                        </td>
                        <td className="py-3.5 px-5 text-xs" style={{ color: '#2d4771' }}>
                          {acc.school ? (
                            <div>
                              <span className="font-bold">{acc.school.includes('DAU') ? 'DAU' : acc.school.includes('VKU') ? 'VKU' : acc.school}</span>
                              {acc.department && ` › ${acc.department}`}
                              {acc.class && ` › ${acc.class}`}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold" style={{
                            background: acc.status === 'Active' ? '#F0FDF4' : '#FFFBEB',
                            color: acc.status === 'Active' ? '#16a34a' : '#D97706',
                          }}>
                            {acc.status === 'Active' ? 'Hoạt động' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex gap-2">
                            {acc.status === 'Pending' && (
                              <button
                                onClick={() => approveUser(acc.id)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1"
                                style={{ background: '#16a34a', boxShadow: '0 2px 6px rgba(22,163,74,0.3)' }}
                              >
                                Phê duyệt
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(acc)}
                              disabled={user.role === 'Manager' && (acc.role?.name === 'Admin' || acc.role?.name === 'Manager' || acc.roleId === 1 || acc.roleId === 2)}
                              className="p-2 rounded-xl transition-all disabled:opacity-30"
                              style={{ background: '#FFFBEB', color: '#D97706' }}
                              title="Chỉnh sửa"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => deleteUser(acc.id)}
                              disabled={acc.id === user.id || (user.role === 'Manager' && (acc.role?.name === 'Admin' || acc.role?.name === 'Manager' || acc.roleId === 1 || acc.roleId === 2))}
                              className="p-2 rounded-xl transition-all disabled:opacity-30"
                              style={{ background: '#FFF5F5', color: '#dc2626' }}
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAccounts.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-sm text-slate-400 font-bold">
                          Không tìm thấy tài khoản phù hợp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Categories Management ── */}
        {activeTab === 'categories' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Quản lý Danh mục</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6E9AE0' }}>Quản lý cây danh mục: Trường → Khoa / Phòng ban → Lớp hành chính. Nhấn vào một mục để xem cấp dưới.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* ── Column 1: Schools ── */}
              <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#D2DBEA', background: '#fff' }}>
                <div className="flex justify-between items-center px-4 py-3 border-b" style={{ background: '#EEF4FD', borderColor: '#D2DBEA' }}>
                  <h3 className="font-extrabold text-sm" style={{ color: '#2d4771' }}>🏫 Trường Đại học</h3>
                  {user.role !== 'Manager' && (
                    <button
                      onClick={() => openCategoryModal('school', 'create')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                    >
                      <Plus size={12} /> Thêm
                    </button>
                  )}
                </div>
                <div className="divide-y" style={{ borderColor: '#D2DBEA' }}>
                  {categoriesTree.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">Chưa có trường nào. Hãy thêm trường đầu tiên.</p>
                  ) : categoriesTree
                      .filter(school => !(user.role === 'Manager' && school.name !== user.school))
                      .map(school => (
                    <div
                      key={school.id}
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-50 transition-all"
                      style={{ background: selectedSchoolId === school.id ? '#EEF4FD' : undefined, borderLeft: selectedSchoolId === school.id ? '3px solid #6E9AE0' : '3px solid transparent' }}
                      onClick={() => { setSelectedSchoolId(school.id); setSelectedDeptId(null); }}
                    >
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#2d4771' }}>{school.name}</p>
                        <p className="text-xs" style={{ color: '#6E9AE0' }}>{school.departments?.length || 0} khoa</p>
                      </div>
                      {user.role !== 'Manager' && (
                        <div className="flex gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); openCategoryModal('school', 'edit', null, school.id, school.name); }}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: '#FFFBEB', color: '#D97706' }}
                            title="Sửa"
                          ><Edit size={13} /></button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteCategory('school', school.id); }}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: '#FFF5F5', color: '#dc2626' }}
                            title="Xóa"
                          ><Trash2 size={13} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Column 2: Departments ── */}
              <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#D2DBEA', background: '#fff' }}>
                <div className="flex justify-between items-center px-4 py-3 border-b" style={{ background: '#F0F9FF', borderColor: '#D2DBEA' }}>
                  <h3 className="font-extrabold text-sm" style={{ color: '#2d4771' }}>📚 Khoa / Phòng ban</h3>
                  {selectedSchoolId && (
                    <button
                      onClick={() => openCategoryModal('department', 'create', selectedSchoolId)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                    >
                      <Plus size={12} /> Thêm
                    </button>
                  )}
                </div>
                <div className="divide-y" style={{ borderColor: '#D2DBEA' }}>
                  {!selectedSchoolId ? (
                    <p className="text-center py-8 text-xs text-slate-400">← Chọn một trường để xem danh sách khoa</p>
                  ) : (() => {
                    const selectedSchool = categoriesTree.find(s => s.id === selectedSchoolId);
                    const depts = selectedSchool?.departments || [];
                    return depts.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400">Chưa có khoa nào. Nhấn "Thêm" để tạo.</p>
                    ) : depts.map(dept => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-50 transition-all"
                        style={{ background: selectedDeptId === dept.id ? '#F0F9FF' : undefined, borderLeft: selectedDeptId === dept.id ? '3px solid #6E9AE0' : '3px solid transparent' }}
                        onClick={() => setSelectedDeptId(dept.id)}
                      >
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#2d4771' }}>{dept.name}</p>
                          <p className="text-xs" style={{ color: '#6E9AE0' }}>{dept.classrooms?.length || 0} lớp</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); openCategoryModal('department', 'edit', selectedSchoolId, dept.id, dept.name); }}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: '#FFFBEB', color: '#D97706' }}
                            title="Sửa"
                          ><Edit size={13} /></button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteCategory('department', dept.id); }}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: '#FFF5F5', color: '#dc2626' }}
                            title="Xóa"
                          ><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* ── Column 3: Classrooms ── */}
              <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#D2DBEA', background: '#fff' }}>
                <div className="flex justify-between items-center px-4 py-3 border-b" style={{ background: '#F0FDF4', borderColor: '#D2DBEA' }}>
                  <h3 className="font-extrabold text-sm" style={{ color: '#2d4771' }}>🎓 Lớp hành chính</h3>
                  {selectedDeptId && (
                    <button
                      onClick={() => openCategoryModal('classroom', 'create', selectedDeptId)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                    >
                      <Plus size={12} /> Thêm
                    </button>
                  )}
                </div>
                <div className="divide-y" style={{ borderColor: '#D2DBEA' }}>
                  {!selectedDeptId ? (
                    <p className="text-center py-8 text-xs text-slate-400">← Chọn một khoa để xem danh sách lớp</p>
                  ) : (() => {
                    const selectedSchool = categoriesTree.find(s => s.id === selectedSchoolId);
                    const selectedDept = selectedSchool?.departments?.find(d => d.id === selectedDeptId);
                    const classrooms = selectedDept?.classrooms || [];
                    return classrooms.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400">Chưa có lớp nào. Nhấn "Thêm" để tạo.</p>
                    ) : classrooms.map(cls => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-all"
                      >
                        <p className="font-bold text-sm" style={{ color: '#2d4771' }}>{cls.name}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openCategoryModal('classroom', 'edit', selectedDeptId, cls.id, cls.name)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: '#FFFBEB', color: '#D97706' }}
                            title="Sửa"
                          ><Edit size={13} /></button>
                          <button
                            onClick={() => handleDeleteCategory('classroom', cls.id)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: '#FFF5F5', color: '#dc2626' }}
                            title="Xóa"
                          ><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Category Modal */}
            {categoryModal.show && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border shadow-2xl max-w-sm w-full p-6 space-y-4" style={{ borderColor: '#D2DBEA' }}>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h3 className="font-extrabold text-lg" style={{ color: '#2d4771' }}>
                      {categoryModal.mode === 'create' ? 'Thêm' : 'Sửa'} {categoryModal.type === 'school' ? 'Trường' : categoryModal.type === 'department' ? 'Khoa' : 'Lớp'}
                    </h3>
                    <button onClick={closeCategoryModal} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                  </div>
                  {categoryError && <div className="p-3 rounded-2xl text-xs border" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>{categoryError}</div>}
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: '#2d4771' }}>Tên *</label>
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder={categoryModal.type === 'school' ? 'Ví dụ: Kiến trúc Đà Nẵng (DAU)' : categoryModal.type === 'department' ? 'Ví dụ: Công nghệ thông tin' : 'Ví dụ: 22CT1'}
                        value={categoryModal.name}
                        onChange={e => setCategoryModal(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none"
                        style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={closeCategoryModal} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm">Hủy</button>
                      <button
                        type="submit"
                        disabled={categoryLoading}
                        className="px-4 py-2 text-white font-bold rounded-xl shadow-md text-sm disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                      >
                        {categoryLoading ? 'Đang lưu...' : 'Lưu lại'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Profile ── */}
        {activeTab === 'profile' && (
          <ProfileEditForm user={user} API_URL={API_URL} token={token} onUpdateUser={onUpdateUser} />
        )}

        {/* Modal User Form */}
        {showUserModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border shadow-2xl max-w-lg w-full p-6 animate-fade-in space-y-4" style={{ borderColor: '#D2DBEA' }}>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-lg" style={{ color: '#2d4771' }}>
                  {modalMode === 'create' ? 'Tạo Tài Khoản Mới' : 'Chỉnh Sửa Tài Khoản'}
                </h3>
                <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
              </div>
              
              {modalError && <div className="p-3 rounded-2xl text-xs border" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>{modalError}</div>}
              {modalSuccess && <div className="p-3 rounded-2xl text-xs border" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>{modalSuccess}</div>}

              <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1" style={{ color: '#2d4771' }}>Địa chỉ Email *</label>
                    <input
                      type="email" required
                      disabled={modalMode === 'edit'}
                      className="w-full px-3 py-2 rounded-xl border outline-none disabled:opacity-60"
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      value={userForm.email}
                      onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: '#2d4771' }}>
                      {modalMode === 'create' ? 'Mật khẩu *' : 'Đổi mật khẩu (nếu muốn)'}
                    </label>
                    <input
                      type="password"
                      required={modalMode === 'create'}
                      placeholder={modalMode === 'edit' ? 'Để trống nếu không đổi' : ''}
                      className="w-full px-3 py-2 rounded-xl border outline-none"
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      value={userForm.password}
                      onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1" style={{ color: '#2d4771' }}>Họ và Tên *</label>
                    <input
                      type="text" required
                      className="w-full px-3 py-2 rounded-xl border outline-none"
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      value={userForm.fullName}
                      onChange={e => setUserForm(f => ({ ...f, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: '#2d4771' }}>Mã nhận diện (MSSV/MSGV/MST)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border outline-none"
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      value={userForm.code}
                      onChange={e => setUserForm(f => ({ ...f, code: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1" style={{ color: '#2d4771' }}>Vai trò *</label>
                  <select
                    required
                    className="w-full px-3 py-2 rounded-xl border outline-none"
                    style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                    value={userForm.roleId}
                    onChange={e => {
                      const rId = e.target.value;
                      const selectedRoleObj = roles.find(r => r.id === parseInt(rId));
                      const isStudent = selectedRoleObj?.name === 'Student';
                      setUserForm(f => ({ 
                        ...f, 
                        roleId: rId, 
                        class: isStudent ? f.class : ''
                      }));
                    }}
                  >
                    <option value="">Chọn vai trò...</option>
                    {roles
                      .filter(r => !(user.role === 'Manager' && (r.name === 'Admin' || r.name === 'Manager' || r.id === 1 || r.id === 2)))
                      .map(r => <option key={r.id} value={r.id}>{ROLE_LABELS[r.name] || r.name}</option>)
                    }
                  </select>
                </div>

                {/* School, Department, Class dynamic selection */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed" style={{ borderColor: '#D2DBEA' }}>
                  <div>
                    <label className="block mb-1" style={{ color: '#2d4771' }}>Trường</label>
                    <select
                      className="w-full px-2 py-2 rounded-xl border outline-none disabled:opacity-75"
                      disabled={user.role === 'Manager'}
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      value={userForm.school}
                      onChange={e => setUserForm(f => ({ ...f, school: e.target.value, department: '', class: '' }))}
                    >
                      {user.role !== 'Manager' && <option value="">Chọn...</option>}
                      {dynamicSchools.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: '#2d4771' }}>Khoa</label>
                    <select
                      className="w-full px-2 py-2 rounded-xl border outline-none"
                      disabled={!userForm.school}
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      value={userForm.department}
                      onChange={e => setUserForm(f => ({ ...f, department: e.target.value, class: '' }))}
                    >
                      <option value="">Chọn...</option>
                      {(dynamicDepartments[userForm.school] || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1" style={{ color: '#2d4771' }}>Lớp</label>
                    <select
                      className="w-full px-2 py-2 rounded-xl border outline-none"
                      disabled={!userForm.department || roles.find(r => r.id === parseInt(userForm.roleId))?.name !== 'Student'}
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      value={userForm.class}
                      onChange={e => setUserForm(f => ({ ...f, class: e.target.value }))}
                    >
                      <option value="">Chọn...</option>
                      {(dynamicClasses[userForm.department] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-4 py-2 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                  >
                    {modalLoading ? 'Đang xử lý...' : 'Lưu lại'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function ProfileEditForm({ user, API_URL, token, onUpdateUser }) {
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    code: user.code || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isDemo = ['admin@edu.vn', 'manager@edu.vn', 'student1@edu.vn', 'student2@edu.vn', 'lecturer1@edu.vn', 'alumnus1@edu.vn', 'employer1@edu.vn'].includes(user.email.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.fullName.trim()) { setError('Họ tên không được để trống.'); return; }
    
    // Code validation
    if (form.code.trim()) {
      const isStudent = user.role === 'Student';
      if (isStudent) {
        if (!/^\d{8,12}$/.test(form.code.trim())) {
          setError('Mã số sinh viên (MSSV) phải gồm từ 8 đến 12 chữ số.');
          return;
        }
      } else {
        if (!/^[a-zA-Z0-9]+$/.test(form.code.trim())) {
          setError('Mã nhận diện chỉ được phép chứa chữ cái và số (không có ký tự đặc biệt hay khoảng trắng).');
          return;
        }
      }
    }

    if (form.newPassword) {
      if (!form.currentPassword) { setError('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới.'); return; }
      if (form.newPassword.length < 8) { setError('Mật khẩu mới phải từ 8 ký tự trở lên.'); return; }
      if (form.newPassword !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          code: form.code.trim(),
          currentPassword: form.newPassword ? form.currentPassword : undefined,
          newPassword: form.newPassword || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Cập nhật thông tin cá nhân thành công!');
      if (onUpdateUser) {
        onUpdateUser(data.user);
      }
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' };
  const ROLE_LABELS = { Admin: 'Quản trị viên', Manager: 'Cán bộ quản lý', Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng' };

  return (
    <div className="rounded-3xl shadow-sm p-8 border max-w-xl animate-fade-in" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
      <h2 className="text-xl font-extrabold mb-1" style={{ color: '#2d4771' }}>Thông Tin Cá Nhân</h2>
      <p className="text-xs mb-6" style={{ color: '#6E9AE0' }}>Cập nhật thông tin tài khoản và đổi mật khẩu</p>

      {error && <div className="mb-4 p-3 rounded-2xl text-sm border" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>{error}</div>}
      {success && <div className="mb-4 p-3 rounded-2xl text-sm border" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Địa chỉ Email</label>
            <input
              type="text" disabled value={user.email}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium opacity-60 cursor-not-allowed"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Vai trò hệ thống</label>
            <input
              type="text" disabled value={ROLE_LABELS[user.role] || user.role}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium opacity-60 cursor-not-allowed"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Họ và Tên *</label>
            <input
              type="text" required placeholder="Nguyễn Văn A"
              value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Mã nhận diện (MSSV / MSGV / MST)</label>
            <input
              type="text" placeholder="Nhập mã số"
              value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #D2DBEA', paddingTop: '20px', marginTop: '20px' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: '#2d4771' }}>Đổi Mật Khẩu (Để trống nếu không muốn đổi)</h3>
          
          {isDemo && (
            <div className="mb-4 p-3 rounded-2xl text-xs" style={{ background: '#FFF8E6', color: '#92400e', border: '1px solid #FBECAC' }}>
              ⚠️ Tài khoản demo hệ thống không hỗ trợ đổi mật khẩu để bảo đảm tính toàn vẹn dữ liệu.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Mật khẩu hiện tại</label>
              <input
                type="password" placeholder="••••••••" disabled={isDemo}
                value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none disabled:opacity-50"
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Mật khẩu mới</label>
                <input
                  type="password" placeholder="••••••••" disabled={isDemo}
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none disabled:opacity-50"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Xác nhận mật khẩu mới</label>
                <input
                  type="password" placeholder="••••••••" disabled={isDemo}
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none disabled:opacity-50"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', marginTop: '10px' }}>
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}

export default AdminDashboard;
