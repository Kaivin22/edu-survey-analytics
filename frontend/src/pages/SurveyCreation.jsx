import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SCHOOLS = [];
const DEPARTMENTS = {};
const CLASSES = {};

const inputBase = {
  background: '#F9FAFD',
  borderColor: '#D2DBEA',
  color: '#2d4771',
};

const toDatetimeLocalString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

function SurveyCreation({ isEdit = false, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    title: '',
    description: '',
    targetAudience: 'Student',
    status: 'Draft',
    startDate: toDatetimeLocalString(new Date()),
    endDate: '',
    school: user?.role === 'Manager' ? (user.school || '') : '',
    department: '',
    class: []
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        console.error('Error fetching categories in SurveyCreation:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => { if (isEdit && id) loadSurvey(); }, [id, isEdit]);

  const loadSurvey = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/surveys/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm({
        title: data.title,
        description: data.description || '',
        targetAudience: data.targetAudience,
        status: data.status,
        startDate: data.startDate ? toDatetimeLocalString(data.startDate) : toDatetimeLocalString(new Date()),
        endDate: data.endDate ? toDatetimeLocalString(data.endDate) : '',
        school: data.school || (user?.role === 'Manager' ? (user.school || '') : ''),
        department: data.department || '',
        class: data.class ? data.class.split(',').map(c => c.trim()).filter(Boolean) : []
      });
      setQuestions(data.Questions.map(q => ({ ...q, options: q.options || [] })));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const addQuestion = () => setQuestions(prev => [...prev, { text: '', type: 'likert_scale', required: true, order: prev.length, options: [{ text: 'Lựa chọn 1', order: 0 }, { text: 'Lựa chọn 2', order: 1 }] }]);

  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i).map((q, idx) => ({ ...q, order: idx })));

  const updateQ = (i, key, val) => setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [key]: val } : q));

  const addOption = (qi) => setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: [...q.options, { text: `Lựa chọn ${q.options.length + 1}`, order: q.options.length }] } : q));

  const removeOption = (qi, oi) => setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: q.options.filter((_, i) => i !== oi).map((o, i) => ({ ...o, order: i })) } : q));

  const updateOption = (qi, oi, text) => setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, i) => i === oi ? { ...o, text } : o) } : q));

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title) { setError('Tiêu đề cuộc khảo sát là bắt buộc.'); return; }
    if (!questions.length) { setError('Cuộc khảo sát phải có ít nhất 1 câu hỏi.'); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) { setError(`Nội dung câu hỏi ${i + 1} không được để trống.`); return; }
      if (['single_choice', 'multiple_choice'].includes(q.type) && q.options.length < 2) { setError(`Câu ${i + 1} phải có ít nhất 2 lựa chọn.`); return; }
    }
    const today = toDatetimeLocalString(new Date());
    if (!isEdit && form.startDate < today) {
      setError('Thời gian bắt đầu không được ở quá khứ.');
      return;
    }
    if (form.endDate && form.endDate < form.startDate) {
      setError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      return;
    }
    setLoading(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_URL}/surveys/${id}` : `${API_URL}/surveys`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate ? new Date(form.startDate) : new Date(),
          endDate: form.endDate ? new Date(form.endDate) : null,
          questions,
          school: form.school || null,
          department: form.department || null,
          class: Array.isArray(form.class) && form.class.length > 0 ? form.class.join(',') : null
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(isEdit ? 'Cập nhật thành công!' : 'Tạo khảo sát thành công!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const selectStyle = { ...inputBase, appearance: 'none' };
  const depts = form.school ? (dynamicDepartments[form.school] || []) : [];
  const classes = form.department ? (dynamicClasses[form.department] || []) : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Quản trị hệ thống</p>
              <h2 className="text-sm font-extrabold text-white">{isEdit ? 'Chỉnh sửa Cuộc Khảo Sát' : 'Thiết lập Cuộc Khảo Sát Mới'}</h2>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">

        {error && <div className="p-4 rounded-2xl text-sm font-medium border flex items-center gap-2" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}><AlertCircle size={18} />{error}</div>}
        {success && <div className="p-4 rounded-2xl text-sm font-medium border flex items-center gap-2" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}><CheckCircle2 size={18} />{success}</div>}

        {/* Part 1: Metadata */}
        <div className="rounded-2xl p-6 border shadow-sm" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
          <h3 className="text-base font-extrabold mb-5 flex items-center gap-2" style={{ color: '#2d4771' }}>
            <ChevronRight size={18} style={{ color: '#6E9AE0' }} />1. Thông tin chung cuộc khảo sát
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Tiêu đề *</label>
              <input type="text" placeholder="Nhập tiêu đề cuộc khảo sát..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none" style={inputBase}
                onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Mô tả chi tiết</label>
              <textarea placeholder="Nhập mô tả hoặc lời mở đầu..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full px-4 py-2.5 rounded-2xl border text-sm font-medium outline-none" style={inputBase}
                onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Đối tượng mục tiêu', key: 'targetAudience', options: [['Student', 'Sinh viên'], ['Lecturer', 'Giảng viên'], ['Alumnus', 'Cựu sinh viên'], ['Employer', 'Nhà tuyển dụng'], ['All', 'Tất cả']] },
                { label: 'Trạng thái', key: 'status', options: [['Draft', 'Bản nháp'], ['Active', 'Kích hoạt'], ['Closed', 'Đã đóng']] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>{label}</label>
                  <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none" style={selectStyle}>
                    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Ngày giờ bắt đầu</label>
                <input type="datetime-local" value={form.startDate} min={!isEdit ? toDatetimeLocalString(new Date()) : undefined} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-2xl border text-sm font-medium outline-none" style={inputBase} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Ngày giờ hết hạn</label>
                <input type="datetime-local" value={form.endDate} min={form.startDate || toDatetimeLocalString(new Date())} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-2xl border text-sm font-medium outline-none" style={inputBase} />
              </div>
            </div>

            {/* School / Department / Class Targeting Filters */}
            <div className="pt-4 border-t border-dashed" style={{ borderColor: '#D2DBEA' }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#6E9AE0' }}>Phân quyền / Đối tượng khảo sát chi tiết (Tùy chọn)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Trường học mục tiêu</label>
                  <select
                    value={form.school}
                    disabled={user?.role === 'Manager'}
                    onChange={e => setForm(f => ({ ...f, school: e.target.value, department: '', class: [] }))}
                    className="w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none disabled:opacity-75"
                    style={selectStyle}
                  >
                    {user?.role !== 'Manager' && <option value="">Tất cả các trường (Đà Nẵng)</option>}
                    {dynamicSchools.map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Khoa mục tiêu</label>
                  <select
                    value={form.department}
                    disabled={!form.school}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value, class: [] }))}
                    className="w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none disabled:opacity-50"
                    style={selectStyle}
                  >
                    <option value="">Tất cả các khoa</option>
                    {depts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>Lớp mục tiêu</label>
                  <select
                    multiple
                    disabled={!form.department || form.targetAudience !== 'Student'}
                    value={form.class}
                    onChange={e => {
                      const selectedValues = Array.from(e.target.selectedOptions, opt => opt.value);
                      setForm(f => ({ ...f, class: selectedValues }));
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none disabled:opacity-50"
                    style={{ ...selectStyle, minHeight: '90px' }}
                  >
                    {classes.map(cl => (
                      <option key={cl} value={cl}>{cl}</option>
                    ))}
                  </select>
                  {form.class.length > 0 && (
                    <p className="text-xs mt-1 font-semibold" style={{ color: '#6E9AE0' }}>
                      Đã chọn: {form.class.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Questions */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: '#2d4771' }}>
              <ChevronRight size={18} style={{ color: '#6E9AE0' }} />2. Nội dung câu hỏi ({questions.length})
            </h3>
            <button onClick={addQuestion} className="px-4 py-2 text-xs font-bold rounded-2xl border flex items-center gap-1.5 transition-all" style={{ background: '#EEF4FD', borderColor: '#D2DBEA', color: '#6E9AE0' }}>
              <Plus size={14} />Thêm câu hỏi
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="p-10 rounded-2xl text-center border-2 border-dashed" style={{ borderColor: '#D2DBEA' }}>
              <p className="text-sm" style={{ color: '#A0AEC0' }}>Chưa có câu hỏi. Hãy nhấn "Thêm câu hỏi" ở trên.</p>
            </div>
          ) : questions.map((q, qi) => (
            <div key={qi} className="rounded-2xl p-6 border shadow-sm relative" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
              <button onClick={() => removeQuestion(qi)} className="absolute top-4 right-4 p-1.5 rounded-xl transition-all" style={{ background: '#FFF5F5', color: '#dc2626' }}>
                <Trash2 size={15} />
              </button>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg mb-4 inline-block" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>Câu hỏi {qi + 1}</span>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1" style={{ color: '#2d4771' }}>Nội dung câu hỏi *</label>
                  <input type="text" placeholder="Nhập câu hỏi..." value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none" style={inputBase}
                    onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#2d4771' }}>Loại câu hỏi</label>
                  <select value={q.type} onChange={e => updateQ(qi, 'type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none" style={selectStyle}>
                    <option value="likert_scale">Thang điểm Likert</option>
                    <option value="single_choice">Trắc nghiệm (1 lựa chọn)</option>
                    <option value="multiple_choice">Trắc nghiệm (nhiều lựa chọn)</option>
                    <option value="open_text">Tự luận / Ý kiến mở</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold" style={{ color: '#2d4771' }}>
                    <input type="checkbox" checked={q.required} onChange={e => updateQ(qi, 'required', e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#6E9AE0' }} />
                    Bắt buộc trả lời
                  </label>
                </div>
              </div>

              {['single_choice', 'multiple_choice'].includes(q.type) && (
                <div className="pt-4" style={{ borderTop: '1px solid #D2DBEA' }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold" style={{ color: '#A0AEC0' }}>Danh sách lựa chọn:</span>
                    <button onClick={() => addOption(qi)} className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1" style={{ background: '#EEF4FD', color: '#6E9AE0' }}>
                      <Plus size={10} />Thêm lựa chọn
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2 p-2 rounded-xl border" style={{ background: '#F9FAFD', borderColor: '#D2DBEA' }}>
                        <input type="text" value={opt.text} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Lựa chọn ${oi + 1}`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none" style={inputBase} />
                        <button onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2} className="p-1.5 rounded-lg transition-all disabled:opacity-30" style={{ color: '#dc2626', background: '#FFF5F5' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end gap-4 pt-2">
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-2xl text-sm font-bold border transition-all" style={{ background: '#fff', borderColor: '#D2DBEA', color: '#487bc9' }}>Hủy</button>
          <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 text-white font-bold rounded-2xl shadow-md transition-all disabled:opacity-50 text-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>Lưu khảo sát</button>
        </div>
      </main>
    </div>
  );
}

export default SurveyCreation;
