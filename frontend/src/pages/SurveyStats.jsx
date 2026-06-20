import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, FileText, File, ChevronDown, Users, BarChart3, MessageSquare, Award, Filter, X, School, CheckCircle2, AlertTriangle, Search, Clock, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TARGET_LABELS = { Student: 'Sinh viên', Lecturer: 'Giảng viên', Alumnus: 'Cựu sinh viên', Employer: 'Nhà tuyển dụng', All: 'Tất cả' };

const EXPORT_OPTIONS = [
  { id: 'excel', label: 'Xuất Excel (.xlsx)', icon: FileSpreadsheet, color: '#16a34a', bg: '#f0fdf4', ext: 'excel' },
  { id: 'word',  label: 'Xuất Word (.docx)',  icon: FileText,        color: '#2563eb', bg: '#eff6ff', ext: 'word'  },
  { id: 'pdf',   label: 'Xuất PDF (.pdf)',    icon: File,            color: '#dc2626', bg: '#fef2f2', ext: 'pdf'   },
];

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
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-[#6E9AE0] border-none cursor-pointer shadow-sm transition-all hover:shadow-md"
      >
        <FileSpreadsheet size={16} />
        Xuất báo cáo
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border p-4 z-50 overflow-hidden" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
          <p className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">
            Chọn định dạng xuất
          </p>
          {EXPORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => handleExport(opt.ext)}
                className="w-full p-2.5 border-none bg-white flex items-center gap-3 cursor-pointer text-left rounded-xl transition-all hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: opt.bg }}>
                  <Icon size={16} color={opt.color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2d4771] mb-0.5">{opt.label}</p>
                  <p className="text-[10px] text-[#A0AEC0] leading-none">
                    {opt.id === 'excel' ? 'Tất cả phản hồi dạng bảng' : opt.id === 'word' ? 'Báo cáo có cấu trúc' : 'Báo cáo in ấn'}
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

function FilterBar({ filters, onChange, onClear, dynamicSchools = [], dynamicDepartments = {}, dynamicClasses = {}, targetAudience }) {
  const depts = filters.school ? (dynamicDepartments[filters.school] || []) : [];
  const classes = filters.department ? (dynamicClasses[filters.department] || []) : [];
  const hasFilter = filters.school || filters.department || filters.class;
  const showClassFilter = !targetAudience || ['Student', 'Alumnus', 'All'].includes(targetAudience);
  const showDeptFilter = !targetAudience || ['Student', 'Lecturer', 'Alumnus', 'All'].includes(targetAudience);

  const selStyle = {
    padding: '7px 14px', borderRadius: 12, border: '1.5px solid #D2DBEA',
    background: '#fff', color: '#2d4771', fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 600,
    cursor: 'pointer', outline: 'none', minWidth: 150
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-white border border-[#D2DBEA] rounded-3xl p-3 md:px-5 shadow-sm">
      <div className="flex items-center gap-1.5 mr-2">
        <Filter size={15} color="#6E9AE0" />
        <span className="text-xs font-extrabold text-[#487bc9]">Bộ lọc:</span>
      </div>

      {showDeptFilter && (
        <select value={filters.department} onChange={e => onChange({ ...filters, department: e.target.value, class: '' })} style={{ ...selStyle, opacity: depts.length ? 1 : 0.4 }} disabled={!depts.length}>
          <option value="">📚 Tất cả khoa</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}

      {showClassFilter && (
        <select
          value={filters.class}
          onChange={e => onChange({ ...filters, class: e.target.value })}
          style={{ ...selStyle, opacity: classes.length ? 1 : 0.4 }}
          disabled={!filters.department}
        >
          <option value="">🎓 Tất cả lớp</option>
          {classes.map(cl => <option key={cl} value={cl}>{cl}</option>)}
        </select>
      )}

      {hasFilter && (
        <button onClick={onClear} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold cursor-pointer transition-all hover:bg-red-100">
          <X size={13} /> Xóa lọc
        </button>
      )}

      {hasFilter && (
        <span className="text-[10px] font-bold text-[#6E9AE0] bg-[#EEF4FD] rounded-lg px-2.5 py-1">
          {[filters.school, filters.department, filters.class].filter(Boolean).join(' › ')}
        </span>
      )}
    </div>
  );
}

function SurveyStats({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ school: user?.school || '', department: '', class: '' });
  const token = localStorage.getItem('token');

  // Tabs states
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'participants' | 'dss'
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [dssData, setDssData] = useState(null);
  const [dssLoading, setDssLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
        console.error('Error fetching categories in SurveyStats:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => { 
    fetchStats(); 
  }, [id, filters]);

  useEffect(() => {
    if (activeTab === 'participants') {
      fetchParticipants();
    } else if (activeTab === 'dss') {
      fetchDss();
    }
  }, [id, activeTab]);

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

  const fetchParticipants = async () => {
    setParticipantsLoading(true);
    try {
      const res = await fetch(`${API_URL}/surveys/${id}/participants`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setParticipants(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const fetchDss = async () => {
    setDssLoading(true);
    try {
      const res = await fetch(`${API_URL}/surveys/${id}/decision-support`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setDssData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDssLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => { setFilters(newFilters); };
  const handleFilterClear  = () => setFilters({ school: user?.school || '', department: '', class: '' });

  // Filter participants in javascript
  const filteredParticipants = participants.filter(p => {
    if (filters.school && p.school !== filters.school) return false;
    if (filters.department && p.department !== filters.department) return false;
    if (filters.class && p.class !== filters.class) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const name = (p.fullName || '').toLowerCase();
      const code = (p.code || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      return name.includes(search) || code.includes(search) || email.includes(search);
    }
    return true;
  });

  const partSubmittedCount = filteredParticipants.filter(p => p.status === 'submitted').length;
  const partPendingCount = filteredParticipants.filter(p => p.status === 'pending').length;
  const partTotalCount = filteredParticipants.length;

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

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-6">

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b-2" style={{ borderColor: '#D2DBEA' }}>
          {[
            { key: 'stats', label: 'Báo cáo câu hỏi', icon: BarChart3 },
            { key: 'participants', label: 'Danh sách tham gia', icon: Users },
            { key: 'dss', label: 'Hỗ trợ ra quyết định (DSS)', icon: ShieldAlert }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-5 py-3 -mb-[2px] rounded-t-2xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all border-b-2"
                style={activeTab === tab.key
                  ? { borderColor: '#6E9AE0', color: '#6E9AE0', background: 'rgba(110,154,224,0.06)' }
                  : { borderColor: 'transparent', color: '#487bc9', background: 'transparent' }
                }
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Bar (Only showing for Stats & Participants) */}
        {activeTab !== 'dss' && (
          <FilterBar 
            filters={filters} 
            onChange={handleFilterChange} 
            onClear={handleFilterClear}
            dynamicSchools={dynamicSchools}
            dynamicDepartments={dynamicDepartments}
            dynamicClasses={dynamicClasses}
            targetAudience={stats?.targetAudience}
          />
        )}

        {/* ─── TAB 1: SURVEY DETAILED QUESTIONS STATS ─── */}
        {activeTab === 'stats' && (
          <>
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
              </div>
            ) : stats && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    { icon: Users,    label: 'Tỷ lệ phản hồi',   value: `${stats.totalResponses} / ${stats.totalAssigned} lượt (${stats.totalAssigned > 0 ? Math.round((stats.totalResponses / stats.totalAssigned) * 100) : 0}%)`, bg: '#EEF4FD', color: '#6E9AE0' },
                    { icon: Award,    label: 'Đối tượng khảo sát', value: TARGET_LABELS[stats.targetAudience] || stats.targetAudience, bg: '#FFFBEB', color: '#D97706' },
                    { icon: BarChart3, label: 'Số câu hỏi',        value: `${stats.stats.length} câu`,    bg: '#F0FDF4', color: '#16a34a' },
                  ].map(({ icon: Icon, label, value, bg, color }) => (
                    <div key={label} className="rounded-2xl p-5 border shadow-sm flex items-center gap-4 animate-fade-in" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon size={22} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-xs uppercase font-bold tracking-wide" style={{ color: '#A0AEC0' }}>{label}</p>
                        <h3 className="text-base md:text-lg font-black mt-0.5" style={{ color: '#2d4771' }}>{value}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Survey description & dates */}
                <div className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ background: '#EEF4FD', borderColor: 'rgba(110,154,224,0.3)' }}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#2d4771]">{stats.description || 'Không có mô tả.'}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[200px] border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 border-dashed" style={{ borderColor: 'rgba(110,154,224,0.4)' }}>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#487bc9]">
                      <Clock size={14} />
                      <span>Bắt đầu: {stats.startDate ? new Date(stats.startDate).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#dc2626]">
                      <Clock size={14} />
                      <span>Kết thúc: {stats.endDate ? new Date(stats.endDate).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                  </div>
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
                      <div key={q.id} className="rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md animate-fade-in" style={{ background: '#fff', borderColor: '#D2DBEA', borderLeftWidth: '4px', borderLeftColor: '#6E9AE0' }}>
                        <div className="flex items-start gap-2 pb-4 mb-5" style={{ borderBottom: '1px solid #D2DBEA' }}>
                          <span className="text-sm font-extrabold text-[#A0AEC0]">Câu {idx + 1}.</span>
                          <div className="flex-1">
                            <h3 className="text-sm md:text-base font-extrabold leading-snug" style={{ color: '#2d4771' }}>{q.text}</h3>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>
                                {q.type === 'likert_scale' ? 'Thang điểm Likert' : q.type === 'single_choice' ? 'Trắc nghiệm 1 lựa chọn' : q.type === 'multiple_choice' ? 'Trắc nghiệm nhiều lựa chọn' : 'Tự luận mở'}
                              </span>
                              {q.category && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600">
                                  Tiêu chí: {q.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ── LIKERT ── */}
                        {q.type === 'likert_scale' && (() => {
                          const groups = getLikertGroups(q.data.distribution, q.totalAnswers);
                          return (
                            <div className="space-y-4">
                              {/* Average score */}
                              <div className="flex flex-col md:flex-row gap-5 items-stretch">
                                <div className="flex flex-col items-center justify-center p-4 rounded-2xl text-center" style={{ background: '#EEF4FD', minWidth: 120 }}>
                                  <span className="text-4xl font-black text-[#6E9AE0]">{q.data.average}</span>
                                  <span className="text-[10px] font-bold uppercase mt-1 text-[#487bc9]">Điểm TB / 5.0</span>
                                  <div className="mt-2 flex gap-0.5">
                                    {[1,2,3,4,5].map(s => (
                                      <span key={s} style={{ color: s <= Math.round(q.data.average) ? '#FBECAC' : '#D2DBEA', fontSize: '15px' }}>★</span>
                                    ))}
                                  </div>
                                </div>

                                {/* QA 3-tier summary */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {groups.map(g => (
                                    <div key={g.label} className="rounded-2xl p-3 text-center border flex flex-col justify-center" style={{ background: g.bg, borderColor: g.color + '40' }}>
                                      <p className="text-xl md:text-2xl font-black" style={{ color: g.color }}>{g.pct}%</p>
                                      <p className="text-xs font-bold mt-0.5 leading-tight" style={{ color: '#2d4771' }}>{g.label}</p>
                                      <p className="text-[10px] mt-0.5 text-[#A0AEC0]">{g.count} phản hồi • Điểm {g.scores}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Detailed per-score bars */}
                              <div className="pt-3" style={{ borderTop: '1px dashed #D2DBEA' }}>
                                <p className="text-xs font-bold mb-2 text-[#A0AEC0]">Chi tiết theo điểm số:</p>
                                <div className="space-y-2">
                                  {[5, 4, 3, 2, 1].map(val => {
                                    const count = q.data.distribution[val] || 0;
                                    const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
                                    const barColor = val >= 4 ? '#22c55e' : val === 3 ? '#f59e0b' : '#ef4444';
                                    return (
                                      <div key={val} className="flex items-center gap-3 text-xs font-semibold">
                                        <span className="w-12 text-[#A0AEC0]">Điểm {val}:</span>
                                        <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100">
                                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                                        </div>
                                        <span className="w-20 text-right font-bold text-[#2d4771]">{count} ({pct}%)</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* ── CHOICE ── */}
                        {['single_choice', 'multiple_choice'].includes(q.type) && (() => {
                          const sorted = Object.entries(q.data.options || {}).sort((a, b) => b[1] - a[1]);
                          return (
                            <div className="space-y-3">
                              {sorted.map(([text, count]) => {
                                const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
                                return (
                                  <div key={text} className="space-y-1">
                                    <div className="flex justify-between text-xs md:text-sm font-semibold">
                                      <span style={{ color: '#2d4771' }}>{text}</span>
                                      <span style={{ color: '#6E9AE0' }}>{count} lượt ({pct}%)</span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100">
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
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {q.data.comments.length === 0
                              ? <p className="text-xs italic text-[#A0AEC0]">Không có ý kiến bình luận nào.</p>
                              : q.data.comments.map((c, i) => (
                                <div key={i} className="p-3 rounded-xl border flex items-start gap-2 text-xs md:text-sm bg-slate-50 border-[#D2DBEA]">
                                  <MessageSquare size={14} className="flex-shrink-0 mt-0.5 text-[#6E9AE0]" />
                                  <p className="text-[#2d4771]">{c}</p>
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
          </>
        )}

        {/* ─── TAB 2: PARTICIPANTS TRACKING LIST ─── */}
        {activeTab === 'participants' && (
          <div className="space-y-5">
            {participantsLoading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <>
                {/* Summary badges */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Tổng số được giao', value: partTotalCount, bg: '#F8FAFC', text: '#2d4771', border: '#D2DBEA' },
                    { label: 'Đã hoàn thành', value: partSubmittedCount, bg: '#F0FDF4', text: '#16a34a', border: '#bbf7d0' },
                    { label: 'Chưa thực hiện', value: partPendingCount, bg: '#FFF5F5', text: '#dc2626', border: '#fecaca' },
                    { label: 'Tỷ lệ nộp bài', value: `${partTotalCount > 0 ? Math.round((partSubmittedCount / partTotalCount) * 100) : 0}%`, bg: '#EEF4FD', text: '#6E9AE0', border: 'rgba(110,154,224,0.3)' }
                  ].map(card => (
                    <div key={card.label} className="p-4 rounded-2xl border text-center animate-fade-in shadow-sm bg-white" style={{ borderColor: card.border }}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{card.label}</p>
                      <p className="text-lg md:text-xl font-black mt-1" style={{ color: card.text }}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo họ tên, email hoặc MSSV/Mã CB..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm outline-none bg-white text-[#2d4771] border-[#D2DBEA] transition-all focus:border-[#6E9AE0]"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Table */}
                {filteredParticipants.length === 0 ? (
                  <div className="p-12 rounded-3xl text-center border-2 border-dashed bg-white border-[#D2DBEA]">
                    <Users size={36} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-500">Không tìm thấy thành viên nào khớp với bộ lọc/tìm kiếm.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-[#D2DBEA] animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#D2DBEA]" style={{ background: '#EEF4FD' }}>
                            {['Mã số', 'Họ và tên', 'Đối tượng', 'Khoa/Ngành', 'Lớp', 'Trạng thái', 'Thời gian nộp'].map(h => (
                              <th key={h} className="py-3.5 px-4 text-xs font-black uppercase text-[#6E9AE0] tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParticipants.map((p, i) => (
                            <tr key={p.id} className="border-b border-[#D2DBEA]" style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFE' }}>
                              <td className="py-3 px-4 text-xs font-bold text-[#2d4771]">{p.code || '—'}</td>
                              <td className="py-3 px-4">
                                <p className="text-xs md:text-sm font-extrabold text-[#2d4771]">{p.fullName}</p>
                                <p className="text-[10px] text-slate-400">{p.email}</p>
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-500 font-semibold">{TARGET_LABELS[p.role] || p.role}</td>
                              <td className="py-3 px-4 text-xs text-slate-500 font-semibold">{p.department || '—'}</td>
                              <td className="py-3 px-4 text-xs text-slate-500 font-bold">{p.class || '—'}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 rounded-xl text-[10px] font-bold" style={
                                  p.status === 'submitted'
                                    ? { background: '#F0FDF4', color: '#16a34a' }
                                    : { background: '#FFF5F5', color: '#dc2626' }
                                }>
                                  {p.status === 'submitted' ? 'Đã làm' : 'Chưa làm'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-400">
                                {p.submittedAt ? (
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(p.submittedAt).toLocaleString('vi-VN')}
                                  </span>
                                ) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── TAB 3: DECISION SUPPORT SYSTEM (DSS) ─── */}
        {activeTab === 'dss' && (
          <div className="space-y-6">
            {dssLoading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
              </div>
            ) : dssData && (
              <>
                {/* Introduction DSS card */}
                <div className="p-5 rounded-2xl border shadow-sm bg-white border-[#D2DBEA] animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="max-w-xl">
                    <h3 className="text-sm md:text-base font-extrabold text-[#2d4771] flex items-center gap-2">
                      <ShieldAlert className="text-amber-500" size={20} /> Hệ thống hỗ trợ ra quyết định tự động (DSS)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      DSS phân tích kết quả khảo sát thang Likert, nhóm theo các tiêu chí kiểm định chất lượng giáo dục chính thức. Hệ thống tự động xác định các điểm nghẽn chất lượng (chỉ số &lt; 3.5/5.0) và xuất kế hoạch hành động cải tiến chi tiết.
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-[#EEF4FD] rounded-xl text-center flex-shrink-0">
                    <span className="text-[10px] font-extrabold uppercase text-[#6E9AE0] block">Chuẩn kiểm định</span>
                    <span className="text-sm font-black text-[#2d4771]">3.5 / 5.0 Điểm</span>
                  </div>
                </div>

                {/* Score breakdown cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {dssData.categoriesAnalysis && dssData.categoriesAnalysis.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white border border-[#D2DBEA] rounded-2xl text-slate-400 text-sm">
                      Không tìm thấy câu hỏi thang điểm Likert được gán danh mục tiêu chí để phân tích DSS.
                    </div>
                  ) : dssData.categoriesAnalysis?.map(analysis => {
                    const avg = analysis.average;
                    const isCritical = analysis.status === 'Critical';
                    const isStrong = analysis.status === 'Strong';
                    
                    const scoreColor = isCritical ? '#dc2626' : isStrong ? '#16a34a' : '#D97706';
                    const scoreBg = isCritical ? '#FFF5F5' : isStrong ? '#F0FDF4' : '#FFFBEB';
                    const scoreBorder = isCritical ? '#fecaca' : isStrong ? '#bbf7d0' : '#fef3c7';

                    return (
                      <div key={analysis.category} className="p-4 rounded-2xl border bg-white flex flex-col justify-between shadow-sm animate-fade-in" style={{ borderColor: scoreBorder }}>
                        <div>
                          <p className="text-xs font-black text-slate-600 truncate">{analysis.category}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{analysis.questionsCount} câu hỏi • {analysis.totalResponses} phản hồi</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-2xl font-black" style={{ color: scoreColor }}>{avg}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: scoreBg, color: scoreColor }}>
                            {isCritical ? '⚠️ Cảnh báo nghẽn' : isStrong ? '✨ Xuất sắc / Tốt' : '👍 Đạt / Khá'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actionable Recommendations Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-[#2d4771] flex items-center gap-1.5">
                    🎯 Đề xuất kế hoạch hành động cải tiến chất lượng
                  </h3>

                  {dssData.categoriesAnalysis?.filter(a => a.status === 'Critical').length === 0 ? (
                    <div className="p-8 rounded-3xl text-center border border-emerald-200 bg-emerald-50 text-emerald-800 animate-fade-in">
                      <CheckCircle2 size={36} className="mx-auto mb-3 text-emerald-500" />
                      <h4 className="font-extrabold text-sm md:text-base">Không phát hiện điểm nghẽn chất lượng nào!</h4>
                      <p className="text-xs mt-1 max-w-xl mx-auto leading-relaxed">
                        Toàn bộ các tiêu chí kiểm định chất lượng (Cơ sở vật chất, Chương trình đào tạo, Phương pháp giảng dạy, Dịch vụ hỗ trợ) đều đạt mức điểm tiêu chuẩn đánh giá từ 3.5 trở lên. Nhà trường cần duy trì và phát triển các thế mạnh này trong chu kỳ tiếp theo.
                      </p>
                    </div>
                  ) : (
                    dssData.categoriesAnalysis?.filter(a => a.status === 'Critical').map(analysis => (
                      <div key={analysis.category} className="rounded-2xl border p-5 bg-[#FFF5F5] border-red-200 shadow-sm animate-fade-in space-y-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5 animate-pulse" size={20} />
                          <div>
                            <h4 className="font-extrabold text-sm md:text-base text-red-800 uppercase tracking-wide">
                              Điểm nghẽn chất lượng: {analysis.category} (TB {analysis.average} / 5.0)
                            </h4>
                            <p className="text-xs text-red-700 leading-relaxed mt-0.5">
                              Điểm khảo sát dưới mức tiêu chuẩn (3.5). Đề nghị Ban Giám hiệu và các phòng ban liên quan khẩn trương rà soát.
                            </p>
                          </div>
                        </div>

                        {/* Recommends list box */}
                        <div className="p-4 rounded-xl border bg-white border-red-100 space-y-2">
                          <p className="text-xs font-bold text-slate-800">📋 Kế hoạch hành động cải tiến khuyến nghị:</p>
                          <ul className="list-disc list-inside space-y-1.5">
                            {analysis.recommendations.map((rec, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-600 font-medium leading-relaxed pl-1">
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Question drill-down */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-red-800">🔍 Chi tiết các câu hỏi gây điểm nghẽn:</p>
                          <div className="space-y-2">
                            {analysis.questions.map(q => (
                              <div key={q.id} className="flex justify-between items-center p-2.5 bg-white border rounded-xl border-slate-100 shadow-xs">
                                <span className="text-xs text-slate-700 font-semibold max-w-md line-clamp-1">{q.text}</span>
                                <span className="text-xs font-black px-2 py-0.5 rounded-lg ml-2" style={
                                  q.average < 3.5 
                                    ? { background: '#FFF5F5', color: '#dc2626' } 
                                    : { background: '#F0FDF4', color: '#16a34a' }
                                }>
                                  TB: {q.average} ({q.responsesCount} lượt)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default SurveyStats;
