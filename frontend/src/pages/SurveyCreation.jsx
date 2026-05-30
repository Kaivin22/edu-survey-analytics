import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

function SurveyCreation({ user, isEdit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('Student');
  const [status, setStatus] = useState('Draft');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isEdit && id) {
      fetchSurveyForEdit();
    }
  }, [id, isEdit]);

  const fetchSurveyForEdit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/surveys/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi tải thông tin cuộc khảo sát.');
      }
      
      setTitle(data.title);
      setDescription(data.description || '');
      setTargetAudience(data.targetAudience);
      setStatus(data.status);
      setEndDate(data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '');
      
      // Load questions and choices
      const loadedQuestions = data.Questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        required: q.required,
        order: q.order,
        options: q.options ? q.options.map(o => ({ text: o.text, order: o.order })) : []
      }));
      setQuestions(loadedQuestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQ = {
      text: '',
      type: 'likert_scale',
      required: true,
      order: questions.length,
      options: [
        { text: 'Lựa chọn 1', order: 0 },
        { text: 'Lựa chọn 2', order: 1 }
      ]
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx) => {
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i }));
    setQuestions(updated);
  };

  const handleQuestionTextChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].text = value;
    setQuestions(updated);
  };

  const handleQuestionTypeChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].type = value;
    // Set default choices if changed to single/multiple choice
    if (['single_choice', 'multiple_choice'].includes(value) && updated[idx].options.length === 0) {
      updated[idx].options = [
        { text: 'Lựa chọn 1', order: 0 },
        { text: 'Lựa chọn 2', order: 1 }
      ];
    }
    setQuestions(updated);
  };

  const handleRequiredChange = (idx, value) => {
    const updated = [...questions];
    updated[idx].required = value;
    setQuestions(updated);
  };

  // Choice Options handling
  const handleAddOption = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push({
      text: `Lựa chọn ${updated[qIdx].options.length + 1}`,
      order: updated[qIdx].options.length
    });
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== optIdx).map((o, i) => ({ ...o, order: i }));
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = value;
    setQuestions(updated);
  };

  const handleSaveSurvey = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title) {
      setError('Tiêu đề cuộc khảo sát là bắt buộc.');
      return;
    }

    if (questions.length === 0) {
      setError('Cuộc khảo sát phải có ít nhất 1 câu hỏi.');
      return;
    }

    // Validate questions text and choices
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Nội dung câu hỏi ${i + 1} không được để trống.`);
        return;
      }

      if (['single_choice', 'multiple_choice'].includes(q.type)) {
        if (q.options.length < 2) {
          setError(`Câu hỏi trắc nghiệm số ${i + 1} phải có ít nhất 2 lựa chọn.`);
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].text.trim()) {
            setError(`Lựa chọn ${j + 1} của Câu hỏi ${i + 1} không được để trống.`);
            return;
          }
        }
      }
    }

    setLoading(true);
    try {
      const url = isEdit ? `${API_URL}/surveys/${id}` : `${API_URL}/surveys`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          targetAudience,
          status,
          startDate: new Date(),
          endDate: endDate ? new Date(endDate) : null,
          questions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi lưu cuộc khảo sát.');
      }

      setSuccess(isEdit ? 'Cập nhật cuộc khảo sát thành công!' : 'Tạo mới cuộc khảo sát thành công!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top navbar */}
      <nav className="glass-panel sticky top-0 z-30 border-b border-slate-200/50 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs text-brand-600 font-bold uppercase tracking-wide">Quản trị hệ thống</span>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight leading-none mt-0.5">
              {isEdit ? 'Chỉnh sửa Cuộc Khảo Sát' : 'Thiết lập Cuộc Khảo Sát Mới'}
            </h2>
          </div>
        </div>

        <button
          onClick={handleSaveSurvey}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all text-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Save size={14} />
              Lưu cuộc khảo sát
            </>
          )}
        </button>
      </nav>

      {/* Main container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-8">
        
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-medium shadow-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-medium shadow-sm flex items-center gap-2">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* Part 1: Survey Metadata Config */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-sm space-y-6">
          <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ChevronRight size={18} className="text-brand-500" />
            1. Thông tin chung cuộc khảo sát
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Tiêu đề khảo sát <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="Nhập tiêu đề cuộc khảo sát..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Mô tả chi tiết</label>
              <textarea
                placeholder="Nhập mô tả hoặc lời mở đầu phiếu khảo sát..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Đối tượng khảo sát</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-xs appearance-none cursor-pointer"
                >
                  <option value="Student">Sinh viên</option>
                  <option value="Lecturer">Giảng viên</option>
                  <option value="Alumnus">Cựu sinh viên</option>
                  <option value="Employer">Nhà tuyển dụng</option>
                  <option value="All">Tất cả đối tượng</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Trạng thái phát hành</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-xs appearance-none cursor-pointer"
                >
                  <option value="Draft">Bản nháp (Draft)</option>
                  <option value="Active">Kích hoạt hoạt động (Active)</option>
                  <option value="Closed">Đóng cuộc khảo sát (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1">Ngày hết hạn (Deadline)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-sm cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Questions Config Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <ChevronRight size={18} className="text-brand-500" />
              2. Thiết lập nội dung câu hỏi ({questions.length})
            </h3>
            
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus size={14} />
              Thêm câu hỏi mới
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-dashed border-slate-300">
              <p className="text-slate-400 text-xs font-semibold">Chưa có câu hỏi nào được thêm. Vui lòng click "Thêm câu hỏi mới" phía trên.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div 
                  key={qIdx}
                  className="glass-panel p-6 rounded-3xl border border-white/60 shadow-sm relative space-y-4"
                >
                  {/* Delete Question Button */}
                  <button
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 size={16} />
                  </button>

                  <span className="inline-block bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    Câu hỏi số {qIdx + 1}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* 1. Question Text */}
                    <div className="md:col-span-2">
                      <label className="block text-slate-700 text-xs font-bold mb-1">Nội dung câu hỏi <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Nhập câu hỏi khảo sát..."
                        value={q.text}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all font-medium text-xs"
                      />
                    </div>

                    {/* 2. Question Type */}
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">Loại câu hỏi</label>
                      <select
                        value={q.type}
                        onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[11px] appearance-none cursor-pointer"
                      >
                        <option value="likert_scale">Thang điểm Likert (1-5)</option>
                        <option value="single_choice">Trắc nghiệm (1 lựa chọn)</option>
                        <option value="multiple_choice">Trắc nghiệm (nhiều lựa chọn)</option>
                        <option value="open_text">Tự luận / Đóng góp ý kiến</option>
                      </select>
                    </div>

                    {/* 3. Required Checkbox */}
                    <div className="flex items-center mt-5 md:justify-center">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => handleRequiredChange(qIdx, e.target.checked)}
                          className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                        />
                        Bắt buộc trả lời
                      </label>
                    </div>
                  </div>

                  {/* 4. Choice Options config (Render only for single/multiple choice) */}
                  {['single_choice', 'multiple_choice'].includes(q.type) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Danh sách các lựa chọn trắc nghiệm:</span>
                        <button
                          onClick={() => handleAddOption(qIdx)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1"
                        >
                          <Plus size={10} /> Add Lựa chọn
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-200/50">
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Lựa chọn ${optIdx + 1}`}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none text-xs font-medium"
                            />
                            <button
                              onClick={() => handleRemoveOption(qIdx, optIdx)}
                              disabled={q.options.length <= 2}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg disabled:opacity-30 cursor-pointer"
                              title="Xóa lựa chọn này"
                            >
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
          )}
        </div>

        {/* Action Panel */}
        <div className="flex justify-end gap-4 border-t border-slate-200/50 pt-6">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-2xl text-xs cursor-pointer"
          >
            Hủy và quay lại
          </button>
          
          <button
            onClick={handleSaveSurvey}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all text-xs cursor-pointer disabled:opacity-50"
          >
            Lưu cuộc khảo sát
          </button>
        </div>

      </main>
    </div>
  );
}

export default SurveyCreation;
