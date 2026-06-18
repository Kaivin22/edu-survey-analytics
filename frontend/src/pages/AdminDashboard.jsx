import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, Users, BarChart3, Plus, Trash2, Edit, FileSpreadsheet, Eye, CheckCircle, HelpCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TARGET_LABELS = { Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng', All: 'Tất cả' };

function AdminDashboard({ user, onLogout }) {
  const [surveys, setSurveys] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('surveys');
  const [stats, setStats] = useState({ total: 0, active: 0, users: 0 });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => { fetchSurveys(); if (user.role === 'Admin') { fetchAccounts(); fetchRoles(); } }, []);

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white"><BarChart3 size={20} /></div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight">EDU SURVEY</span>
              <span className="ml-2 text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg font-bold">
                {user.role === 'Admin' ? 'Admin Panel' : 'Manager Panel'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-white text-sm font-semibold">{user.fullName}</span>
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
          <StatCard icon={Users} label="Tổng số tài khoản" value={user.role === 'Admin' ? stats.users : '—'} bg="#FFFBEB" iconColor="#D97706" />
        </div>

        {/* Tabs */}
        <div className="flex gap-3" style={{ borderBottom: '2px solid #D2DBEA', paddingBottom: '1px' }}>
          {[
            { key: 'surveys', icon: ClipboardList, label: 'Quản lý phiếu khảo sát' },
            ...(user.role === 'Admin' ? [{ key: 'accounts', icon: Users, label: 'Quản lý phân quyền tài khoản' }] : []),
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
              {user.role === 'Admin' && (
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
                              <a href={`${API_URL}/reports/${s.id}/excel`} target="_blank" rel="noreferrer" title="Xuất Excel" className="p-2 rounded-xl transition-all flex items-center" style={{ background: '#F0FDF4', color: '#16a34a' }}>
                                <FileSpreadsheet size={15} />
                              </a>
                              {user.role === 'Admin' && (
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

        {/* ── Tab: Accounts (Admin only) ── */}
        {activeTab === 'accounts' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Quản lý Phân Quyền Tài Khoản</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6E9AE0' }}>Thay đổi vai trò trực tiếp qua dropdown — hiệu lực tức thì</p>
            </div>
            <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#D2DBEA', background: '#fff' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ background: '#EEF4FD', borderBottom: '2px solid #D2DBEA' }}>
                      {['Mã nhận diện', 'Họ và tên', 'Email', 'Vai trò', 'Xóa'].map(h => (
                        <th key={h} className="py-3.5 px-5 text-xs font-extrabold uppercase tracking-wide" style={{ color: '#6E9AE0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, i) => (
                      <tr key={acc.id} style={{ borderBottom: '1px solid #D2DBEA', background: i % 2 === 0 ? '#fff' : '#FAFBFE' }}>
                        <td className="py-3.5 px-5 text-sm font-bold" style={{ color: '#487bc9' }}>{acc.code || '—'}</td>
                        <td className="py-3.5 px-5 text-sm font-extrabold" style={{ color: '#2d4771' }}>{acc.fullName}</td>
                        <td className="py-3.5 px-5 text-xs font-mono" style={{ color: '#6E9AE0' }}>{acc.email}</td>
                        <td className="py-3.5 px-5">
                          <select
                            value={acc.roleId}
                            onChange={e => changeRole(acc.id, e.target.value)}
                            disabled={acc.id === user.id}
                            className="rounded-xl px-2 py-1 text-xs font-bold outline-none border disabled:opacity-40"
                            style={{ background: '#EEF4FD', borderColor: '#D2DBEA', color: '#2d4771' }}
                          >
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        </td>
                        <td className="py-3.5 px-5">
                          <button
                            onClick={() => deleteUser(acc.id)}
                            disabled={acc.id === user.id}
                            className="p-2 rounded-xl transition-all disabled:opacity-30"
                            style={{ background: '#FFF5F5', color: '#dc2626' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;
