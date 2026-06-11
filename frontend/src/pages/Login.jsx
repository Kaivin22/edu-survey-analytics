import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Award, Briefcase, Sparkles, ChevronRight, School, ClipboardList } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const DEMO_ACCOUNTS = import.meta.env.PROD
  ? [
      { email: 'admin@edu.vn',     name: 'Nguyễn Quản Trị',    role: 'Admin',    avatar: '👑', color: '#ef4444' }
    ]
  : [
      { email: 'admin@edu.vn',     name: 'Nguyễn Quản Trị',    role: 'Admin',    avatar: '👑', color: '#ef4444' },
      { email: 'manager@edu.vn',   name: 'Trần Cán Bộ',       role: 'Manager',  avatar: '📊', color: '#8b5cf6' },
      { email: 'student1@edu.vn',  name: 'Trần Kim Liên',      role: 'Student',  avatar: '🎓', color: '#6E9AE0' },
      { email: 'lecturer1@edu.vn', name: 'Phạm Giảng Viên',    role: 'Lecturer', avatar: '📚', color: '#22c55e' },
      { email: 'alumnus1@edu.vn',  name: 'Hoàng Cựu SV',       role: 'Alumnus',  avatar: '🏢', color: '#f59e0b' },
      { email: 'employer1@edu.vn', name: 'FPT Software (Đại diện)', role: 'Employer', avatar: '💼', color: '#06b6d4' },
    ];

const ROLE_LABELS = { Admin:'Quản trị viên', Manager:'Cán bộ quản lý', Student:'Sinh viên', Lecturer:'Giảng viên', Alumnus:'Cựu sinh viên', Employer:'Nhà tuyển dụng' };

// ── JWT DECODER HELPER ──
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// ── Pupil Component ──
const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;
    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

// ── EyeBall Component ──
const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

