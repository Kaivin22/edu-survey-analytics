import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ClipboardList, Bell, User, Calendar, FileText, CheckCircle, Clock, School, Eye, FileSpreadsheet, Edit, Trash2, Plus, HelpCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ROLE_LABELS = { Admin: 'Quản trị viên', Manager: 'Cán bộ quản lý', Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng' };
const TARGET_LABELS = { Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng', All: 'Tất cả' };

const SCHOOLS = [];
const DEPARTMENTS = {};
const CLASSES = {};

function Dashboard({ user, onLogout, onUpdateUser }) {
  const [surveys, setSurveys] = useState([]);
  const [createdSurveys, setCreatedSurveys] = useState([]);
  const [createdSurveysLoading, setCreatedSurveysLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('surveys');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // New States
  const [historySurveys, setHistorySurveys] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('Resolved');

  const [editingTicket, setEditingTicket] = useState(null);
  const [editTicketForm, setEditTicketForm] = useState({ subject: '', message: '' });
  const [ticketEditing, setTicketEditing] = useState(false);

  useEffect(() => {
    fetchSurveys();
    fetchNotifications();
    if (user.role === 'Manager') {
      fetchCreatedSurveys();
      fetchTickets();
    } else {
      fetchHistorySurveys();
      fetchTickets();
    }
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setSurveys(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchCreatedSurveys = async () => {
    setCreatedSurveysLoading(true);
    try {
      const res = await fetch(`${API_URL}/surveys?createdOnly=true`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCreatedSurveys(data);
    } catch (e) { console.error(e); } finally { setCreatedSurveysLoading(false); }
  };

  const fetchHistorySurveys = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/surveys?history=true`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setHistorySurveys(data);
    } catch (e) { console.error(e); } finally { setHistoryLoading(false); }
  };

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTickets(data);
    } catch (e) { console.error(e); } finally { setTicketsLoading(false); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }
    setTicketSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(ticketForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Gửi yêu cầu hỗ trợ thành công!');
        setTicketForm({ subject: '', message: '' });
        fetchTickets();
      } else {
        alert(data.message || 'Lỗi gửi yêu cầu hỗ trợ.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleReplyTicket = async (id) => {
    if (!replyText) {
      alert('Vui lòng nhập câu trả lời phản hồi.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply: replyText, status: replyStatus })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Phản hồi thành công!');
        setActiveReplyId(null);
        setReplyText('');
        fetchTickets();
      } else {
        alert(data.message || 'Lỗi phản hồi.');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối mạng.');
    }
  };

  const handleDeleteHistory = async (responseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch sử làm khảo sát này? Cuộc khảo sát này sẽ quay trở lại danh sách cần thực hiện.')) return;
    try {
      const res = await fetch(`${API_URL}/surveys/responses/${responseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Xóa lịch sử khảo sát thành công!');
        fetchHistorySurveys();
        fetchSurveys();
      } else {
        alert(data.message || 'Lỗi xóa lịch sử khảo sát.');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối mạng.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này?')) return;
    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã xóa yêu cầu hỗ trợ.');
        fetchTickets();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi xóa yêu cầu.');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối mạng.');
    }
  };

  const handleEditTicketSubmit = async (e) => {
    e.preventDefault();
    if (!editTicketForm.subject || !editTicketForm.message) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setTicketEditing(true);
    try {
      const res = await fetch(`${API_URL}/tickets/${editingTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editTicketForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Cập nhật yêu cầu hỗ trợ thành công!');
        setEditingTicket(null);
        fetchTickets();
      } else {
        alert(data.message || 'Lỗi cập nhật yêu cầu.');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối mạng.');
    } finally {
      setTicketEditing(false);
    }
  };

  const deleteSurvey = async (id) => {
    if (!confirm('Xóa vĩnh viễn khảo sát này?')) return;
    try {
      const res = await fetch(`${API_URL}/surveys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        alert('Đã xóa!');
        fetchCreatedSurveys();
        fetchSurveys();
      } else {
        const d = await res.json();
        alert(d.message || 'Lỗi khi xóa khảo sát');
      }
    } catch (e) {
      console.error(e);
      alert('Đã xảy ra lỗi kết nối.');
    }
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD', fontFamily: "'Outfit', 'Inter', sans-serif" }}>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-decoration-none"><ClipboardList size={20} /></Link>
            <Link to="/" className="text-xl font-extrabold text-white tracking-tight" style={{ textDecoration: 'none' }}>ĐBCL - Đại học Kiến trúc Đà Nẵng</Link>
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
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border p-4 z-50 animate-fade-in" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
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
                    <p className="font-semibold text-xs text-break" style={{ color: '#2d4771' }}>{user.email}</p>
                  </div>
                </div>

                {user.school && (
                  <div className="flex items-center gap-2">
                    <School size={15} style={{ color: '#6E9AE0' }} />
                    <div>
                      <p className="text-xs uppercase font-bold" style={{ color: '#A0AEC0' }}>Trường học</p>
                      <p className="font-semibold" style={{ color: '#2d4771' }}>{user.school}</p>
                    </div>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center gap-2">
                    <ClipboardList size={15} style={{ color: '#6E9AE0' }} />
                    <div>
                      <p className="text-xs uppercase font-bold" style={{ color: '#A0AEC0' }}>Khoa / Phòng</p>
                      <p className="font-semibold" style={{ color: '#2d4771' }}>{user.department}</p>
                    </div>
                  </div>
                )}

                {user.class && (
                  <div className="flex items-center gap-2">
                    <User size={15} style={{ color: '#6E9AE0' }} />
                    <div>
                      <p className="text-xs uppercase font-bold" style={{ color: '#A0AEC0' }}>Lớp học</p>
                      <p className="font-semibold" style={{ color: '#2d4771' }}>{user.class}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side menu */}
          <div className="rounded-2xl p-3 space-y-1 border" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
            {[
              { key: 'surveys', icon: ClipboardList, label: 'Khảo sát cần làm', visible: user.role !== 'Manager' },
              {
                key: 'created-surveys',
                icon: FileText,
                label: 'Khảo sát đã tạo',
                visible: user.role === 'Manager'
              },
              { key: 'history', icon: CheckCircle, label: 'Lịch sử khảo sát', visible: user.role !== 'Manager' },
              { key: 'tickets', icon: HelpCircle, label: 'Báo lỗi & Hỗ trợ', visible: user.role !== 'Manager' },
              { key: 'tickets-manage', icon: HelpCircle, label: 'Quản lý Hỗ trợ', visible: user.role === 'Manager' },
              { key: 'profile', icon: User, label: 'Thông tin cá nhân' },
            ]
            .filter(item => item.visible !== false)
            .map(({ key, icon: Icon, label }) => (
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
                  <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin animate-spin-slow" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
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
          ) : activeTab === 'created-surveys' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Danh sách Khảo sát đã tạo</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#6E9AE0' }}>Quản lý các cuộc khảo sát do bạn tạo ra</p>
                </div>
                <button
                  onClick={() => navigate('/survey/create')}
                  className="px-5 py-2.5 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                >
                  <Plus size={17} /> Tạo Khảo Sát Mới
                </button>
              </div>

              {createdSurveysLoading ? (
                <div className="h-56 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin animate-spin-slow" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
                </div>
              ) : createdSurveys.length === 0 ? (
                <div className="p-12 rounded-3xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
                  <HelpCircle size={40} className="mx-auto mb-4" style={{ color: '#D2DBEA' }} />
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#2d4771' }}>Chưa có cuộc khảo sát nào</h3>
                  <p className="text-sm" style={{ color: '#6E9AE0' }}>Nhấp vào nút "Tạo Khảo Sát Mới" để tạo cuộc khảo sát đầu tiên của bạn.</p>
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
                        {createdSurveys.map((s, i) => (
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
                                <button onClick={() => navigate(`/survey/edit/${s.id}`)} title="Chỉnh sửa" className="p-2 rounded-xl transition-all" style={{ background: '#FFFBEB', color: '#D97706' }}>
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => deleteSurvey(s.id)} title="Xóa" className="p-2 rounded-xl transition-all" style={{ background: '#FFF5F5', color: '#dc2626' }}>
                                  <Trash2 size={15} />
                                </button>
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
          ) : activeTab === 'history' ? (
            <HistorySurveysTab historySurveys={historySurveys} historyLoading={historyLoading} onDeleteHistory={handleDeleteHistory} />
          ) : activeTab === 'tickets' ? (
            <UserTicketsTab
              tickets={tickets}
              ticketsLoading={ticketsLoading}
              ticketForm={ticketForm}
              setTicketForm={setTicketForm}
              ticketSubmitting={ticketSubmitting}
              handleCreateTicket={handleCreateTicket}
              handleDeleteTicket={handleDeleteTicket}
              editingTicket={editingTicket}
              setEditingTicket={setEditingTicket}
              editTicketForm={editTicketForm}
              setEditTicketForm={setEditTicketForm}
              ticketEditing={ticketEditing}
              handleEditTicketSubmit={handleEditTicketSubmit}
            />
          ) : activeTab === 'tickets-manage' ? (
            <ManagerTicketsTab
              tickets={tickets}
              ticketsLoading={ticketsLoading}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              replyText={replyText}
              setReplyText={setReplyText}
              replyStatus={replyStatus}
              setReplyStatus={setReplyStatus}
              handleReplyTicket={handleReplyTicket}
              handleDeleteTicket={handleDeleteTicket}
              ROLE_LABELS={ROLE_LABELS}
            />
          ) : (
            <ProfileEditForm user={user} API_URL={API_URL} token={token} onUpdateUser={onUpdateUser} />
          )}
        </div>
      </main>

      <style>{`
        .text-break { word-break: break-all; }
        .animate-spin-slow { animation: spin 1.2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ProfileEditForm({ user, API_URL, token, onUpdateUser }) {
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    code: user.code || '',
    school: user.school || '',
    department: user.department || '',
    class: user.class || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [dynamicSchools, setDynamicSchools] = useState([]);
  const [dynamicDepartments, setDynamicDepartments] = useState({});
  const [dynamicClasses, setDynamicClasses] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        
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
      } catch (err) {
        console.error('Error fetching categories in ProfileEditForm:', err);
      }
    };
    fetchCategories();
  }, [API_URL]);

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
          school: form.school || null,
          department: form.department || null,
          class: form.class || null,
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

  return (
    <div className="rounded-3xl shadow-sm p-8 border max-w-2xl animate-fade-in" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
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

        {/* School/Department/Class target picker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-dashed" style={{ borderColor: '#D2DBEA' }}>
          <div>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Trường học</label>
            <select
              value={form.school}
              onChange={e => setForm(f => ({ ...f, school: e.target.value, department: '', class: '' }))}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none"
              style={inputStyle}
            >
              <option value="">Chọn trường...</option>
              {dynamicSchools.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Khoa / Phòng</label>
            <select
              value={form.department}
              disabled={!form.school}
              onChange={e => setForm(f => ({ ...f, department: e.target.value, class: '' }))}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none disabled:opacity-50"
              style={inputStyle}
            >
              <option value="">Chọn khoa...</option>
              {(dynamicDepartments[form.school] || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Lớp học</label>
            <select
              value={form.class}
              disabled={!form.department || user.role !== 'Student'}
              onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none disabled:opacity-50"
              style={inputStyle}
            >
              <option value="">Chọn lớp...</option>
              {(dynamicClasses[form.department] || []).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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

// ────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS FOR EXTENDED FEATURES
// ────────────────────────────────────────────────────────────────────────

function HistorySurveysTab({ historySurveys, historyLoading, onDeleteHistory }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Lịch sử làm khảo sát</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6E9AE0' }}>Danh sách các khảo sát bạn đã tham gia thực hiện phản hồi</p>
      </div>

      {historyLoading ? (
        <div className="h-56 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0' }} />
        </div>
      ) : historySurveys.length === 0 ? (
        <div className="p-12 rounded-3xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
          <Clock size={40} className="mx-auto mb-4" style={{ color: '#A0AEC0' }} />
          <h3 className="font-bold text-lg mb-1" style={{ color: '#2d4771' }}>Chưa làm khảo sát nào</h3>
          <p className="text-sm" style={{ color: '#6E9AE0' }}>Lịch sử làm khảo sát của bạn sẽ xuất hiện ở đây sau khi bạn nộp phiếu phản hồi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {historySurveys.map(s => (
            <div key={s.id || s.responseId} className="rounded-3xl p-6 shadow-sm border flex flex-col justify-between transition-all" style={{ background: '#fff', borderColor: '#D2DBEA', borderLeftWidth: '4px', borderLeftColor: '#16a34a' }}>
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                    Đã hoàn thành
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      Nộp: {new Date(s.submittedAt).toLocaleString('vi-VN')}
                    </span>
                    {s.responseId && (
                      <button
                        onClick={() => onDeleteHistory(s.responseId)}
                        className="p-1.5 text-red-500 hover:bg-slate-100 rounded-lg transition-all"
                        title="Xóa kết quả nộp bài"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-extrabold text-base mb-2 line-clamp-2" style={{ color: '#2d4771' }}>{s.title}</h3>
                <p className="text-xs mb-4 line-clamp-2" style={{ color: '#487bc9' }}>{s.description || 'Không có mô tả'}</p>
              </div>
              <div className="pt-3" style={{ borderTop: '1px solid #D2DBEA', color: '#A0AEC0', fontSize: 12, fontWeight: 600 }}>
                <span>✓ Phiếu khảo sát đã được hệ thống ghi nhận thành công.</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserTicketsTab({
  tickets,
  ticketsLoading,
  ticketForm,
  setTicketForm,
  ticketSubmitting,
  handleCreateTicket,
  handleDeleteTicket,
  editingTicket,
  setEditingTicket,
  editTicketForm,
  setEditTicketForm,
  ticketEditing,
  handleEditTicketSubmit
}) {
  const statusLabels = {
    Pending: { label: 'Đang chờ', bg: '#FFFBEB', color: '#D97706' },
    Processing: { label: 'Đang xử lý', bg: '#EFF6FF', color: '#2563EB' },
    Resolved: { label: 'Đã giải quyết', bg: '#F0FDF4', color: '#16A34A' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Báo lỗi & Hỗ trợ hệ thống</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6E9AE0' }}>Gửi thắc mắc hoặc báo cáo sự cố kỹ thuật trực tiếp cho Cán bộ quản lý trường</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 rounded-3xl p-6 border shadow-sm" style={{ background: '#fff', borderColor: '#D2DBEA', height: 'fit-content' }}>
          <h3 className="font-extrabold text-base mb-4" style={{ color: '#2d4771' }}>Tạo yêu cầu mới</h3>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#487bc9' }}>Tiêu đề yêu cầu *</label>
              <input
                type="text"
                value={ticketForm.subject}
                onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                placeholder="Ví dụ: Lỗi không hiển thị nút Nộp bài, Sai mã sinh viên..."
                className="w-full px-4 py-2.5 rounded-2xl border text-sm font-semibold outline-none"
                style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#487bc9' }}>Mô tả sự cố *</label>
              <textarea
                value={ticketForm.message}
                onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                placeholder="Mô tả cụ thể vấn đề bạn gặp phải để cán bộ hỗ trợ nhanh chóng nhất..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-2xl border text-sm font-semibold outline-none resize-none"
                style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={ticketSubmitting}
              className="w-full py-3 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', opacity: ticketSubmitting ? 0.7 : 1 }}
            >
              {ticketSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-extrabold text-base" style={{ color: '#2d4771' }}>Yêu cầu đã gửi của bạn</h3>
          {ticketsLoading ? (
            <div className="h-44 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0' }} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 rounded-3xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
              <HelpCircle size={30} className="mx-auto mb-3 text-slate-400" />
              <p className="text-sm font-medium" style={{ color: '#6E9AE0' }}>Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {tickets.map(t => {
                const s = statusLabels[t.status] || { label: t.status, bg: '#F1F5F9', color: '#475569' };
                return (
                  <div key={t.id} className="p-5 rounded-2xl border bg-white shadow-xs space-y-3" style={{ borderColor: '#D2DBEA' }}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <div className="flex gap-1 ml-2">
                          {t.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setEditingTicket(t);
                                setEditTicketForm({ subject: t.subject, message: t.message });
                              }}
                              className="p-1 text-amber-500 hover:bg-slate-100 rounded-lg transition-all"
                              title="Sửa"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTicket(t.id)}
                            className="p-1 text-red-500 hover:bg-slate-100 rounded-lg transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: '#2d4771' }}>{t.subject}</h4>
                      <p className="text-xs mt-1 text-slate-600 whitespace-pre-wrap">{t.message}</p>
                    </div>
                    {t.reply && (
                      <div className="p-3.5 rounded-xl border" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
                        <p className="text-xs font-bold text-slate-800">Cán bộ phản hồi:</p>
                        <p className="text-xs mt-1 text-slate-600 whitespace-pre-wrap">{t.reply}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border shadow-2xl max-w-md w-full p-6 space-y-4" style={{ borderColor: '#D2DBEA' }}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg" style={{ color: '#2d4771' }}>Chỉnh sửa Yêu cầu</h3>
              <button onClick={() => setEditingTicket(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleEditTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#487bc9' }}>Tiêu đề yêu cầu *</label>
                <input
                  type="text"
                  value={editTicketForm.subject}
                  onChange={e => setEditTicketForm({ ...editTicketForm, subject: e.target.value })}
                  placeholder="Tiêu đề..."
                  className="w-full px-4 py-2.5 rounded-2xl border text-sm font-semibold outline-none"
                  style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#487bc9' }}>Mô tả sự cố *</label>
                <textarea
                  value={editTicketForm.message}
                  onChange={e => setEditTicketForm({ ...editTicketForm, message: e.target.value })}
                  placeholder="Nội dung..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-2xl border text-sm font-semibold outline-none resize-none"
                  style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
                <button type="button" onClick={() => setEditingTicket(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">Hủy</button>
                <button
                  type="submit"
                  disabled={ticketEditing}
                  className="px-4 py-2 text-white rounded-xl shadow-md"
                  style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', opacity: ticketEditing ? 0.7 : 1 }}
                >
                  {ticketEditing ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ManagerTicketsTab({
  tickets,
  ticketsLoading,
  activeReplyId,
  setActiveReplyId,
  replyText,
  setReplyText,
  replyStatus,
  setReplyStatus,
  handleReplyTicket,
  handleDeleteTicket,
  ROLE_LABELS
}) {
  const statusLabels = {
    Pending: { label: 'Đang chờ', bg: '#FFFBEB', color: '#D97706' },
    Processing: { label: 'Đang xử lý', bg: '#EFF6FF', color: '#2563EB' },
    Resolved: { label: 'Đã giải quyết', bg: '#F0FDF4', color: '#16A34A' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: '#2d4771' }}>Hộp thư báo lỗi & Hỗ trợ</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6E9AE0' }}>Tiếp nhận, xử lý và phản hồi phản ánh kỹ thuật từ sinh viên, giảng viên và đối tác</p>
      </div>

      {ticketsLoading ? (
        <div className="h-56 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0' }} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 rounded-3xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
          <HelpCircle size={40} className="mx-auto mb-4" style={{ color: '#A0AEC0' }} />
          <h3 className="font-bold text-lg mb-1" style={{ color: '#2d4771' }}>Hộp thư rỗng</h3>
          <p className="text-sm" style={{ color: '#6E9AE0' }}>Hiện chưa có yêu cầu báo lỗi nào từ phía người dùng hệ thống.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => {
            const s = statusLabels[t.status] || { label: t.status, bg: '#F1F5F9', color: '#475569' };
            const u = t.user || {};
            return (
              <div key={t.id} className="p-6 rounded-3xl border bg-white shadow-xs space-y-4" style={{ borderColor: '#D2DBEA' }}>
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Gửi ngày: {new Date(t.createdAt).toLocaleString('vi-VN')}
                    </span>
                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-1 text-red-500 hover:bg-slate-100 rounded-lg transition-all ml-2"
                      title="Xóa yêu cầu hỗ trợ này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  {t.status !== 'Resolved' && (
                    <button
                      onClick={() => {
                        if (activeReplyId === t.id) {
                          setActiveReplyId(null);
                        } else {
                          setActiveReplyId(t.id);
                          setReplyText(t.reply || '');
                          setReplyStatus(t.status || 'Resolved');
                        }
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all"
                      style={{ background: '#EEF4FD', color: '#6E9AE0' }}
                    >
                      {activeReplyId === t.id ? 'Hủy' : 'Phản hồi / Cập nhật'}
                    </button>
                  )}
                </div>

                {/* Submitter Info */}
                <div className="p-3 rounded-2xl flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold" style={{ background: '#F8FAFC', color: '#64748B' }}>
                  <span>👤 Người gửi: <strong style={{ color: '#334155' }}>{u.fullName || 'N/A'}</strong></span>
                  <span>📧 Email: <strong style={{ color: '#334155' }}>{u.email || 'N/A'}</strong></span>
                  <span>🆔 Mã: <strong style={{ color: '#334155' }}>{u.code || 'N/A'}</strong></span>
                  {u.class && <span>Lớp: <strong style={{ color: '#334155' }}>{u.class}</strong></span>}
                  {u.role && <span>Vai trò: <strong style={{ color: '#6E9AE0' }}>{ROLE_LABELS[u.role.name] || u.role.name}</strong></span>}
                </div>

                <div>
                  <h4 className="font-extrabold text-sm" style={{ color: '#2d4771' }}>Tiêu đề: {t.subject}</h4>
                  <p className="text-xs mt-1.5 text-slate-600 whitespace-pre-wrap">{t.message}</p>
                </div>

                {/* Reply display */}
                {t.reply && activeReplyId !== t.id && (
                  <div className="p-4 rounded-2xl border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                    <p className="text-xs font-bold text-green-800">Đã phản hồi:</p>
                    <p className="text-xs mt-1 text-slate-600 whitespace-pre-wrap">{t.reply}</p>
                  </div>
                )}

                {/* Reply Editor */}
                {activeReplyId === t.id && (
                  <div className="p-5 rounded-2xl border space-y-4" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
                    <h5 className="font-bold text-xs uppercase" style={{ color: '#475569' }}>Soạn phản hồi hỗ trợ</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-1" style={{ color: '#64748B' }}>Trạng thái xử lý</label>
                        <select
                          value={replyStatus}
                          onChange={e => setReplyStatus(e.target.value)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border outline-none bg-white"
                          style={{ borderColor: '#CBD5E1', color: '#475569' }}
                        >
                          <option value="Processing">Đang xử lý</option>
                          <option value="Resolved">Đã giải quyết (Đóng ticket)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1" style={{ color: '#64748B' }}>Nội dung phản hồi</label>
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Nhập câu trả lời phản hồi cho sinh viên..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-xl border text-xs font-semibold outline-none resize-none bg-white"
                        style={{ borderColor: '#CBD5E1', color: '#334155' }}
                      />
                    </div>
                    <button
                      onClick={() => handleReplyTicket(t.id)}
                      className="px-5 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
                    >
                      Lưu phản hồi & Cập nhật
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
