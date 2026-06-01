import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOGIN_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_074327_a4d6275d-82d9-4c83-bfbe-f1fb2213c17c.mp4';

// Demo accounts for Google quick-login modal
const DEMO_ACCOUNTS = [
  { email: 'admin@edu.vn',     name: 'Nguyễn Quản Trị',    role: 'Admin',    avatar: '👑', color: '#ef4444' },
  { email: 'manager@edu.vn',   name: 'Trần Quản Lý',       role: 'Manager',  avatar: '📊', color: '#8b5cf6' },
  { email: 'student1@edu.vn',  name: 'Lê Văn Sinh Viên',   role: 'Student',  avatar: '🎓', color: '#6E9AE0' },
  { email: 'lecturer1@edu.vn', name: 'Phạm Thị Giảng Viên',role: 'Lecturer', avatar: '📚', color: '#22c55e' },
  { email: 'alumnus1@edu.vn',  name: 'Hoàng Cựu Sinh Viên',role: 'Alumnus',  avatar: '🏢', color: '#f59e0b' },
  { email: 'employer1@edu.vn', name: 'Ngô Nhà Tuyển Dụng', role: 'Employer', avatar: '💼', color: '#06b6d4' },
];

const ROLE_LABELS = { Admin:'Quản trị viên', Manager:'Cán bộ quản lý', Student:'Sinh viên', Lecturer:'Giảng viên', Alumnus:'Cựu sinh viên', Employer:'Nhà tuyển dụng' };

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showGoogle, setShowGoogle] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Vui lòng điền đầy đủ email và mật khẩu.');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (account) => {
    setGoogleLoading(account.email);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, name: account.name, roleName: account.role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowGoogle(false);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Video background */}
      <video autoPlay loop muted playsInline
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        src={LOGIN_VIDEO}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, rgba(0,43,110,0.78) 0%, rgba(110,154,224,0.60) 50%, rgba(0,67,174,0.75) 100%)', zIndex: 1 }} />

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 420 }}>
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>

          {/* Logo & title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(110,154,224,0.4)' }}>
              <span style={{ fontSize: 28 }}>🎓</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0d1c2f', marginBottom: 4 }}>Chào mừng trở lại</h1>
            <p style={{ color: '#718096', fontSize: 14 }}>Đăng nhập để tham gia khảo sát</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 13, fontWeight: 500 }}>
              <AlertCircle size={16} color="#ef4444" /> {error}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={() => { setShowGoogle(true); setError(''); }}
            style={{ width: '100%', padding: '11px 16px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#2d4771', marginBottom: 20, transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập với Google (Demo)
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#D2DBEA' }} />
            <span style={{ fontSize: 12, color: '#A0AEC0', fontWeight: 600 }}>HOẶC ĐĂNG NHẬP BẰNG EMAIL</span>
            <div style={{ flex: 1, height: 1, background: '#D2DBEA' }} />
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2d4771', marginBottom: 7 }}>Địa chỉ email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} color="#6E9AE0" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email" required placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '11px 13px 11px 42px', borderRadius: 11, border: '1.5px solid #D2DBEA', background: '#F9FAFD', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                  onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                />
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#2d4771' }}>Mật khẩu</label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: '#6E9AE0', textDecoration: 'none', fontWeight: 600 }}>
                  Quên mật khẩu?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={17} color="#6E9AE0" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPass ? 'text' : 'password'} required placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '11px 42px 11px 42px', borderRadius: 11, border: '1.5px solid #D2DBEA', background: '#F9FAFD', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                  onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#A0AEC0' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div style={{ background: '#EEF4FD', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#4a6fa5', lineHeight: 1.5 }}>
              <strong>Demo:</strong> Admin: <code>admin@edu.vn</code> / <code>12345678</code>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.85 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)' }}>
              {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />Đang đăng nhập...</> : 'Đăng nhập →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#718096' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#6E9AE0', fontWeight: 700, textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          © 2026 Academic Synergy
        </p>
      </div>

      {/* Google Demo Account Modal */}
      {showGoogle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowGoogle(false)}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d1c2f', marginBottom: 4 }}>Chọn tài khoản Google</h2>
                <p style={{ fontSize: 13, color: '#718096' }}>Chọn vai trò bạn muốn đăng nhập trải nghiệm</p>
              </div>
              <button onClick={() => setShowGoogle(false)} style={{ background: '#F9FAFD', border: '1px solid #D2DBEA', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.email}
                  onClick={() => handleGoogleLogin(acc)}
                  disabled={googleLoading === acc.email}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: googleLoading === acc.email ? '#F9FAFD' : '#fff', display: 'flex', alignItems: 'center', gap: 12, cursor: googleLoading === acc.email ? 'wait' : 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                  onMouseOver={e => { if (!googleLoading) { e.currentTarget.style.borderColor = acc.color; e.currentTarget.style.background = `${acc.color}10`; } }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#D2DBEA'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${acc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{acc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#2d4771', marginBottom: 2 }}>{acc.name}</p>
                    <p style={{ fontSize: 12, color: '#718096' }}>{acc.email} · <span style={{ color: acc.color, fontWeight: 600 }}>{ROLE_LABELS[acc.role]}</span></p>
                  </div>
                  {googleLoading === acc.email && <Loader2 size={16} color={acc.color} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
