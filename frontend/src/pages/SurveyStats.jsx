import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, FileText, File, ChevronDown, Users, BarChart3, MessageSquare, Award, Filter, X, School } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TARGET_LABELS = { Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng', All: 'Tất cả' };

const SCHOOLS = ["Kiến trúc Đà Nẵng (DAU)", "Việt Hàn (VKU)"];

const DEPARTMENTS = {
  "Kiến trúc Đà Nẵng (DAU)": [
    "Công nghệ thông tin",
    "Kiến trúc",
    "Xây dựng",
    "Kinh tế"
  ],
  "Việt Hàn (VKU)": [
    "Khoa học Máy tính",
    "Kỹ thuật Máy tính",
    "Kinh tế số & Thương mại điện tử"
  ]
};

const CLASSES = {
  "Công nghệ thông tin": ["22CT1", "22CT2", "22CT3", "22CT4"],
  "Kiến trúc": ["22KT1", "22KT2"],
  "Xây dựng": ["22XD1"],
  "Kinh tế": ["22KTQD1"],
  "Khoa học Máy tính": ["22IT1", "22IT2"],
  "Kỹ thuật Máy tính": ["22CE1"],
  "Kinh tế số & Thương mại điện tử": ["22EC1"]
};

const EXPORT_OPTIONS = [
  { id: 'excel', label: 'Xuất Excel (.xlsx)', icon: FileSpreadsheet, color: '#16a34a', bg: '#f0fdf4', ext: 'excel' },
  { id: 'word',  label: 'Xuất Word (.docx)',  icon: FileText,        color: '#2563eb', bg: '#eff6ff', ext: 'word'  },
  { id: 'pdf',   label: 'Xuất PDF (.pdf)',    icon: File,            color: '#dc2626', bg: '#fef2f2', ext: 'pdf'   },
];

// ── 3-tier QA grouping for Likert ──────────────────────────────────────────
function getLikertGroups(distribution, totalAnswers) {
  const positive = (distribution[4] || 0) + (distribution[5] || 0);
  const neutral   = distribution[3] || 0;
  const negative  = (distribution[1] || 0) + (distribution[2] || 0);
  const pct = (n) => totalAnswers > 0 ? Math.round((n / totalAnswers) * 100) : 0;
  return [
    { label: 'Tích cực / Hài lòng',       count: positive, pct: pct(positive), color: '#22c55e', bg: '#f0fdf4', scores: '4–5' },
    { label: 'Trung lập',                  count: neutral,  pct: pct(neutral),  color: '#f59e0b', bg: '#fffbeb', scores: '3'   },
    { label: 'Tiêu cực / Không hài lòng', count: negative, pct: pct(negative), color: '#ef4444', bg: '#fef2f2', scores: '1–2' },
  ];
}

// ── Export dropdown ────────────────────────────────────────────────────────
function ExportDropdown({ surveyId, token, filters }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = (ext) => {
    const params = new URLSearchParams();
    if (filters.school)     params.set('school',     filters.school);
    if (filters.department) params.set('department', filters.department);
    if (filters.class)      params.set('class',      filters.class);
    const query = params.toString() ? `?${params.toString()}` : '';
    const url = `${API_URL}/reports/${surveyId}/${ext}${query}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const extMap = { excel: '.xlsx', word: '.docx', pdf: '.pdf' };
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `bao_cao_khao_sat_${surveyId}${extMap[ext]}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(err => alert('Lỗi tải báo cáo: ' + err.message));
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          borderRadius: 12, background: '#fff', color: '#6E9AE0',
          fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'box-shadow 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
      >
        <FileSpreadsheet size={16} />
        Xuất báo cáo
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#fff', borderRadius: 16, boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
          border: '1px solid #D2DBEA', minWidth: 220, zIndex: 50, overflow: 'hidden'
        }}>
          <p style={{ padding: '10px 16px 6px', fontSize: 11, fontWeight: 700, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Chọn định dạng xuất
          </p>
          {EXPORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => handleExport(opt.ext)}
                style={{
                  width: '100%', padding: '10px 16px', border: 'none', background: '#fff',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = opt.bg}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={opt.color} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#2d4771', marginBottom: 1 }}>{opt.label}</p>
                  <p style={{ fontSize: 11, color: '#A0AEC0' }}>
                    {opt.id === 'excel' ? 'Tất cả phản hồi dạng bảng' : opt.id === 'word' ? 'Báo cáo có cấu trúc bảng biểu' : 'Báo cáo in ấn chuyên nghiệp'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Filter Bar ─────────────────────────────────────────────────────────────
function FilterBar({ filters, onChange, onClear }) {
  const depts = filters.school ? (DEPARTMENTS[filters.school] || []) : [];
  const classes = filters.department ? (CLASSES[filters.department] || []) : [];
  const hasFilter = filters.school || filters.department || filters.class;

  const selStyle = {
    padding: '7px 14px', borderRadius: 12, border: '1.5px solid #D2DBEA',
    background: '#fff', color: '#2d4771', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', outline: 'none', minWidth: 150
  };

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
      background: '#fff', borderRadius: 20, border: '1.5px solid #D2DBEA',
      padding: '12px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
        <Filter size={15} color="#6E9AE0" />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#487bc9' }}>Bộ lọc:</span>
      </div>

      {/* School */}
      <select value={filters.school} onChange={e => onChange({ school: e.target.value, department: '', class: '' })} style={selStyle}>
        <option value="">🏫 Tất cả trường</option>
        {SCHOOLS.map(sc => (
          <option key={sc} value={sc}>{sc}</option>
        ))}
      </select>

      {/* Department */}
      <select value={filters.department} onChange={e => onChange({ ...filters, department: e.target.value, class: '' })} style={{ ...selStyle, opacity: depts.length ? 1 : 0.4 }} disabled={!depts.length}>
        <option value="">📚 Tất cả khoa</option>
        {depts.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Class */}
      <select
        value={filters.class}
        onChange={e => onChange({ ...filters, class: e.target.value })}
        style={{ ...selStyle, opacity: classes.length ? 1 : 0.4 }}
        disabled={!filters.department}
      >
        <option value="">🎓 Tất cả lớp</option>
        {classes.map(cl => <option key={cl} value={cl}>{cl}</option>)}
      </select>

      {/* Clear */}
      {hasFilter && (
        <button onClick={onClear} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
          borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff5f5',
          color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer'
        }}>
          <X size={13} /> Xóa lọc
        </button>
      )}

      {hasFilter && (
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#6E9AE0',
          background: '#EEF4FD', borderRadius: 8, padding: '4px 10px'
        }}>
          {[filters.school && SCHOOLS[filters.school]?.label, filters.department, filters.class].filter(Boolean).join(' › ')}
        </span>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
function SurveyStats({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ school: '', department: '', class: '' });
  const token = localStorage.getItem('token');

  useEffect(() => { fetchStats(); }, [id, filters]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.school)     params.set('school',     filters.school);
      if (filters.department) params.set('department', filters.department);
      if (filters.class)      params.set('class',      filters.class);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_URL}/surveys/${id}/stats${query}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStats(data);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleFilterChange = (newFilters) => { setFilters(newFilters); };
  const handleFilterClear  = () => setFilters({ school: '', department: '', class: '' });

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F9FAFD' }}>
      <div className="p-8 rounded-3xl text-center max-w-sm border" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
        <p className="font-bold mb-4" style={{ color: '#2d4771' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 text-white font-bold rounded-2xl" style={{ background: '#6E9AE0' }}>Quay về</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Thống kê báo cáo</p>
              <h2 className="text-sm font-extrabold text-white leading-tight max-w-sm md:max-w-xl line-clamp-1">
                {stats?.surveyTitle || '...'}
              </h2>
            </div>
          </div>
          <ExportDropdown surveyId={id} token={token} filters={filters} />
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8">

        {/* Filter Bar */}
        <FilterBar filters={filters} onChange={handleFilterChange} onClear={handleFilterClear} />

        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
          </div>
        ) : stats && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: Users,    label: 'Số lượt phản hồi',   value: `${stats.totalResponses} lượt`, bg: '#EEF4FD', color: '#6E9AE0' },
                { icon: Award,    label: 'Đối tượng khảo sát', value: TARGET_LABELS[stats.targetAudience] || stats.targetAudience, bg: '#FFFBEB', color: '#D97706' },
                { icon: BarChart3, label: 'Số câu hỏi',        value: `${stats.stats.length} câu`,    bg: '#F0FDF4', color: '#16a34a' },
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
                <p className="text-sm mt-1" style={{ color: '#6E9AE0' }}>
                  {Object.values(filters).some(Boolean)
                    ? 'Không có phản hồi phù hợp với bộ lọc hiện tại.'
                    : 'Cuộc khảo sát này chưa nhận được phản hồi từ bên liên quan.'}
                </p>
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

                    {/* ── LIKERT ── 3-tier QA grouping ── */}
                    {q.type === 'likert_scale' && (() => {
                      const groups = getLikertGroups(q.data.distribution, q.totalAnswers);
                      return (
                        <div className="space-y-4">
                          {/* Average score */}
                          <div className="flex items-center gap-5">
                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl text-center" style={{ background: '#EEF4FD', minWidth: 110 }}>
                              <span className="text-4xl font-black" style={{ color: '#6E9AE0' }}>{q.data.average}</span>
                              <span className="text-xs font-bold uppercase mt-1" style={{ color: '#487bc9' }}>Điểm TB / 5.0</span>
                              <div className="mt-2 flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} style={{ color: s <= Math.round(q.data.average) ? '#FBECAC' : '#D2DBEA', fontSize: '16px' }}>★</span>
                                ))}
                              </div>
                            </div>

                            {/* QA 3-tier summary */}
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              {groups.map(g => (
                                <div key={g.label} className="rounded-2xl p-3 text-center border" style={{ background: g.bg, borderColor: g.color + '40' }}>
                                  <p className="text-2xl font-black" style={{ color: g.color }}>{g.pct}%</p>
                                  <p className="text-xs font-bold mt-0.5 leading-tight" style={{ color: '#2d4771' }}>{g.label}</p>
                                  <p className="text-xs mt-0.5" style={{ color: '#A0AEC0' }}>{g.count} phản hồi</p>
                                  <p className="text-xs font-semibold mt-0.5" style={{ color: g.color }}>Điểm {g.scores}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed per-score bars */}
                          <div className="pt-3" style={{ borderTop: '1px dashed #D2DBEA' }}>
                            <p className="text-xs font-bold mb-2" style={{ color: '#A0AEC0' }}>Chi tiết theo điểm số:</p>
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map(val => {
                                const count = q.data.distribution[val] || 0;
                                const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
                                const barColor = val >= 4 ? '#22c55e' : val === 3 ? '#f59e0b' : '#ef4444';
                                return (
                                  <div key={val} className="flex items-center gap-3 text-xs font-semibold">
                                    <span className="w-12" style={{ color: '#A0AEC0' }}>Điểm {val}:</span>
                                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#D2DBEA' }}>
                                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                                    </div>
                                    <span className="w-20 text-right font-bold" style={{ color: '#2d4771' }}>{count} ({pct}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── CHOICE ── sorted by popularity ── */}
                    {['single_choice', 'multiple_choice'].includes(q.type) && (() => {
                      const sorted = Object.entries(q.data.options || {}).sort((a, b) => b[1] - a[1]);
                      return (
                        <div className="space-y-3.5">
                          {sorted.map(([text, count]) => {
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
                      );
                    })()}

                    {/* ── OPEN TEXT ── */}
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
          </>
        )}
      </main>
    </div>
  );
}

export default SurveyStats;
