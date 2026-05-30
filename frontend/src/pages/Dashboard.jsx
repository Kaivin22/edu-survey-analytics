import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, Bell, User, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';

function Dashboard({ user, onLogout }) {
  const [surveys, setSurveys] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('surveys'); // 'surveys' | 'profile'
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSurveys();
    fetchNotifications();
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSurveys(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/users/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationsAsRead = async () => {
    try {
      await fetch(`${API_URL}/users/notifications/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const roleLabels = {
    Student: 'Sinh viên',
    Lecturer: 'Giảng viên',
    Alumnus: 'Cựu sinh viên',
    Employer: 'Nhà tuyển dụng'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Bar */}
      <nav className="glass-panel sticky top-0 z-30 border-b border-slate-200/50 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-xl flex items-center justify-center text-white shadow-md">
            <ClipboardList size={22} />
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">EDU SURVEY</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Icon */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  handleMarkNotificationsAsRead();
                }
              }}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all relative cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-3xl shadow-xl p-4 z-50 animate-fadeIn">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">Thông báo gần đây</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs text-brand-600 font-semibold">Đã đánh dấu đọc</span>
                  )}
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Không có thông báo nào</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-2.5 rounded-2xl text-xs ${n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-brand-50/50 border border-brand-100 text-slate-800 font-medium'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 font-semibold rounded-2xl shadow-sm hover:translate-y-[-1px] active:translate-y-[1px] transition-all text-sm cursor-pointer"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-md">
            {/* Background Blob decoration */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-200 rounded-full opacity-30 filter blur-xl"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4 uppercase">
                {user.fullName.charAt(0)}
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{user.fullName}</h3>
              <span className="inline-block mt-2 px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">
                {roleLabels[user.role] || user.role}
              </span>

              <div className="w-full border-t border-slate-100 my-6"></div>

              <div className="w-full space-y-3.5 text-left text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase leading-none font-bold">Mã nhận diện</p>
                    <p className="text-slate-700 font-semibold mt-0.5">{user.code || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase leading-none font-bold">Địa chỉ Email</p>
                    <p className="text-slate-700 font-semibold mt-0.5">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 border border-slate-200/50 space-y-2 shadow-sm">
            <button 
              onClick={() => setActiveTab('surveys')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2.5 ${activeTab === 'surveys' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25' : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'}`}
            >
              <ClipboardList size={18} />
              Khảo sát của tôi
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2.5 ${activeTab === 'profile' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'}`}
            >
              <User size={18} />
              Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Right Column: Surveys list / Profile */}
        <div className="lg:col-span-3">
          {activeTab === 'surveys' ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    Phiếu Khảo Sát Được Phân Công
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Vui lòng chọn khảo sát và gửi phản hồi trước khi hết hạn
                  </p>
                </div>
                <span className="px-3.5 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs">
                  {surveys.length} Khảo sát
                </span>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
                </div>
              ) : surveys.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Tuyệt vời! Bạn đã hoàn thành tất cả</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Hiện không có phiếu khảo sát mới nào được chỉ định cho vai trò của bạn. Cảm ơn sự đóng góp ý kiến của bạn!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {surveys.map(survey => (
                    <div 
                      key={survey.id} 
                      className="glass-card p-6 rounded-3xl shadow-sm relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-4">
                          <span className="px-2.5 py-1 bg-brand-50 text-brand-600 font-bold rounded-xl text-[10px] tracking-wide uppercase border border-brand-100">
                            {roleLabels[survey.targetAudience] || survey.targetAudience}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                            <Clock size={12} />
                            Hạn chót: {survey.endDate ? new Date(survey.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-800 text-lg mb-2 leading-snug line-clamp-2">
                          {survey.title}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium mb-4 line-clamp-3">
                          {survey.description || 'Không có mô tả chi tiết'}
                        </p>
                      </div>

                      <div className="border-t border-slate-100/50 pt-4 mt-4 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <FileText size={14} />
                          {survey.questionCount} câu hỏi
                        </span>
                        
                        <button
                          onClick={() => navigate(`/survey/${survey.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs hover:translate-y-[-1px] active:translate-y-[1px] shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          Tham gia khảo sát
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Profile tab - password change form
            <PasswordChangeForm API_URL={API_URL} token={token} />
          )}
        </div>

      </main>
    </div>
  );
}

// Sub-component for password changes inside Dashboard
function PasswordChangeForm({ API_URL, token }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword) {
      setError('Vui lòng điền mật khẩu cũ và mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải từ 8 ký tự trở lên.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi đổi mật khẩu.');
      }

      setSuccess('Đổi mật khẩu tài khoản thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-white/60 max-w-xl mx-auto shadow-md animate-fadeIn">
      <h2 className="text-xl font-extrabold text-slate-800 mb-2">Đổi Mật Khẩu Tài Khoản</h2>
      <p className="text-slate-400 text-xs font-semibold mb-6">Thay đổi định kỳ mật khẩu để đảm bảo tính an toàn bảo mật cho dữ liệu cá nhân</p>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-medium">
          {success}
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Mật khẩu mới</label>
          <input
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Cập nhật mật khẩu'
          )}
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
