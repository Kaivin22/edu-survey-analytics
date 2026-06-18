import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Users, BarChart3, MessageSquare, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TARGET_LABELS = { Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng', All: 'Tất cả' };

function SurveyStats({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchStats(); }, [id]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys/${id}/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStats(data);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FAFD' }}>
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
    </div>
  );

  if (error || !stats) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F9FAFD' }}>
      <div className="p-8 rounded-3xl text-center max-w-sm border" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
        <p className="font-bold mb-4" style={{ color: '#2d4771' }}>{error || 'Không thể tải báo cáo.'}</p>
        <button onClick={() => navigate('/')} className="px-5 py-2.5 text-white font-bold rounded-2xl" style={{ background: '#6E9AE0' }}>Quay về</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Thống kê báo cáo</p>
              <h2 className="text-sm font-extrabold text-white leading-tight max-w-sm md:max-w-xl line-clamp-1">{stats.surveyTitle}</h2>
            </div>
          </div>
          <a
            href={`${API_URL}/reports/${id}/excel`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: '#fff', color: '#6E9AE0' }}
          >
            <FileSpreadsheet size={16} />Xuất Excel
          </a>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8">

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Users, label: 'Số lượt phản hồi', value: `${stats.totalResponses} lượt`, bg: '#EEF4FD', color: '#6E9AE0' },
            { icon: Award, label: 'Đối tượng khảo sát', value: TARGET_LABELS[stats.targetAudience] || stats.targetAudience, bg: '#FFFBEB', color: '#D97706' },
            { icon: BarChart3, label: 'Số câu hỏi', value: `${stats.stats.length} câu`, bg: '#F0FDF4', color: '#16a34a' },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="rounded-2xl p-5 border shadow-sm flex items-center gap-4" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wide" style={{ color: '#A0AEC0' }}>{label}</p>
                <h3 className="text-lg font-black mt-0.5" style={{ color: '#2d4771' }}>{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Survey description */}
        <div className="p-5 rounded-2xl border" style={{ background: '#EEF4FD', borderColor: 'rgba(110,154,224,0.3)' }}>
          <p className="text-sm font-semibold" style={{ color: '#2d4771' }}>{stats.description || 'Không có mô tả.'}</p>
        </div>

        {/* No responses */}
        {stats.totalResponses === 0 ? (
          <div className="p-12 rounded-3xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
            <Users size={48} className="mx-auto mb-4" style={{ color: '#D2DBEA' }} />
            <h3 className="font-bold text-lg" style={{ color: '#2d4771' }}>Chưa có phản hồi nào</h3>
            <p className="text-sm mt-1" style={{ color: '#6E9AE0' }}>Cuộc khảo sát này chưa nhận được phản hồi từ bên liên quan.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stats.stats.map((q, idx) => (
              <div key={q.id} className="rounded-2xl p-6 border shadow-sm" style={{ background: '#fff', borderColor: '#D2DBEA', borderLeftWidth: '4px', borderLeftColor: '#6E9AE0' }}>
                <div className="flex items-start gap-2 pb-4 mb-5" style={{ borderBottom: '1px solid #D2DBEA' }}>
                  <span className="text-sm font-extrabold" style={{ color: '#A0AEC0' }}>Câu {idx + 1}.</span>
                  <div>
                    <h3 className="text-base font-extrabold leading-snug" style={{ color: '#2d4771' }}>{q.text}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg mt-1 inline-block" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>
                      {q.type === 'likert_scale' ? 'Thang điểm Likert' : q.type === 'single_choice' ? 'Trắc nghiệm 1 lựa chọn' : q.type === 'multiple_choice' ? 'Trắc nghiệm nhiều lựa chọn' : 'Tự luận mở'}
                    </span>
                  </div>
                </div>

                {/* ─ LIKERT STATS ─ */}
                {q.type === 'likert_scale' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl text-center" style={{ background: '#EEF4FD' }}>
                      <span className="text-4xl font-black" style={{ color: '#6E9AE0' }}>{q.data.average}</span>
                      <span className="text-xs font-bold uppercase mt-1" style={{ color: '#487bc9' }}>Điểm TB / 5.0</span>
                      {/* Star visual */}
                      <div className="mt-2 flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ color: s <= Math.round(q.data.average) ? '#FBECAC' : '#D2DBEA', fontSize: '16px' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-3 space-y-2.5">
                      {[5, 4, 3, 2, 1].map(val => {
                        const count = q.data.distribution[val] || 0;
                        const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
                        const barColor = val >= 4 ? '#22c55e' : val === 3 ? '#6b7280' : '#ef4444';
                        return (
                          <div key={val} className="flex items-center gap-3 text-xs font-semibold">
                            <span className="w-12" style={{ color: '#A0AEC0' }}>Điểm {val}:</span>
                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#D2DBEA' }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                            </div>
                            <span className="w-20 text-right font-bold" style={{ color: '#2d4771' }}>{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ─ CHOICE STATS ─ */}
                {['single_choice', 'multiple_choice'].includes(q.type) && (
                  <div className="space-y-3.5">
                    {Object.entries(q.data.options || {}).map(([text, count]) => {
                      const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
                      return (
                        <div key={text} className="space-y-1.5">
                          <div className="flex justify-between text-sm font-semibold">
                            <span style={{ color: '#2d4771' }}>{text}</span>
                            <span style={{ color: '#6E9AE0' }}>{count} lượt ({pct}%)</span>
                          </div>
                          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#D2DBEA' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6E9AE0, #487bc9)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─ OPEN TEXT ─ */}
                {q.type === 'open_text' && (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {q.data.comments.length === 0
                      ? <p className="text-xs italic" style={{ color: '#A0AEC0' }}>Không có bình luận nào.</p>
                      : q.data.comments.map((c, i) => (
                        <div key={i} className="p-3 rounded-xl border flex items-start gap-2 text-sm" style={{ background: '#F9FAFD', borderColor: '#D2DBEA' }}>
                          <MessageSquare size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#6E9AE0' }} />
                          <p style={{ color: '#2d4771' }}>{c}</p>
                        </div>
                      ))
                    }
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SurveyStats;
