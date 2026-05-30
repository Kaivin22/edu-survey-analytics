import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, BarChart3, Users, HelpCircle, CheckSquare, MessageSquareCode, Award } from 'lucide-react';

function SurveyStats({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/surveys/${id}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi tải thống kê khảo sát.');
      }
      setStatsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const targetLabels = {
    Student: 'Sinh viên',
    Lecturer: 'Giảng viên',
    Alumnus: 'Cựu sinh viên',
    Employer: 'Nhà tuyển dụng',
    All: 'Tất cả'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-slate-400 font-medium">Đang tính toán thống kê dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !statsData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md text-center space-y-4">
          <HelpCircle className="text-rose-500 w-12 h-12 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Không thể tải báo cáo</h3>
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
      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-30 border-b border-slate-200/50 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs text-brand-600 font-bold uppercase tracking-wide">Thống kê báo cáo</span>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight leading-none mt-0.5 max-w-[200px] sm:max-w-md md:max-w-lg line-clamp-1">
              {statsData.surveyTitle}
            </h2>
          </div>
        </div>

        <a
          href={`${API_URL}/reports/${id}/excel`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all text-xs cursor-pointer"
        >
          <FileSpreadsheet size={16} />
          Xuất file báo cáo Excel
        </a>
      </nav>

      {/* Main Stats panel */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 space-y-8">
        
        {/* Info Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">Số lượt phản hồi</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{statsData.totalResponses} lượt</h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">Đối tượng khảo sát</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">{targetLabels[statsData.targetAudience]}</h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/60 relative overflow-hidden shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">Số lượng câu hỏi</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{statsData.stats.length} câu</h3>
            </div>
          </div>
        </div>

        {/* Survey description details */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 space-y-2">
          <h4 className="font-extrabold text-slate-800 text-sm">Mô tả khảo sát:</h4>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">{statsData.description || 'Không có mô tả chi tiết.'}</p>
        </div>

        {/* Statistics list */}
        <div className="space-y-8">
          {statsData.totalResponses === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-dashed border-slate-300">
              <Users className="text-slate-300 w-16 h-16 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-slate-600">Chưa có phản hồi nào</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                Cuộc khảo sát này hiện chưa nhận được ý kiến phản hồi nào từ các bên liên quan được chỉ định.
              </p>
            </div>
          ) : (
            statsData.stats.map((q, idx) => {
              return (
                <div 
                  key={q.id}
                  className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-sm space-y-6"
                >
                  <div className="flex items-start gap-2 border-b border-slate-100 pb-4">
                    <span className="font-extrabold text-slate-400 text-sm">Câu hỏi {idx + 1}.</span>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base leading-snug">{q.text}</h3>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200/50">
                        Loại: {
                          q.type === 'likert_scale' ? 'Thang điểm Likert (1-5)' :
                          q.type === 'single_choice' ? 'Trắc nghiệm (1 lựa chọn)' :
                          q.type === 'multiple_choice' ? 'Trắc nghiệm (nhiều lựa chọn)' :
                          'Tự luận (nhận xét mở)'
                        }
                      </span>
                    </div>
                  </div>

                  {/* 1. RENDER LIKERT SCALE STATS */}
                  {q.type === 'likert_scale' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      
                      {/* Big Average Circle */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center shadow-inner">
                        <span className="text-4xl font-black text-brand-600">{q.data.average}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-2">Điểm trung bình</span>
                        <span className="text-[9px] text-slate-400 font-bold mt-0.5">Trên thang 5.0</span>
                      </div>

                      {/* Bar graph distributions */}
                      <div className="md:col-span-3 space-y-2.5">
                        {[5, 4, 3, 2, 1].map(val => {
                          const count = q.data.distribution[val] || 0;
                          const percentage = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
                          
                          const barColors = 
                            val >= 4 ? 'bg-emerald-500' :
                            val === 3 ? 'bg-slate-400' :
                            'bg-rose-500';

                          return (
                            <div key={val} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                              <span className="w-14 text-slate-400 font-bold">Điểm {val}:</span>
                              <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/30">
                                <div 
                                  className={`${barColors} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-16 text-right text-slate-700 font-extrabold">{count} lượt ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                  {/* 2. RENDER CHOICE SELECTIONS STATS */}
                  {['single_choice', 'multiple_choice'].includes(q.type) && (
                    <div className="space-y-4">
                      {Object.keys(q.data.options || {}).map((optText, optIdx) => {
                        const count = q.data.options[optText] || 0;
                        const percentage = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;

                        return (
                          <div key={optIdx} className="space-y-1.5 text-xs font-semibold text-slate-700">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-700 max-w-[80%] leading-tight">{optText}</span>
                              <span className="text-brand-600 font-black">{count} lượt ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/30">
                              <div 
                                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. RENDER OPEN TEXT STATS */}
                  {q.type === 'open_text' && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {q.data.comments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Không có bình luận đóng góp nào.</p>
                      ) : (
                        q.data.comments.map((comment, cIdx) => (
                          <div key={cIdx} className="p-3 bg-slate-50/75 border border-slate-200/30 rounded-2xl text-xs font-medium text-slate-600 flex items-start gap-2">
                            <MessageSquareCode size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">{comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}

export default SurveyStats;
