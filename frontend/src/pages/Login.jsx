import React, { useState, useEffect } from 'react';
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
  
  // Real Google Sign-In states
  const [authGoogleLoading, setAuthGoogleLoading] = useState(false);
  const [showGoogleInputModal, setShowGoogleInputModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  
  // Quick demo accounts modal
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  useEffect(() => {
    // Parse Google OAuth hash when redirected back
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        handleGoogleCallback(accessToken);
      }
    }
  }, []);

  const handleGoogleCallback = async (accessToken) => {
    setAuthGoogleLoading(true);
    setError('');
    try {
      // 1. Call Google Userinfo API
      const resUserInfo = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!resUserInfo.ok) throw new Error('Không thể lấy thông tin tài khoản từ Google.');
      const googleUser = await resUserInfo.json();
      
      if (!googleUser.email || !googleUser.name) {
        throw new Error('Tài khoản Google thiếu email hoặc họ tên.');
      }

      // 2. Authenticate/Register via backend
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleUser.email, name: googleUser.name, roleName: 'Student' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Clear the url hash
      window.location.hash = '';

      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthGoogleLoading(false);
    }
  };

  const triggerGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your-google-client-id') {
      // If VITE_GOOGLE_CLIENT_ID is not configured in .env, display the real input mock chooser
      setShowGoogleInputModal(true);
    } else {
      // Redirect to Google's official browser OAuth screen
      const redirectUri = `${window.location.origin}/login`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile%20openid`;
      window.location.href = googleAuthUrl;
    }
  };

  const handleGoogleMockSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmailInput || !googleNameInput) return;
    setAuthGoogleLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleEmailInput, name: googleNameInput, roleName: 'Student' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowGoogleInputModal(false);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthGoogleLoading(false);
    }
  };

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

  const handleDemoLogin = async (account) => {
    setDemoLoading(account.email);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, name: account.name, roleName: account.role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowDemoAccounts(false);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Video background - Sắc nét 100% không làm mờ/phủ màu đè lên */}
      <video autoPlay loop muted playsInline
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        src={LOGIN_VIDEO}
      />

      {/* Floating Home Button */}
      <Link to="/" style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)', padding: '10px 18px', borderRadius: 12, backdropFilter: 'blur(8px)', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
      >
        ← Quay lại Trang chủ
      </Link>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 420 }}>
        <div style={{ background: 'rgba(255,255,255,0.98)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 24px 64px rgba(0,0,0,0.45)', border: '1px solid rgba(210,219,234,0.8)' }}>

          {/* Logo & title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(110,154,224,0.4)' }}>
              <span style={{ fontSize: 28 }}>🎓</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0d1c2f', marginBottom: 4 }}>Chào mừng trở lại</h1>
            <p style={{ color: '#718096', fontSize: 14 }}>Đăng nhập để tham gia khảo sát</p>
          </div>

          {/* Loading Google verification */}
          {authGoogleLoading && (
            <div style={{ background: '#EEF4FD', border: '1px solid #6E9AE0', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#2d4771', fontSize: 13, fontWeight: 600 }}>
              <Loader2 size={16} className="animate-spin" style={{ color: '#6E9AE0' }} />
              Đang xác minh tài khoản Google...
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 13, fontWeight: 500 }}>
              <AlertCircle size={16} color="#ef4444" /> {error}
            </div>
          )}

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

            <div style={{ marginBottom: 16 }}>
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

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.85 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)', marginBottom: 16 }}>
              {loading ? <><Loader2 size={17} className="animate-spin" />Đang đăng nhập...</> : 'Đăng nhập →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#718096', marginBottom: 20 }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#6E9AE0', fontWeight: 700, textDecoration: 'none' }}>Đăng ký ngay</Link>
          </p>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#D2DBEA' }} />
            <span style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 700, letterSpacing: 0.5 }}>HOẶC SỬ DỤNG</span>
            <div style={{ flex: 1, height: 1, background: '#D2DBEA' }} />
          </div>

          {/* Google Button - MOVED TO THE BOTTOM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={triggerGoogleOAuth}
              disabled={authGoogleLoading}
              style={{ width: '100%', padding: '11px 16px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#2d4771', transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập bằng tài khoản Google thực
            </button>

            <button
              onClick={() => { setShowDemoAccounts(true); setError(''); }}
              style={{ width: '100%', padding: '9px 16px', borderRadius: 12, border: '1px dashed #6E9AE0', background: '#EEF4FD', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#4a6fa5' }}
            >
              🔑 Chọn tài khoản hệ thống (Demo)
            </button>
          </div>

        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.7)', fontSize: 13, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          © 2026 Academic Synergy
        </p>
      </div>

      {/* Google Account Real Chooser Modal (Fallback simulation) */}
      {showGoogleInputModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowGoogleInputModal(false)}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', border: '1px solid #D2DBEA', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0d1c2f', margin: '0 0 4px' }}>Đăng nhập bằng tài khoản Google thực</h2>
              <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.5 }}>Lựa chọn hoặc nhập email Google thực của bạn để kết nối</p>
            </div>

            <form onSubmit={handleGoogleMockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2d4771', marginBottom: 6 }}>Email Google *</label>
                <input
                  type="email" required placeholder="example@gmail.com"
                  value={googleEmailInput} onChange={e => setGoogleEmailInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D2DBEA', fontSize: 14, outline: 'none', background: '#F9FAFD', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2d4771', marginBottom: 6 }}>Họ và tên Google *</label>
                <input
                  type="text" required placeholder="Nguyễn Văn A"
                  value={googleNameInput} onChange={e => setGoogleNameInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D2DBEA', fontSize: 14, outline: 'none', background: '#F9FAFD', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ background: '#FFF8E6', border: '1px solid #FBECAC', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                💡 <strong>Gợi ý:</strong> Bạn có thể cấu hình biến môi trường <code>VITE_GOOGLE_CLIENT_ID</code> trong file <code>frontend/.env</code> và khởi chạy lại để tự động tích hợp bảng chọn tài khoản Google OAuth 2.0 đồng bộ của trình duyệt.
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowGoogleInputModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#718096' }}>
                  Hủy bỏ
                </button>
                <button type="submit" disabled={authGoogleLoading}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {authGoogleLoading ? 'Đang kết nối...' : 'Đồng ý kết nối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Demo Accounts Modal */}
      {showDemoAccounts && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowDemoAccounts(false)}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d1c2f', marginBottom: 4 }}>Chọn tài khoản Google hệ thống</h2>
                <p style={{ fontSize: 13, color: '#718096' }}>Chọn vai trò bạn muốn đăng nhập nhanh để trải nghiệm</p>
              </div>
              <button onClick={() => setShowDemoAccounts(false)} style={{ background: '#F9FAFD', border: '1px solid #D2DBEA', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.email}
                  onClick={() => handleDemoLogin(acc)}
                  disabled={demoLoading === acc.email}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: demoLoading === acc.email ? '#F9FAFD' : '#fff', display: 'flex', alignItems: 'center', gap: 12, cursor: demoLoading === acc.email ? 'wait' : 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                  onMouseOver={e => { if (!demoLoading) { e.currentTarget.style.borderColor = acc.color; e.currentTarget.style.background = `${acc.color}10`; } }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#D2DBEA'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${acc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{acc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#2d4771', marginBottom: 2 }}>{acc.name}</p>
                    <p style={{ fontSize: 12, color: '#718096' }}>{acc.email} · <span style={{ color: acc.color, fontWeight: 600 }}>{ROLE_LABELS[acc.role]}</span></p>
                  </div>
                  {demoLoading === acc.email && <Loader2 size={16} color={acc.color} className="animate-spin" style={{ flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
