import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle, Info, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LIKERT_LABELS = { 1: 'Rất không đồng ý', 2: 'Không đồng ý', 3: 'Bình thường', 4: 'Đồng ý', 5: 'Rất đồng ý' };
const LIKERT_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#6b7280', 4: '#22c55e', 5: '#16a34a' };

function SurveyTaking({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchSurvey(); }, [id]);

  useEffect(() => {
    if (!survey) return;
    const qs = survey.Questions;
    let done = 0;
    qs.forEach(q => {
      const a = answers[q.id];
      if (!a) return;
      if (['likert_scale', 'open_text'].includes(q.type) && a.answerText?.trim()) done++;
      else if (['single_choice', 'multiple_choice'].includes(q.type) && a.selectedOptions?.length > 0) done++;
    });
    setProgress(Math.round((done / qs.length) * 100));
  }, [answers, survey]);

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSurvey(data);
      const saved = localStorage.getItem(`autosave_${id}_${user.id}`);
      if (saved) { setAnswers(JSON.parse(saved)); return; }
      const init = {};
      data.Questions.forEach(q => { init[q.id] = { answerText: '', selectedOptions: [] }; });
      setAnswers(init);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const save = (updated) => {
    setAnswers(updated);
    localStorage.setItem(`autosave_${id}_${user.id}`, JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    setError('');
    const missing = [];
    survey.Questions.forEach(q => {
      if (!q.required) return;
      const a = answers[q.id];
      const blank = !a ||
        (['likert_scale', 'open_text'].includes(q.type) && !a.answerText?.trim()) ||
        (['single_choice', 'multiple_choice'].includes(q.type) && !a.selectedOptions?.length);
      if (blank) missing.push(q.order + 1);
    });
    if (missing.length) { setError(`Vui lòng trả lời câu hỏi bắt buộc: ${missing.join(', ')}`); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (!confirm('Bạn có chắc muốn nộp khảo sát? Sau khi nộp không thể thay đổi.')) return;
    setSubmitting(true);
    try {
      const payload = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId), ...answers[qId],
      }));
      const res = await fetch(`${API_URL}/surveys/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.removeItem(`autosave_${id}_${user.id}`);
      alert('Nộp khảo sát thành công! Cảm ơn ý kiến của bạn.');
      navigate('/dashboard');
    } catch (e) { setError(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9FAFD' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6E9AE0', borderTopColor: 'transparent' }} />
        <p className="text-sm font-medium" style={{ color: '#6E9AE0' }}>Đang tải biểu mẫu khảo sát...</p>
      </div>
    </div>
  );

  if (error && !survey) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F9FAFD' }}>
      <div className="p-8 rounded-3xl text-center shadow-sm max-w-sm border" style={{ background: '#fff', borderColor: '#D2DBEA' }}>
        <AlertTriangle size={40} className="mx-auto mb-4" style={{ color: '#dc2626' }} />
        <p className="font-bold mb-4" style={{ color: '#2d4771' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 text-white font-bold rounded-2xl" style={{ background: '#6E9AE0' }}>Quay về</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFD' }}>

      {/* Navbar with progress */}
      <nav className="sticky top-0 z-30 shadow-sm" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Điền phiếu trực tuyến</p>
              <h2 className="text-sm font-extrabold text-white leading-tight line-clamp-1">{survey.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-white/25">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: '#FBECAC' }} />
            </div>
            <span className="text-sm font-black text-white">{progress}%</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-6">

        {/* Survey description */}
        <div className="p-5 rounded-2xl border" style={{ background: '#EEF4FD', borderColor: 'rgba(110,154,224,0.3)' }}>
          <div className="flex items-center gap-2 mb-1 text-sm font-bold" style={{ color: '#6E9AE0' }}>
            <Info size={16} />Mô tả & Hướng dẫn
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#2d4771' }}>{survey.description || 'Không có mô tả thêm.'}</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl border flex items-center gap-2 text-sm font-medium" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>
            <AlertTriangle size={18} />{error}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-5">
          {survey.Questions.map((q, idx) => {
            const a = answers[q.id] || { answerText: '', selectedOptions: [] };
            const answered =
              (['likert_scale', 'open_text'].includes(q.type) && a.answerText?.trim()) ||
              (['single_choice', 'multiple_choice'].includes(q.type) && a.selectedOptions?.length > 0);

            return (
              <div key={q.id} className="rounded-2xl p-6 border shadow-sm" style={{
                background: '#fff',
                borderColor: answered ? '#6E9AE0' : '#D2DBEA',
                borderLeftWidth: '4px',
                borderLeftColor: answered ? '#6E9AE0' : '#D2DBEA',
              }}>
                <div className="flex items-start gap-2 mb-5">
                  <span className="text-sm font-extrabold mt-0.5" style={{ color: '#A0AEC0' }}>Câu {idx + 1}.</span>
                  <h3 className="text-base font-extrabold leading-snug flex-1" style={{ color: '#2d4771' }}>
                    {q.text}{q.required && <span style={{ color: '#dc2626' }}> *</span>}
                  </h3>
                </div>

                {/* ─ LIKERT ─ */}
                {q.type === 'likert_scale' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                      {[1, 2, 3, 4, 5].map(val => {
                        const sel = a.answerText === String(val);
                        return (
                          <button key={val}
                            onClick={() => save({ ...answers, [q.id]: { ...a, answerText: String(val) } })}
                            className="w-12 h-12 rounded-full border-2 font-black text-sm transition-all"
                            style={{
                              background: sel ? LIKERT_COLORS[val] : '#F9FAFD',
                              borderColor: sel ? LIKERT_COLORS[val] : '#D2DBEA',
                              color: sel ? '#fff' : '#2d4771',
                              transform: sel ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >{val}</button>
                        );
                      })}
                    </div>
                    {a.answerText && (
                      <span className="text-xs font-bold px-3 py-1 rounded-xl inline-block" style={{ background: '#FBECAC', color: '#92600A' }}>
                        {a.answerText} — {LIKERT_LABELS[a.answerText]}
                      </span>
                    )}
                  </div>
                )}

                {/* ─ SINGLE CHOICE ─ */}
                {q.type === 'single_choice' && (
                  <div className="grid gap-2.5 max-w-xl">
                    {q.options.map(opt => {
                      const sel = a.selectedOptions?.includes(opt.id);
                      return (
                        <div key={opt.id} onClick={() => save({ ...answers, [q.id]: { ...a, selectedOptions: [opt.id] } })}
                          className="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all"
                          style={{ background: sel ? '#EEF4FD' : '#F9FAFD', borderColor: sel ? '#6E9AE0' : '#D2DBEA' }}
                        >
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: sel ? '#6E9AE0' : '#D2DBEA', background: sel ? '#6E9AE0' : '#fff' }}>
                            {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: sel ? '#2d4771' : '#487bc9' }}>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─ MULTIPLE CHOICE ─ */}
                {q.type === 'multiple_choice' && (
                  <div className="grid gap-2.5 max-w-xl">
                    {q.options.map(opt => {
                      const sel = a.selectedOptions?.includes(opt.id);
                      const toggle = () => {
                        const cur = a.selectedOptions || [];
                        const next = cur.includes(opt.id) ? cur.filter(x => x !== opt.id) : [...cur, opt.id];
                        save({ ...answers, [q.id]: { ...a, selectedOptions: next } });
                      };
                      return (
                        <div key={opt.id} onClick={toggle}
                          className="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all"
                          style={{ background: sel ? '#EEF4FD' : '#F9FAFD', borderColor: sel ? '#6E9AE0' : '#D2DBEA' }}
                        >
                          <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: sel ? '#6E9AE0' : '#D2DBEA', background: sel ? '#6E9AE0' : '#fff' }}>
                            {sel && <div className="w-2.5 h-2.5 rounded-sm bg-white" />}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: sel ? '#2d4771' : '#487bc9' }}>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─ OPEN TEXT ─ */}
                {q.type === 'open_text' && (
                  <div className="max-w-xl relative">
                    <textarea
                      rows={4}
                      placeholder="Nhập ý kiến đóng góp chi tiết của bạn..."
                      value={a.answerText}
                      onChange={e => save({ ...answers, [q.id]: { ...a, answerText: e.target.value } })}
                      className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none resize-none"
                      style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                      onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                      onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                    />
                    <span className="absolute bottom-3 right-3 text-xs" style={{ color: '#A0AEC0' }}>{a.answerText?.length || 0} ký tự</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button onClick={() => navigate('/dashboard')} className="px-5 py-3 border rounded-2xl text-sm font-bold transition-all flex items-center gap-2" style={{ background: '#fff', borderColor: '#D2DBEA', color: '#487bc9' }}>
            <Save size={16} />Lưu nháp & thoát
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={16} />Nộp phiếu khảo sát</>}
          </button>
        </div>
      </main>
    </div>
  );
}

export default SurveyTaking;