// ── Main Login Page ──
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
  const [showMockGoogleModal, setShowMockGoogleModal] = useState(false);
  const [mockGoogleEmail, setMockGoogleEmail] = useState('googletest@edu.vn');
  const [mockGoogleName, setMockGoogleName] = useState('Nguyễn Google');

  // Demo accounts modal
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  // Cartoon animation states
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);
  const googleCallbackRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking purple
  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return timeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // Blinking black
  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return timeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // Looking at each other on typing
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Purple peeking when password typed and visible
  useEffect(() => {
    if (password.length > 0 && showPass) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => setIsPurplePeeking(false), 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };
      const p = schedulePeek();
      return () => clearTimeout(p);
    } else {
      setIsPurplePeeking(false);
    }
  }, [password, showPass]);

  // Position calculation for character lean and skew
  const calculatePosition = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  // Keep the ref always pointing to the latest callback
  useEffect(() => {
    googleCallbackRef.current = handleGoogleSignInResponse;
  });

  // Google Identity Services (GIS) integration
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Stable wrapper that delegates to the ref
    const stableCallback = (response) => {
      if (googleCallbackRef.current) {
        googleCallbackRef.current(response);
      }
    };

    // Load GIS SDK script dynamically (only once)
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const initGIS = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: stableCallback,
        auto_select: false,
        ux_mode: 'popup'
      });
      // Render the button into the container if it exists
      const container = document.getElementById('google-signin-btn-container');
      if (container) {
        container.innerHTML = ''; // clear previous render
        window.google.accounts.id.renderButton(
          container,
          { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
        );
      }
    };

    if (existingScript && window.google) {
      initGIS();
    } else if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGIS;
      document.body.appendChild(script);
    }
  }, [activeTab]);

  const handleGoogleSignInResponse = async (response) => {
    setAuthGoogleLoading(true);
    setError('');
    try {
      const payload = decodeJwt(response.credential);
      if (!payload || !payload.email || !payload.name) {
        throw new Error('Đăng nhập Google thất bại hoặc thiếu thông tin email/họ tên.');
      }

      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email, name: payload.name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.isNewUser) {
        setGoogleUserData({ email: data.email, name: data.name });
        setRegForm(prev => ({
          ...prev,
          fullName: data.name,
          email: data.email,
          roleId: '3',
          code: ''
        }));
        setActiveTab('google-register');
      } else {
        onLogin(data.user, data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthGoogleLoading(false);
    }
  };

  // Sync initialTab change
  useEffect(() => {
    setActiveTab(initialTab);
    setError('');
    setSuccess('');
  }, [initialTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    window.history.replaceState(null, '', tab === 'login' ? '/login' : '/register');
  };

  // Dynamic values helper based on selected school/department/role
  const handleSchoolChange = (schoolName) => {
    const depts = DEPARTMENTS[schoolName] || [];
    const defaultDept = depts[0] || '';
    const classes = CLASSES[defaultDept] || [];
    const defaultClass = classes[0] || '';
    setRegForm(prev => ({
      ...prev,
      school: schoolName,
      department: defaultDept,
      class: defaultClass
    }));
  };

  const handleDeptChange = (deptName) => {
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

  // Google Complete Profile Registration
  const handleGoogleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regForm.code.trim()) {
      setError('Vui lòng nhập mã nhận diện.');
      return;
    }

    // Code validation
    const isStudent = regForm.roleId === '3';
    if (isStudent) {
      if (!/^\d{8,12}$/.test(regForm.code.trim())) {
        setError('Mã số sinh viên (MSSV) phải gồm từ 8 đến 12 chữ số.');
        return;
      }
    } else {
      if (!/^[a-zA-Z0-9]+$/.test(regForm.code.trim())) {
        setError('Mã nhận diện chỉ được phép chứa chữ cái và số (không có ký tự đặc biệt hay khoảng trắng).');
        return;
      }
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

    // Code validation
    const isStudent = regForm.roleId === '3';
    if (isStudent) {
      if (!/^\d{8,12}$/.test(regForm.code.trim())) {
        setError('Mã số sinh viên (MSSV) phải gồm từ 8 đến 12 chữ số.');
        return;
      }
    } else {
      if (!/^[a-zA-Z0-9]+$/.test(regForm.code.trim())) {
        setError('Mã nhận diện chỉ được phép chứa chữ cái và số (không có ký tự đặc biệt hay khoảng trắng).');
        return;
      }
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
    <div className="min-h-screen grid lg:grid-cols-2 relative" style={{ background: 'linear-gradient(135deg, #D2DBEA, #6E9AE0, #F9FAFD, #FBECAC)', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Floating Home Button */}
      <Link to="/" style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#2d4771', textDecoration: 'none', fontWeight: 700, fontSize: 14, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(110,154,224,0.3)', padding: '10px 18px', borderRadius: 12, backdropFilter: 'blur(8px)', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.95)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
      >
        ← Quay lại Trang chủ
      </Link>

      {/* Left Column: Animated Cartoon Characters */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            
            {/* Purple tall rectangle character - Back layer */}
            <div 
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || (password.length > 0 && !showPass)) ? '440px' : '400px',
                backgroundColor: '#6C3FF5',
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: (password.length > 0 && showPass)
                  ? `skewX(0deg)`
                  : (isTyping || (password.length > 0 && !showPass))
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` 
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes */}
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPass) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                  top: (password.length > 0 && showPass) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(password.length > 0 && showPass) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPass) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(password.length > 0 && showPass) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPass) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Black tall rectangle character - Middle layer */}
            <div 
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: (password.length > 0 && showPass)
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || (password.length > 0 && !showPass))
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes */}
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPass) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                  top: (password.length > 0 && showPass) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(password.length > 0 && showPass) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPass) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(password.length > 0 && showPass) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPass) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Orange semi-circle character - Front left */}
            <div 
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                backgroundColor: '#FF9B6B',
                borderRadius: '120px 120px 0 0',
                transform: (password.length > 0 && showPass) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes - pupils only */}
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPass) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                  top: (password.length > 0 && showPass) ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPass) ? -5 : undefined} forceLookY={(password.length > 0 && showPass) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPass) ? -5 : undefined} forceLookY={(password.length > 0 && showPass) ? -4 : undefined} />
              </div>
            </div>

            {/* Yellow tall rectangle character - Front right */}
            <div 
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                backgroundColor: '#E8D754',
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: (password.length > 0 && showPass) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes - pupils only */}
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPass) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPass) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPass) ? -5 : undefined} forceLookY={(password.length > 0 && showPass) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPass) ? -5 : undefined} forceLookY={(password.length > 0 && showPass) ? -4 : undefined} />
              </div>
              <div 
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPass) ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPass) ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-[#2d4771]/60 font-semibold">
          <span>Hỗ trợ học tập</span>
          <span>Bảo mật</span>
          <span>Liên hệ</span>
        </div>
      </div>

      {/* Right Column: Unified Authentication Card */}
      <div className="flex items-center justify-center p-8 bg-transparent">
        <div className="w-full max-w-[500px]" style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 28, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', border: '1px solid rgba(210,219,234,0.8)' }}>
          
          {activeTab !== 'google-register' && (
            /* Toggle Tab Buttons */
            <div style={{ display: 'flex', background: '#EEF4FD', borderRadius: 16, padding: 6, marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: activeTab === 'login' ? '#fff' : 'transparent', color: activeTab === 'login' ? '#2d4771' : '#718096', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'login' ? '0 4px 12px rgba(110,154,224,0.15)' : 'none' }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
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
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
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
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
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
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email" required placeholder="example@edu.vn" value={regForm.email}
                    onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
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
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{getCodeInfo(regForm.roleId).label}</label>
                  <input
                    type="text" required placeholder={getCodeInfo(regForm.roleId).placeholder} value={regForm.code}
                    onChange={e => setRegForm(prev => ({ ...prev, code: e.target.value }))}
                    style={inputStyle}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
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
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
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
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
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
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{getCodeInfo(regForm.roleId).label}</label>
                  <input
                    type="text" required placeholder={getCodeInfo(regForm.roleId).placeholder} value={regForm.code}
                    onChange={e => setRegForm(prev => ({ ...prev, code: e.target.value }))}
                    style={inputStyle}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
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

          {/* Social Sign-In options */}
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
                {/* Google Sign-in: GIS button if Client ID exists, otherwise placeholder */}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <div id="google-signin-btn-container" style={{ width: '100%', minHeight: 40, display: 'flex', justifyContent: 'center' }}></div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowMockGoogleModal(true); setError(''); }}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#4a6fa5', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#F9FAFD'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff'}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.9 7.35 2.56 10.53l7.97-5.94z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.94C6.51 42.62 14.62 48 24 48z"/></svg>
                    Đăng nhập bằng Google (Thử nghiệm Local)
                  </button>
                )}

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

      {/* Mock Google Login Modal */}
      {showMockGoogleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowMockGoogleModal(false)}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d1c2f', marginBottom: 4 }}>Giả lập Đăng nhập Google</h2>
                <p style={{ fontSize: 13, color: '#718096' }}>Nhập thông tin giả lập tài khoản Google để thử nghiệm</p>
              </div>
              <button onClick={() => setShowMockGoogleModal(false)} style={{ background: '#F9FAFD', border: '1px solid #D2DBEA', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email Google giả lập</label>
                <input
                  type="email" required placeholder="Ví dụ: user@gmail.com" value={mockGoogleEmail}
                  onChange={e => setMockGoogleEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Họ và Tên Google giả lập</label>
                <input
                  type="text" required placeholder="Ví dụ: Nguyễn Văn Google" value={mockGoogleName}
                  onChange={e => setMockGoogleName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" onClick={() => setShowMockGoogleModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#fff', color: '#718096', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="button"
                  onClick={async () => {
                    setShowMockGoogleModal(false);
                    try {
                      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
                      const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ email: mockGoogleEmail.trim(), name: mockGoogleName.trim() }))));
                      const signature = "signature";
                      const mockCredential = `${header}.${payload}.${signature}`;
                      await googleCallbackRef.current({ credential: mockCredential });
                    } catch (err) {
                      setError('Không thể xử lý thông tin giả lập.');
                    }
                  }}
                  style={{ flex: 1.5, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(110,154,224,0.35)' }}
                >
                  Xác nhận Đăng nhập
                </button>
              </div>
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
