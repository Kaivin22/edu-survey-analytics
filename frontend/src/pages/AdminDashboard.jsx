import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ClipboardList, UserPlus, Users, BarChart3, Plus, 
  Trash2, Edit, FileSpreadsheet, Eye, ShieldAlert, CheckCircle, 
  HelpCircle, Settings, Award 
} from 'lucide-react';

function AdminDashboard({ user, onLogout }) {
  const [surveys, setSurveys] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('surveys'); // 'surveys' | 'accounts'
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalUsers: 0
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSurveys();
    if (user.role === 'Admin') {
      fetchAccounts();
      fetchRoles();
    }
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSurveys(data);
        setStats(prev => ({
          ...prev,
          totalSurveys: data.length,
          activeSurveys: data.filter(s => s.status === 'Active').length
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAccounts(data);
        setStats(prev => ({
          ...prev,
          totalUsers: data.length
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/roles`);
      const data = await res.json();
      if (res.ok) {
        setRoles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSurvey = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn cuộc khảo sát này cùng toàn bộ các câu trả lời liên quan?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/surveys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã xóa khảo sát thành công!');
        fetchSurveys();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi khi xóa khảo sát.');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi kết nối.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản người dùng này?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã xóa tài khoản thành công!');
        fetchAccounts();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi khi xóa tài khoản.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ.');
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roleId: parseInt(newRoleId) })
      });
      
      if (res.ok) {
        alert('Cập nhật vai trò thành công!');
        fetchAccounts();
      } else {
        const data = await res.json();
        alert(data.message || 'Không thể cập nhật vai trò.');
      }
    } catch (err) {
      alert('Lỗi kết nối.');
    }
  };

  const targetLabels = {
    Student: 'Sinh viên',
    Lecturer: 'Giảng viên',
    Alumnus: 'Cựu sinh viên',
    Employer: 'Nhà tuyển dụng',
    All: 'Tất cả'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-30 border-b border-slate-200/50 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-xl flex items-center justify-center text-white shadow-md">
            <BarChart3 size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">EDU SURVEY</span>
            <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider mt-0.5">Admin & Manager Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-right">
            <p className="text-xs font-bold text-slate-700">{user.fullName}</p>
            <p className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg font-bold">
              {user.role === 'Admin' ? 'Quản trị viên' : 'Cán bộ quản lý'}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold rounded-2xl shadow-sm hover:translate-y-[-1px] transition-all text-xs cursor-pointer"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 space-y-8">
        
        {/* Stats Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider leading-none">Tổng số khảo sát</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.totalSurveys}</h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider leading-none">Khảo sát đang chạy</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stats.activeSurveys}</h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider leading-none">Tổng số tài khoản</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{user.role === 'Admin' ? stats.totalUsers : 'Đã bảo mật'}</h3>
            </div>
          </div>
        </div>

        {/* Modular Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200/50 pb-2">
          <button
            onClick={() => setActiveTab('surveys')}
            className={`px-6 py-2.5 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2 ${activeTab === 'surveys' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <ClipboardList size={18} />
            Quản lý phiếu khảo sát
          </button>
          
          {user.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-6 py-2.5 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2 ${activeTab === 'accounts' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Users size={18} />
              Quản lý phân quyền tài khoản
            </button>
          )}
        </div>

        {/* Tab 1: Surveys Management */}
        {activeTab === 'surveys' ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Danh sách các Cuộc Khảo Sát</h2>
                <p className="text-slate-400 text-xs font-semibold mt-1">
                  Nhấn "Thống kê" để xem biểu đồ phân tích thời gian thực và xuất báo cáo kết quả Excel.
                </p>
              </div>

              {user.role === 'Admin' && (
                <button
                  onClick={() => navigate('/survey/create')}
                  className="px-5 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={18} />
                  Tạo Khảo Sát Mới
                </button>
              )}
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
              </div>
            ) : surveys.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-dashed border-slate-300">
                <HelpCircle size={48} className="text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-700">Chưa có cuộc khảo sát nào</h3>
                {user.role === 'Admin' && <p className="text-slate-400 text-xs max-w-sm mx-auto">Vui lòng click "Tạo Khảo Sát Mới" để thiết lập biểu mẫu đầu tiên của bạn.</p>}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Tên cuộc khảo sát</th>
                        <th className="py-4 px-4">Đối tượng mục tiêu</th>
                        <th className="py-4 px-4">Trạng thái</th>
                        <th className="py-4 px-4">Câu hỏi</th>
                        <th className="py-4 px-4">Hạn chót</th>
                        <th className="py-4 px-6 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                      {surveys.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 max-w-xs md:max-w-md">
                            <p className="font-extrabold text-slate-800 leading-tight">{s.title}</p>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{s.description || 'Không có mô tả'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-xl">
                              {targetLabels[s.targetAudience] || s.targetAudience}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                              s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              s.status === 'Closed' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {s.status === 'Active' ? 'Đang chạy' : s.status === 'Closed' ? 'Đã đóng' : 'Bản nháp'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-slate-400">
                            {s.questionCount} câu hỏi
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-500">
                            {s.endDate ? new Date(s.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center gap-2">
                              {/* 1. View stats */}
                              <button
                                onClick={() => navigate(`/survey/${s.id}/stats`)}
                                title="Xem thống kê"
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 border border-indigo-100 transition-all cursor-pointer"
                              >
                                <Eye size={16} />
                              </button>

                              {/* 2. Download Excel report */}
                              <a
                                href={`${API_URL}/reports/${s.id}/excel`}
                                headers={{ 'Authorization': `Bearer ${token}` }}
                                target="_blank"
                                rel="noreferrer"
                                title="Xuất báo cáo Excel"
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 border border-emerald-100 transition-all flex items-center"
                              >
                                <FileSpreadsheet size={16} />
                              </a>

                              {user.role === 'Admin' && (
                                <>
                                  {/* 3. Edit */}
                                  <button
                                    onClick={() => navigate(`/survey/edit/${s.id}`)}
                                    title="Chỉnh sửa khảo sát"
                                    className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 border border-amber-100 transition-all cursor-pointer"
                                  >
                                    <Edit size={16} />
                                  </button>

                                  {/* 4. Delete */}
                                  <button
                                    onClick={() => handleDeleteSurvey(s.id)}
                                    title="Xóa khảo sát"
                                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 border border-rose-100 transition-all cursor-pointer"
                                  >
                                    <Trash2 size={16} />
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
        ) : (
          // Tab 2: User management (Admin only)
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Quản lý Phân Quyền Tài Khoản</h2>
              <p className="text-slate-400 text-xs font-semibold mt-1">Thay đổi vai trò trực tiếp thông qua hộp thoại chọn và thay đổi sẽ có hiệu lực tức thì.</p>
            </div>

            <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Mã nhận diện</th>
                      <th className="py-4 px-6">Họ và tên</th>
                      <th className="py-4 px-6">Email đăng nhập</th>
                      <th className="py-4 px-6">Vai trò hiện tại</th>
                      <th className="py-4 px-6 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-slate-500 font-bold">{acc.code || 'N/A'}</td>
                        <td className="py-4 px-6 font-extrabold text-slate-800">{acc.fullName}</td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">{acc.email}</td>
                        <td className="py-4 px-6">
                          <select
                            value={acc.roleId}
                            onChange={(e) => handleRoleChange(acc.id, e.target.value)}
                            disabled={acc.id === user.id}
                            className="bg-slate-50/75 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDeleteUser(acc.id)}
                            disabled={acc.id === user.id}
                            className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={16} />
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
