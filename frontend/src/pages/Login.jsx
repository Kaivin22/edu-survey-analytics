import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Award, Briefcase, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOGIN_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_074327_a4d6275d-82d9-4c83-bfbe-f1fb2213c17c.mp4';

// School and Department Configurations
const SCHOOLS = ["Kiến trúc Đà Nẵng (DAU)", "Việt Hàn (VKU)"];

const DEPARTMENTS = {
  "Kiến trúc Đà Nẵng (DAU)": [
    "Công nghệ thông tin",
    "Kiến trúc",
    "Xây dựng",
    "Kinh tế"
  ],
  "Việt Hàn (VKU)": [
    "Khoa học Máy tính",
    "Kỹ thuật Máy tính",
    "Kinh tế số & Thương mại điện tử"
  ]
};

const CLASSES = {
  "Công nghệ thông tin": ["22CT1", "22CT2", "22CT3", "22CT4"],
  "Kiến trúc": ["22KT1", "22KT2"],
  "Xây dựng": ["22XD1"],
  "Kinh tế": ["22KTQD1"],
  "Khoa học Máy tính": ["22IT1", "22IT2"],
  "Kỹ thuật Máy tính": ["22CE1"],
  "Kinh tế số & Thương mại điện tử": ["22EC1"]
};

const DEMO_ACCOUNTS = [
  { email: 'admin@edu.vn',     name: 'Nguyễn Quản Trị',    role: 'Admin',    avatar: '👑', color: '#ef4444' },
  { email: 'manager@edu.vn',   name: 'Trần Cán Bộ',       role: 'Manager',  avatar: '📊', color: '#8b5cf6' },
  { email: 'student1@edu.vn',  name: 'Trần Kim Liên',      role: 'Student',  avatar: '🎓', color: '#6E9AE0' },
  { email: 'lecturer1@edu.vn', name: 'Phạm Giảng Viên',    role: 'Lecturer', avatar: '📚', color: '#22c55e' },
  { email: 'alumnus1@edu.vn',  name: 'Hoàng Cựu SV',       role: 'Alumnus',  avatar: '🏢', color: '#f59e0b' },
  { email: 'employer1@edu.vn', name: 'FPT Software (Đại diện)', role: 'Employer', avatar: '💼', color: '#06b6d4' },
];

const ROLE_LABELS = { Admin:'Quản trị viên', Manager:'Cán bộ quản lý', Student:'Sinh viên', Lecturer:'Giảng viên', Alumnus:'Cựu sinh viên', Employer:'Nhà tuyển dụng' };

