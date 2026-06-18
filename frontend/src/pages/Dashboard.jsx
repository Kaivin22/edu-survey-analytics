import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, Bell, User, Calendar, FileText, CheckCircle, Clock, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ROLE_LABELS = { Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng' };

function Dashboard({ user, onLogout }) {
  const [surveys, setSurveys] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('surveys');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => { fetchSurveys(); fetchNotifications(); }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setSurveys(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/users/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) { setNotifications(data); setUnreadCount(data.filter(n => !n.isRead).length); }
    } catch (e) { console.error(e); }
  };

  const markRead = async () => {
    await fetch(`${API_URL}/users/notifications/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    fetchNotifications();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD' }}>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white"><ClipboardList size={20} /></div>
            <span className="text-xl font-extrabold text-white tracking-tight">EDU SURVEY</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotif(!showNotif); if (!showNotif && unreadCount > 0) markRead(); }}
                className="p-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center" style={{ background: '#FBECAC', color: '#2d4771' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border p-4 z-50" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
                  <h4 className="font-bold text-sm mb-3" style={{ color: '#2d4771' }}>Thông báo gần đây</h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="text-xs text-slate-400 text-center py-4">Không có thông báo</p>
                      : notifications.map(n => (
                        <div key={n.id} className="p-3 rounded-xl text-xs" style={{ background: n.isRead ? '#F9FAFD' : '#EEF4FD', borderLeft: n.isRead ? 'none' : '3px solid #6E9AE0' }}>
                          <div className="flex justify-between mb-0.5">
                            <span className="font-bold" style={{ color: '#2d4771' }}>{n.title}</span>
                            <span style={{ color: '#6E9AE0' }}>{new Date(n.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <p style={{ color: '#487bc9' }}>{n.message}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 text-white transition-all">
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Main ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Profile sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-3xl shadow-sm p-6 border" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4 uppercase" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
                {user.fullName.charAt(0)}
              </div>
              <h3 className="font-extrabold text-lg" style={{ color: '#2d4771' }}>{user.fullName}</h3>
              <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>
                {ROLE_LABELS[user.role] || user.role}
              </span>

              <div className="w-full mt-5 pt-5 space-y-3 text-left text-sm" style={{ borderTop: '1px solid #D2DBEA' }}>
                <div className="flex items-center gap-2">
                  <User size={15} style={{ color: '#6E9AE0' }} />
                  <div>
                    <p className="text-xs uppercase font-bold" style={{ color: '#A0AEC0' }}>Mã nhận diện</p>
                    <p className="font-semibold" style={{ color: '#2d4771' }}>{user.code || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={15} style={{ color: '#6E9AE0' }} />
                  <div>
                    <p className="text-xs uppercase font-bold" style={{ color: '#A0AEC0' }}>Email</p>
                    <p className="font-semibold text-xs" style={{ color: '#2d4771' }}>{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side menu */}
          <div className="rounded-2xl p-3 space-y-1 border" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
            {[
              { key: 'surveys', icon: ClipboardList, label: 'Khảo sát của tôi' },
              { key: 'password', icon: Lock, label: 'Đổi mật khẩu' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5"
                style={activeTab === key
                  ? { background: '#6E9AE0', color: '#fff' }
                  : { color: '#487bc9', background: 'transparent' }
                }
              >
                <Icon size={17} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="lg:col-span-3">
          {activeTab === 'surveys' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Phiếu Khảo Sát Được Phân Công</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#6E9AE0' }}>Vui lòng hoàn thành trước ngày hết hạn</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>{surveys.length} khảo sát</span>
              </div>

              {loading ? (
                <div className="h-56 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
                </div>
              ) : surveys.length === 0 ? (
                <div className="p-12 rounded-3xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
                  <CheckCircle size={40} className="mx-auto mb-4" style={{ color: '#6E9AE0' }} />
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#2d4771' }}>Đã hoàn thành tất cả!</h3>
                  <p className="text-sm" style={{ color: '#6E9AE0' }}>Hiện không có phiếu khảo sát mới. Cảm ơn sự đóng góp ý kiến của bạn!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {surveys.map(s => (
                    <div key={s.id} className="rounded-3xl p-6 shadow-sm border flex flex-col justify-between transition-all" style={{ background: '#fff', borderColor: '#D2DBEA', borderLeftWidth: '4px', borderLeftColor: '#6E9AE0' }}>
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>
                            {ROLE_LABELS[s.targetAudience] || s.targetAudience}
                          </span>
                          {s.endDate && (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: '#FBECAC', color: '#92600A' }}>
                              <Clock size={11} />Hạn: {new Date(s.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base mb-2 line-clamp-2" style={{ color: '#2d4771' }}>{s.title}</h3>
                        <p className="text-xs mb-4 line-clamp-2" style={{ color: '#487bc9' }}>{s.description || 'Không có mô tả'}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #D2DBEA' }}>
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#A0AEC0' }}>
                          <FileText size={13} />{s.questionCount} câu hỏi
                        </span>
                        <button
                          onClick={() => navigate(`/survey/${s.id}`)}
                          className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                          style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
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
            <PasswordChangeForm API_URL={API_URL} token={token} />
          )}
        </div>
      </main>
    </div>
  );
}

function PasswordChangeForm({ API_URL, token }) {
  const [form, setForm] = useState({ old: '', newP: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.old || !form.newP) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    if (form.newP !== form.confirm) { setError('Xác nhận mật khẩu không khớp.'); return; }
    if (form.newP.length < 8) { setError('Mật khẩu mới phải từ 8 ký tự.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: form.old, newPassword: form.newP }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Đổi mật khẩu thành công!');
      setForm({ old: '', newP: '', confirm: '' });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const inputStyle = { background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' };

  return (
    <div className="rounded-3xl shadow-sm p-8 border max-w-md" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
      <h2 className="text-xl font-extrabold mb-1" style={{ color: '#2d4771' }}>Đổi Mật Khẩu</h2>
      <p className="text-xs mb-6" style={{ color: '#6E9AE0' }}>Thay đổi mật khẩu định kỳ để bảo mật tài khoản</p>
      {error && <div className="mb-4 p-3 rounded-2xl text-sm border" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>{error}</div>}
      {success && <div className="mb-4 p-3 rounded-2xl text-sm border" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'old', label: 'Mật khẩu hiện tại' },
          { key: 'newP', label: 'Mật khẩu mới (tối thiểu 8 ký tự)' },
          { key: 'confirm', label: 'Xác nhận mật khẩu mới' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>{label}</label>
            <input
              type="password" placeholder="••••••••"
              value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none"
              style={inputStyle}
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="w-full py-3 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
