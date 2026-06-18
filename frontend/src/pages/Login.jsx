import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ClipboardList } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Vui lòng điền đầy đủ email và mật khẩu.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại.');
      onLogin(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFD' }}>
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" style={{ background: 'radial-gradient(circle, #6E9AE0, transparent)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-15 translate-y-1/3 -translate-x-1/3" style={{ background: 'radial-gradient(circle, #FBECAC, transparent)' }} />

      <div className="w-full max-w-md rounded-3xl shadow-xl p-8 relative z-10 border" style={{ background: 'rgba(255,255,255,0.92)', borderColor: 'rgba(110,154,224,0.2)' }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
            <ClipboardList size={32} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-center" style={{ color: '#2d4771' }}>
            EDU SURVEY
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#6E9AE0' }}>
            Lấy ý kiến các bên liên quan trong giáo dục
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-2xl text-sm font-medium border" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 ml-1" style={{ color: '#2d4771' }}>Địa chỉ Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center" style={{ color: '#6E9AE0' }}>
                <Mail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="example@edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all"
                style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                onBlur={e => e.target.style.borderColor = '#D2DBEA'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 ml-1" style={{ color: '#2d4771' }}>Mật khẩu truy cập</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center" style={{ color: '#6E9AE0' }}>
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all"
                style={{ background: '#F9FAFD', borderColor: '#D2DBEA', color: '#2d4771' }}
                onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                onBlur={e => e.target.style.borderColor = '#D2DBEA'}
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="w-full py-3.5 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn size={20} />Đăng nhập hệ thống</>}
          </button>
        </form>

        <div className="mt-7 pt-6 text-center" style={{ borderTop: '1px solid #D2DBEA' }}>
          <p className="text-sm font-medium" style={{ color: '#487bc9' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold underline" style={{ color: '#2d4771' }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-5 p-4 rounded-2xl text-xs space-y-2" style={{ background: '#F9FAFD', border: '1px dashed #D2DBEA' }}>
          <p className="font-bold" style={{ color: '#2d4771' }}>Tài khoản mẫu thử nghiệm — mật khẩu: <span style={{ color: '#6E9AE0' }}>12345678</span></p>
          <div className="grid grid-cols-2 gap-1.5" style={{ color: '#487bc9' }}>
            <p>🔑 Admin: <b>admin@edu.vn</b></p>
            <p>🔑 Cán bộ: <b>manager@edu.vn</b></p>
            <p>🔑 Sinh viên: <b>student1@edu.vn</b></p>
            <p>🔑 Doanh nghiệp: <b>employer1@edu.vn</b></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
