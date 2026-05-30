import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertTriangle, CheckCircle, Info } from 'lucide-react';

function SurveyTaking({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({}); // Stores key-value: { questionId: { answerText: '', selectedOptions: [] } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSurveyData();
  }, [id]);

  useEffect(() => {
    if (survey) {
      calculateProgress();
    }
  }, [answers, survey]);

  const fetchSurveyData = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi tải cuộc khảo sát.');
      }
      setSurvey(data);

      // Load auto-save from localStorage if exists
      const saved = localStorage.getItem(`survey_autosave_${id}_${user.id}`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      } else {
        // Initialize blank answers
        const initial = {};
        data.Questions.forEach(q => {
          initial[q.id] = {
            answerText: '',
            selectedOptions: []
          };
        });
        setAnswers(initial);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = (newAnswers) => {
    setAnswers(newAnswers);
    localStorage.setItem(`survey_autosave_${id}_${user.id}`, JSON.stringify(newAnswers));
  };

  const calculateProgress = () => {
    if (!survey || !survey.Questions) return;
    const questions = survey.Questions;
    let completed = 0;
    
    questions.forEach(q => {
      const ans = answers[q.id];
      if (!ans) return;

      if (['likert_scale', 'open_text'].includes(q.type) && ans.answerText.trim() !== '') {
        completed++;
      } else if (['single_choice', 'multiple_choice'].includes(q.type) && ans.selectedOptions.length > 0) {
        completed++;
      }
    });

    setProgress(Math.round((completed / questions.length) * 100));
  };

  const handleLikertChange = (questionId, value) => {
    const newAns = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        answerText: String(value)
      }
    };
    handleAutoSave(newAns);
  };

  const handleTextChange = (questionId, text) => {
    const newAns = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        answerText: text
      }
    };
    handleAutoSave(newAns);
  };

  const handleSingleChoiceChange = (questionId, optionId) => {
    const newAns = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        selectedOptions: [optionId]
      }
    };
    handleAutoSave(newAns);
  };

  const handleMultipleChoiceChange = (questionId, optionId) => {
    const current = answers[questionId]?.selectedOptions || [];
    let updated;
    if (current.includes(optionId)) {
      updated = current.filter(id => id !== optionId);
    } else {
      updated = [...current, optionId];
    }

    const newAns = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        selectedOptions: updated
      }
    };
    handleAutoSave(newAns);
  };

  const handleSubmit = async () => {
    setError('');
    
    // Verify required questions
    const missing = [];
    survey.Questions.forEach(q => {
      if (!q.required) return;
      const ans = answers[q.id];
      const isBlank = !ans || 
        ((['likert_scale', 'open_text'].includes(q.type) && ans.answerText.trim() === '') ||
         (['single_choice', 'multiple_choice'].includes(q.type) && ans.selectedOptions.length === 0));
      
      if (isBlank) {
        missing.push(q.order + 1);
      }
    });

    if (missing.length > 0) {
      setError(`Vui lòng trả lời đầy đủ các câu hỏi bắt buộc trước khi gửi (Các câu: ${missing.join(', ')}).`);
      // Scroll to top to see error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn nộp câu trả lời? Sau khi nộp, bạn không thể thay đổi ý kiến.')) {
      return;
    }

    setSubmitting(true);
    try {
      // Format answers for API payload
      const payload = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId),
        answerText: answers[qId].answerText,
        selectedOptions: answers[qId].selectedOptions
      }));

      const res = await fetch(`${API_URL}/surveys/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: payload })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi gửi phiếu trả lời.');
      }

      // Success, remove autosave
      localStorage.removeItem(`survey_autosave_${id}_${user.id}`);
      alert('Nộp phiếu khảo sát thành công! Cảm ơn ý kiến của bạn.');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const likertLabels = {
    1: 'Rất không đồng ý',
    2: 'Không đồng ý',
    3: 'Bình thường / Tạm ổn',
    4: 'Đồng ý',
    5: 'Rất đồng ý'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-slate-400 font-medium">Đang tải biểu mẫu khảo sát...</p>
        </div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md text-center space-y-4">
          <AlertTriangle className="text-rose-500 w-12 h-12 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Không thể thực hiện</h3>
          <p className="text-slate-500 text-sm">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-2xl">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar with Progress */}
      <nav className="glass-panel sticky top-0 z-30 border-b border-slate-200/50 py-4 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-xs text-brand-600 font-bold uppercase tracking-wide">Điền phiếu trực tuyến</span>
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight leading-none mt-0.5 line-clamp-1">{survey.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-slate-600 w-8">{progress}%</span>
          </div>
        </div>
      </nav>

      {/* Main Survey Panel */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-8">
        
        {/* Info panel */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Info size={16} />
            <span>Mô tả & Hướng dẫn</span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{survey.description || 'Không có mô tả thêm cho cuộc khảo sát này.'}</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-medium shadow-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* Questions list */}
        <div className="space-y-6">
          {survey.Questions.map((q, idx) => {
            const ans = answers[q.id] || { answerText: '', selectedOptions: [] };

            return (
              <div 
                key={q.id} 
                className={`glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-sm transition-all duration-200 ${
                  q.required && ((['likert_scale', 'open_text'].includes(q.type) && ans.answerText === '') ||
                                 (['single_choice', 'multiple_choice'].includes(q.type) && ans.selectedOptions.length === 0))
                    ? 'border-l-4 border-l-brand-400' 
                    : 'border-l-4 border-l-emerald-400'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-extrabold text-slate-400 text-sm pt-0.5">Câu {idx + 1}.</span>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug">
                      {q.text}
                      {q.required && <span className="text-rose-500 ml-1" title="Bắt buộc">*</span>}
                    </h3>
                  </div>
                </div>

                {/* Render input by type */}
                <div className="mt-6 ml-6">
                  
                  {/* TYPE 1: LIKERT SCALE */}
                  {q.type === 'likert_scale' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-4 max-w-lg">
                        {[1, 2, 3, 4, 5].map(val => {
                          const isSelected = ans.answerText === String(val);
                          const bubbleBgColor = 
                            val === 1 ? 'hover:bg-red-500 hover:text-white border-red-200 text-red-600' :
                            val === 2 ? 'hover:bg-orange-500 hover:text-white border-orange-200 text-orange-600' :
                            val === 3 ? 'hover:bg-gray-500 hover:text-white border-gray-200 text-gray-600' :
                            val === 4 ? 'hover:bg-emerald-500 hover:text-white border-emerald-200 text-emerald-600' :
                            'hover:bg-emerald-600 hover:text-white border-emerald-300 text-emerald-800';

                          const selectedBgColor = 
                            val === 1 ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20' :
                            val === 2 ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' :
                            val === 3 ? 'bg-gray-500 text-white border-gray-500 shadow-md shadow-gray-500/20' :
                            val === 4 ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' :
                            'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20';

                          return (
                            <button
                              key={val}
                              onClick={() => handleLikertChange(q.id, val)}
                              className={`w-12 h-12 rounded-full border-2 font-black text-sm flex items-center justify-center transition-all cursor-pointer ${
                                isSelected ? selectedBgColor : `bg-white/70 ${bubbleBgColor}`
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Likert label feedback description */}
                      {ans.answerText && (
                        <p className="text-xs text-brand-600 font-bold bg-brand-50 inline-block px-3 py-1 rounded-lg border border-brand-100">
                          Mức độ: <span className="font-extrabold">{ans.answerText} - {likertLabels[ans.answerText]}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* TYPE 2: SINGLE CHOICE (RADIO) */}
                  {q.type === 'single_choice' && (
                    <div className="grid grid-cols-1 gap-3 max-w-xl">
                      {q.options.map(opt => {
                        const isSelected = ans.selectedOptions.includes(opt.id);
                        return (
                          <div 
                            key={opt.id}
                            onClick={() => handleSingleChoiceChange(q.id, opt.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected 
                                ? 'bg-brand-50/50 border-brand-500 text-brand-800 shadow-sm' 
                                : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-600'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300 bg-white'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                            <span className="font-bold text-sm leading-tight">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TYPE 3: MULTIPLE CHOICE (CHECKBOX) */}
                  {q.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 gap-3 max-w-xl">
                      {q.options.map(opt => {
                        const isSelected = ans.selectedOptions.includes(opt.id);
                        return (
                          <div 
                            key={opt.id}
                            onClick={() => handleMultipleChoiceChange(q.id, opt.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected 
                                ? 'bg-brand-50/50 border-brand-500 text-brand-800 shadow-sm' 
                                : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-600'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300 bg-white'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                            </div>
                            <span className="font-bold text-sm leading-tight">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TYPE 4: OPEN TEXT (TEXTAREA) */}
                  {q.type === 'open_text' && (
                    <div className="max-w-xl relative">
                      <textarea
                        value={ans.answerText}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="Nhập ý kiến đóng góp chi tiết của bạn tại đây..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
                      />
                      <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-bold">
                        {ans.answerText.length} ký tự
                      </span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="flex gap-4 justify-end pt-4">
          <button
            onClick={() => {
              alert('Đã lưu biểu mẫu nháp cục bộ!');
              navigate('/');
            }}
            className="px-5 py-3 border border-slate-200 hover:bg-slate-100 bg-white text-slate-600 font-bold rounded-2xl text-sm flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            Lưu nháp và thoát
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send size={16} />
                Nộp phiếu khảo sát
              </>
            )}
          </button>
        </div>

      </main>
    </div>
  );
}

export default SurveyTaking;
