import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Shield, Sparkles } from 'lucide-react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại.');
      }

      onLogin(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Dynamic blurred circles in the background */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-white/60">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 transform hover:rotate-12 transition-transform duration-300">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center">
            EDU SURVEY
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-1">
            <Sparkles size={14} className="text-amber-500 animate-spin" />
            Lấy ý kiến các bên liên quan trong giáo dục
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-medium shadow-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1" htmlFor="email">
              Địa chỉ Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="example@edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/75 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1" htmlFor="password">
              Mật khẩu truy cập
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/75 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn size={20} />
                Đăng nhập hệ thống
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Chưa có tài khoản khảo sát?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Demo info tool */}
        <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-700/80 space-y-1 font-medium">
          <p className="font-bold text-indigo-800">Tài khoản mẫu thử nghiệm:</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <p>🔑 Admin: <span className="font-bold">admin@edu.vn</span></p>
            <p>🔑 Manager: <span className="font-bold">manager@edu.vn</span></p>
            <p>🔑 Sinh viên: <span className="font-bold">student1@edu.vn</span></p>
            <p>🔑 DN / Nhà tuyển dụng: <span className="font-bold">employer1@edu.vn</span></p>
          </div>
          <p className="mt-1 pt-1 border-t border-indigo-100/50 text-center">Mật khẩu chung cho tất cả: <span className="font-bold text-indigo-800">12345678</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
