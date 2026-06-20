import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, CheckCircle, AlertCircle, HelpCircle, Send, User, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ROLE_LABELS = { Admin: 'Quản trị viên', Manager: 'Cán bộ quản lý', Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng' };

const STATUS_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Pending', label: 'Chưa xử lý' },
  { id: 'Processing', label: 'Đang xử lý' },
  { id: 'Resolved', label: 'Đã giải quyết' }
];

function SupportManagement({ user, onLogout }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [statusUpdateMap, setStatusUpdateMap] = useState({});
  const [submittingMap, setSubmittingMap] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setTickets(data);
        // Pre-populate response state maps
        const textMap = {};
        const stateMap = {};
        data.forEach(t => {
          textMap[t.id] = t.reply || '';
          stateMap[t.id] = t.status === 'Pending' ? 'Processing' : t.status;
        });
        setReplyTextMap(textMap);
        setStatusUpdateMap(stateMap);
      } else {
        throw new Error(data.message || 'Không thể tải danh sách ticket hỗ trợ.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (id) => {
    const reply = replyTextMap[id];
    const status = statusUpdateMap[id];

    if (!reply.trim()) {
      alert('Vui lòng viết câu trả lời phản hồi.');
      return;
    }

    setSubmittingMap(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_URL}/tickets/${id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: reply.trim(), status })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Gửi phản hồi và cập nhật trạng thái thành công!');
        setActiveReplyId(null);
        fetchTickets();
      } else {
        alert(data.message || 'Lỗi gửi phản hồi.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng.');
    } finally {
      setSubmittingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phiếu hỗ trợ này? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Xóa phiếu hỗ trợ thành công!');
        fetchTickets();
      } else {
        alert(data.message || 'Lỗi khi xóa phiếu hỗ trợ.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng.');
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Quản lý hệ thống</p>
              <h2 className="text-sm font-extrabold text-white">Xử lý báo lỗi & Hỗ trợ kỹ thuật</h2>
            </div>
          </div>
          <span className="text-white text-xs font-bold bg-white/10 px-3 py-1 rounded-xl">
            {user.school || 'Tất cả trường'}
          </span>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-6">

        {/* Introduction */}
        <div className="p-5 rounded-2xl border bg-white border-[#D2DBEA] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <h3 className="text-sm md:text-base font-extrabold text-[#2d4771] flex items-center gap-2">
              <HelpCircle className="text-[#6E9AE0]" size={20} /> Cổng hỗ trợ kỹ thuật và báo lỗi hệ thống
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Khu vực tiếp nhận phản ánh, báo lỗi và đóng góp ý kiến của Sinh viên, Giảng viên, Cựu sinh viên và Doanh nghiệp đối với hệ thống khảo sát kiểm định chất lượng giáo dục.
            </p>
          </div>
          <div className="px-4 py-2 bg-[#EEF4FD] rounded-xl text-center flex-shrink-0">
            <span className="text-[10px] font-extrabold uppercase text-[#6E9AE0] block">Chưa xử lý</span>
            <span className="text-sm font-black text-[#dc2626]">
              {tickets.filter(t => t.status === 'Pending').length} phiếu
            </span>
          </div>
        </div>

        {/* Status filtering buttons */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => {
            const isActive = filterStatus === opt.id;
            const count = opt.id === 'all' ? tickets.length : tickets.filter(t => t.status === opt.id).length;
            return (
              <button
                key={opt.id}
                onClick={() => setFilterStatus(opt.id)}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold border-none transition-all cursor-pointer shadow-sm"
                style={isActive
                  ? { background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff' }
                  : { background: '#fff', color: '#2d4771' }
                }
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>

        {/* List of Tickets */}
        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl text-sm font-medium border text-center" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>
            <AlertCircle size={18} className="mx-auto mb-2" />
            {error}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 rounded-3xl text-center border-2 border-dashed bg-white border-[#D2DBEA]">
            <MessageSquare size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Không có phiếu hỗ trợ nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map(t => {
              const u = t.user || {};
              const roleLabel = ROLE_LABELS[u.role?.name] || ROLE_LABELS[u.role] || 'Thành viên';
              const isPending = t.status === 'Pending';
              const isProcessing = t.status === 'Processing';
              const isResolved = t.status === 'Resolved';
              
              const isReplying = activeReplyId === t.id;

              return (
                <div key={t.id} className="rounded-2xl p-5 border bg-white border-[#D2DBEA] shadow-sm animate-fade-in space-y-4 transition-all hover:shadow-md">
                  
                  {/* Top user meta & status */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3 border-slate-100">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#2d4771]">
                            {t.userId ? (u.fullName || 'Người dùng ẩn danh') : t.guestName}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg text-xs" style={
                            t.userId ? { background: '#f1f5f9', color: '#475569' } : { background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' }
                          }>
                            {t.userId ? roleLabel : 'Khách (Chưa đăng nhập)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {t.userId ? (
                            <>
                              {u.code ? `Mã: ${u.code} ` : ''}
                              {u.class ? `• Lớp: ${u.class} ` : ''}
                              {u.department ? `• Khoa: ${u.department} ` : ''}
                              {u.email ? `• Email: ${u.email}` : ''}
                            </>
                          ) : (
                            <>
                              Email liên hệ: <span className="font-mono text-[#6E9AE0]">{t.guestEmail}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(t.createdAt).toLocaleDateString('vi-VN')} {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase" style={
                        isPending ? { background: '#FFF5F5', color: '#dc2626' } :
                        isProcessing ? { background: '#FFFBEB', color: '#D97706' } :
                        { background: '#F0FDF4', color: '#16a34a' }
                      }>
                        {isPending ? 'Chưa xử lý' : isProcessing ? 'Đang xử lý' : 'Đã giải quyết'}
                      </span>
                    </div>
                  </div>

                  {/* Subject & Message Content */}
                  <div>
                    <h3 className="text-sm font-black text-[#2d4771] mb-1">
                      Tiêu đề: {t.subject}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {t.message}
                    </p>
                  </div>

                  {/* Answer / Action section */}
                  {t.reply && !isReplying && (
                    <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Phản hồi từ Quản trị viên:</p>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        {t.reply}
                      </p>
                    </div>
                  )}

                  {/* Inline reply editor */}
                  {isReplying ? (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nội dung phản hồi</label>
                        <textarea
                          placeholder="Nhập câu trả lời hỗ trợ/hướng dẫn giải quyết lỗi..."
                          rows={3}
                          value={replyTextMap[t.id] || ''}
                          onChange={e => setReplyTextMap(prev => ({ ...prev, [t.id]: e.target.value }))}
                          className="w-full px-3 py-2 text-xs md:text-sm font-medium border rounded-xl outline-none border-[#D2DBEA] bg-white text-[#2d4771] focus:border-[#6E9AE0]"
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500">Trạng thái mới:</label>
                          <select
                            value={statusUpdateMap[t.id] || 'Processing'}
                            onChange={e => setStatusUpdateMap(prev => ({ ...prev, [t.id]: e.target.value }))}
                            className="px-2.5 py-1.5 rounded-lg border text-xs font-bold outline-none border-[#D2DBEA] bg-white text-[#2d4771]"
                          >
                            <option value="Processing">Đang xử lý</option>
                            <option value="Resolved">Đã giải quyết (Đóng phiếu)</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer transition-all"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            onClick={() => handleReplySubmit(t.id)}
                            disabled={submittingMap[t.id]}
                            className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold border-none cursor-pointer transition-all flex items-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', opacity: submittingMap[t.id] ? 0.5 : 1 }}
                          >
                            <Send size={12} /> Gửi phản hồi
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-slate-100">
                      <button
                        onClick={() => {
                          setActiveReplyId(t.id);
                          setStatusUpdateMap(prev => ({ ...prev, [t.id]: t.status === 'Pending' ? 'Resolved' : t.status }));
                        }}
                        className="px-4 py-2 bg-[#EEF4FD] hover:bg-[#E2EDFC] rounded-xl text-xs font-bold text-[#6E9AE0] border-none cursor-pointer transition-all flex items-center gap-1"
                      >
                        <MessageSquare size={13} />
                        {t.reply ? 'Chỉnh sửa phản hồi' : 'Xử lý & Gửi phản hồi'}
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="px-4 py-2 bg-[#FFF5F5] hover:bg-[#FEE2E2] rounded-xl text-xs font-bold text-[#DC2626] border-none cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        Xóa phiếu
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

export default SupportManagement;