export default function Login({ onLogin, initialTab = 'login' }) {
  const navigate = useNavigate();
  
  // Tab states: 'login' | 'register' | 'google-register'
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Normal Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register Form states
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    password: '',
    roleId: '3', // Default to Student
    school: SCHOOLS[0],
    department: DEPARTMENTS[SCHOOLS[0]][0],
    class: CLASSES[DEPARTMENTS[SCHOOLS[0]][0]] ? CLASSES[DEPARTMENTS[SCHOOLS[0]][0]][0] : '',
    code: ''
  });

  // Google OAuth states
  const [authGoogleLoading, setAuthGoogleLoading] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null); // stores { email, name } for registration
  const [showGoogleRegisterForm, setShowGoogleRegisterForm] = useState(false);

  // Demo accounts modal
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  // Sync tab state changes with the URL path without page reloading
  useEffect(() => {
    setActiveTab(initialTab);
    setError('');
    setSuccess('');
  }, [initialTab]);

  useEffect(() => {
    // Check if redirected from Google OAuth (has access_token in hash)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        handleGoogleCallback(accessToken);
      }
    }
  }, []);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    window.history.replaceState(null, '', tab === 'login' ? '/login' : '/register');
  };

  // Dynamic values helper based on selected school/department/role
  const handleSchoolChange = (schoolName, isGoogle = false) => {
    const depts = DEPARTMENTS[schoolName] || [];
    const defaultDept = depts[0] || '';
    const classes = CLASSES[defaultDept] || [];
    const defaultClass = classes[0] || '';

    if (isGoogle) {
      setRegForm(prev => ({
        ...prev,
        school: schoolName,
        department: defaultDept,
        class: defaultClass
      }));
    } else {
      setRegForm(prev => ({
        ...prev,
        school: schoolName,
        department: defaultDept,
        class: defaultClass
      }));
    }
  };

  const handleDeptChange = (deptName, isGoogle = false) => {
    const classes = CLASSES[deptName] || [];
    const defaultClass = classes[0] || '';

    setRegForm(prev => ({
      ...prev,
      department: deptName,
      class: defaultClass
    }));
  };

  const getCodeInfo = (roleId) => {
    return {
      '3': { label: 'Mã số Sinh viên (MSSV) *', placeholder: 'Ví dụ: 2251220153' },
      '4': { label: 'Mã số Giảng viên (MSGV) *', placeholder: 'Ví dụ: GV202201' },
      '5': { label: 'Mã số Cựu Sinh viên *', placeholder: 'Ví dụ: 20CT1' },
      '6': { label: 'Mã số thuế / Mã Doanh nghiệp *', placeholder: 'Ví dụ: TAX_FPT_01' },
      '2': { label: 'Mã cán bộ quản lý *', placeholder: 'Ví dụ: CBQL001' }
    }[roleId] || { label: 'Mã nhận diện *', placeholder: '' };
  };

  // Google OAuth Implicit Flow
  const triggerGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/login`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile%20openid`;
    window.location.href = googleAuthUrl;
  };

  const handleGoogleCallback = async (accessToken) => {
    setAuthGoogleLoading(true);
    setError('');
    try {
      // 1. Get user info from Google
      const resUserInfo = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!resUserInfo.ok) throw new Error('Không thể lấy thông tin tài khoản từ Google.');
      const googleUser = await resUserInfo.json();
      
      if (!googleUser.email || !googleUser.name) {
        throw new Error('Tài khoản Google thiếu thông tin email hoặc họ tên.');
      }

      // 2. Query Google Sign-in endpoint in backend
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleUser.email, name: googleUser.name })
      });
      const data = await res.json();
      
      // Clean up URL hash
      window.location.hash = '';

      if (!res.ok) throw new Error(data.message);

      if (data.isNewUser) {
        // Switch tab to google profile completion
        setGoogleUserData({ email: data.email, name: data.name });
        setRegForm(prev => ({
          ...prev,
          fullName: data.name,
          email: data.email,
          roleId: '3', // reset
          code: ''
        }));
        setActiveTab('google-register');
      } else {
        // Success direct login
        onLogin(data.user, data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthGoogleLoading(false);
    }
  };

  // Google Complete Profile Registration
  const handleGoogleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regForm.code.trim()) {
      setError('Vui lòng nhập mã nhận diện.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: googleUserData.email,
        name: regForm.fullName,
        roleId: parseInt(regForm.roleId),
        school: regForm.school,
        department: regForm.department,
        class: regForm.roleId === '3' ? regForm.class : null,
        code: regForm.code.trim()
      };

      const res = await fetch(`${API_URL}/auth/google-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('Đăng ký tài khoản Google thành công!');
      setTimeout(() => {
        onLogin(data.user, data.token);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Normal traditional login
  const handleLoginSubmit = async (e) => {
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

  // Normal traditional registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regForm.fullName || !regForm.email || !regForm.password || !regForm.code) {
      setError('Vui lòng điền đầy đủ tất cả thông tin bắt buộc.');
      return;
    }
    if (regForm.password.length < 8) {
      setError('Mật khẩu phải từ 8 ký tự trở lên.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: regForm.fullName.trim(),
        email: regForm.email.trim(),
        password: regForm.password,
        roleId: parseInt(regForm.roleId),
        school: regForm.school,
        department: regForm.department,
        class: regForm.roleId === '3' ? regForm.class : null,
        code: regForm.code.trim()
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('Đăng ký thành công! Đang chuyển sang Đăng nhập...');
      setTimeout(() => {
        handleTabSwitch('login');
        setEmail(regForm.email);
        setPassword('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts login helper
  const handleDemoLogin = async (account) => {
    setDemoLoading(account.email);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, name: account.name })
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

  const inputStyle = { width: '100%', padding: '11px 13px 11px 13px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#F9FAFD', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: '#2d4771', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Background video */}
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

      {/* Unified Authentication Card */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: activeTab === 'login' ? 420 : 540 }}>
        <div style={{ background: 'rgba(255,255,255,0.98)', borderRadius: 28, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.45)', border: '1px solid rgba(210,219,234,0.8)' }}>
          
          {activeTab !== 'google-register' && (
            /* Toggle Tab Buttons */
            <div style={{ display: 'flex', background: '#EEF4FD', borderRadius: 16, padding: 6, marginBottom: 28 }}>
              <button
                onClick={() => handleTabSwitch('login')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: activeTab === 'login' ? '#fff' : 'transparent', color: activeTab === 'login' ? '#2d4771' : '#718096', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'login' ? '0 4px 12px rgba(110,154,224,0.15)' : 'none' }}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => handleTabSwitch('register')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: activeTab === 'register' ? '#fff' : 'transparent', color: activeTab === 'register' ? '#2d4771' : '#718096', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'register' ? '0 4px 12px rgba(110,154,224,0.15)' : 'none' }}
              >
                Đăng ký
              </button>
            </div>
          )}

          {/* Heading Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(110,154,224,0.4)' }}>
              <span style={{ fontSize: 26 }}>🎓</span>
            </div>
            {activeTab === 'login' && (
              <>
                <h1 style={{ fontSize: 21, fontWeight: 855, color: '#0d1c2f', margin: '0 0 4px' }}>Chào mừng trở lại</h1>
                <p style={{ color: '#718096', fontSize: 13.5 }}>Đăng nhập để tham gia đóng góp ý kiến chất lượng</p>
              </>
            )}
            {activeTab === 'register' && (
              <>
                <h1 style={{ fontSize: 21, fontWeight: 855, color: '#0d1c2f', margin: '0 0 4px' }}>Tạo tài khoản mới</h1>
                <p style={{ color: '#718096', fontSize: 13.5 }}>Đăng ký ngay để bắt đầu tham gia các cuộc khảo sát</p>
              </>
            )}
            {activeTab === 'google-register' && (
              <>
                <h1 style={{ fontSize: 21, fontWeight: 855, color: '#0d1c2f', margin: '0 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Sparkles size={18} color="#6E9AE0" /> Hoàn tất hồ sơ Google
                </h1>
                <p style={{ color: '#718096', fontSize: 13.5 }}>Nhập thông tin học tập/giảng dạy của tài khoản Google của bạn</p>
              </>
            )}
          </div>

          {/* Errors and Success Alerts */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 13, fontWeight: 500 }}>
              <AlertCircle size={16} color="#ef4444" /> {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontSize: 13, fontWeight: 500 }}>
              <Sparkles size={16} color="#16a34a" /> {success}
            </div>
          )}

          {authGoogleLoading && (
            <div style={{ background: '#EEF4FD', border: '1px solid #6E9AE0', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#2d4771', fontSize: 13, fontWeight: 600 }}>
              <Loader2 size={16} className="animate-spin" style={{ color: '#6E9AE0' }} />
              Đang kết nối tài khoản Google...
            </div>
          )}

          {/* ────────── TAB 1: LOGIN FORM ────────── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Địa chỉ email</label>
                <input
                  type="email" required placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                  onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={labelStyle}>Mật khẩu</label>
                  <Link to="/forgot-password" style={{ fontSize: 13, color: '#6E9AE0', textDecoration: 'none', fontWeight: 600 }}>
                    Quên mật khẩu?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} required placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                    onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#A0AEC0' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.85 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)', marginBottom: 20 }}>
                {loading ? <><Loader2 size={16} className="animate-spin" />Đang đăng nhập...</> : 'Đăng nhập →'}
              </button>
            </form>
          )}

          {/* ────────── TAB 2: REGISTER FORM ────────── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Họ và Tên *</label>
                  <input
                    type="text" required placeholder="Nguyễn Văn A" value={regForm.fullName}
                    onChange={e => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email" required placeholder="example@edu.vn" value={regForm.email}
                    onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Vai trò *</label>
                  <select
                    value={regForm.roleId}
                    onChange={e => setRegForm(prev => ({ ...prev, roleId: e.target.value }))}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    <option value="3">Sinh viên</option>
                    <option value="4">Giảng viên</option>
                    <option value="5">Cựu sinh viên</option>
                    <option value="6">Nhà tuyển dụng</option>
                    <option value="2">Cán bộ quản lý</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{getCodeInfo(regForm.roleId).label}</label>
                  <input
                    type="text" required placeholder={getCodeInfo(regForm.roleId).placeholder} value={regForm.code}
                    onChange={e => setRegForm(prev => ({ ...prev, code: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* School selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Trường đại học *</label>
                  <select
                    value={regForm.school}
                    onChange={e => handleSchoolChange(e.target.value)}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    {SCHOOLS.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Khoa / Phòng ban *</label>
                  <select
                    value={regForm.department}
                    onChange={e => handleDeptChange(e.target.value)}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    {(DEPARTMENTS[regForm.school] || []).map(dp => <option key={dp} value={dp}>{dp}</option>)}
                  </select>
                </div>
              </div>

              {/* Class selection (only if Student) */}
              {regForm.roleId === '3' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Lớp hành chính *</label>
                  <select
                    value={regForm.class}
                    onChange={e => setRegForm(prev => ({ ...prev, class: e.target.value }))}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    {(CLASSES[regForm.department] || []).map(cl => <option key={cl} value={cl}>{cl}</option>)}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Mật khẩu truy cập *</label>
                <input
                  type="password" required placeholder="Tối thiểu 8 ký tự" value={regForm.password}
                  onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.85 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)', marginBottom: 10 }}>
                {loading ? <><Loader2 size={16} className="animate-spin" />Đang tạo tài khoản...</> : 'Đăng ký tài khoản →'}
              </button>
            </form>
          )}

          {/* ────────── TAB 3: GOOGLE REGISTER FORM ────────── */}
          {activeTab === 'google-register' && (
            <form onSubmit={handleGoogleRegisterSubmit}>
              <div style={{ background: '#EEF4FD', border: '1px solid #D2DBEA', borderRadius: 16, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#2d4771', lineHeight: 1.5 }}>
                Tài khoản Google: <strong>{googleUserData?.email}</strong><br />
                Vui lòng điền nốt thông tin dưới đây để kích hoạt tài khoản của bạn.
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Họ và Tên *</label>
                <input
                  type="text" required placeholder="Họ tên" value={regForm.fullName}
                  onChange={e => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Vai trò *</label>
                  <select
                    value={regForm.roleId}
                    onChange={e => setRegForm(prev => ({ ...prev, roleId: e.target.value }))}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    <option value="3">Sinh viên</option>
                    <option value="4">Giảng viên</option>
                    <option value="5">Cựu sinh viên</option>
                    <option value="6">Nhà tuyển dụng</option>
                    <option value="2">Cán bộ quản lý</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{getCodeInfo(regForm.roleId).label}</label>
                  <input
                    type="text" required placeholder={getCodeInfo(regForm.roleId).placeholder} value={regForm.code}
                    onChange={e => setRegForm(prev => ({ ...prev, code: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* School selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Trường đại học *</label>
                  <select
                    value={regForm.school}
                    onChange={e => handleSchoolChange(e.target.value, true)}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    {SCHOOLS.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Khoa / Phòng ban *</label>
                  <select
                    value={regForm.department}
                    onChange={e => handleDeptChange(e.target.value, true)}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    {(DEPARTMENTS[regForm.school] || []).map(dp => <option key={dp} value={dp}>{dp}</option>)}
                  </select>
                </div>
              </div>

              {/* Class selection (only if Student) */}
              {regForm.roleId === '3' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Lớp hành chính *</label>
                  <select
                    value={regForm.class}
                    onChange={e => setRegForm(prev => ({ ...prev, class: e.target.value }))}
                    style={{ ...inputStyle, padding: '10px 12px' }}
                  >
                    {(CLASSES[regForm.department] || []).map(cl => <option key={cl} value={cl}>{cl}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => handleTabSwitch('login')}
                  style={{ flex: 1, padding: '13px', borderRadius: 14, border: '1.5px solid #D2DBEA', background: '#fff', color: '#718096', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  Hủy đăng ký
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 1.5, padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.85 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)' }}>
                  {loading ? <><Loader2 size={16} className="animate-spin" />Đang lưu...</> : 'Hoàn tất đăng ký →'}
                </button>
              </div>
            </form>
          )}

          {/* Social Sign-In options (only shown in normal Login / Register, not in Google Info Complete) */}
          {activeTab !== 'google-register' && (
            <>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#D2DBEA' }} />
                <span style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 700, letterSpacing: 0.5 }}>HOẶC SỬ DỤNG</span>
                <div style={{ flex: 1, height: 1, background: '#D2DBEA' }} />
              </div>

              {/* Social Login Buttons */}
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
                  Đăng nhập bằng Google
                </button>

                <button
                  onClick={() => { setShowDemoAccounts(true); setError(''); }}
                  style={{ width: '100%', padding: '9px 16px', borderRadius: 12, border: '1px dashed #6E9AE0', background: '#EEF4FD', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#4a6fa5' }}
                >
                  🔑 Chọn tài khoản hệ thống (Demo)
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Google Demo Accounts Modal */}
      {showDemoAccounts && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowDemoAccounts(false)}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d1c2f', marginBottom: 4 }}>Chọn tài khoản Demo nhanh</h2>
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
