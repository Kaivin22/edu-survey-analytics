import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOGIN_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_074327_a4d6275d-82d9-4c83-bfbe-f1fb2213c17c.mp4';

const inputStyle = {
  background: '#F9FAFD',
  borderColor: '#D2DBEA',
  color: '#2d4771',
};

function Register() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', code: '', roleId: '3' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const codeInfo = {
    '3': { label: 'Mã số Sinh viên (MSSV)', placeholder: 'Ví dụ: 2251220153' },
    '4': { label: 'Mã số Giảng viên (MSGV)', placeholder: 'Ví dụ: GV202201' },
    '5': { label: 'Mã số Cựu Sinh viên', placeholder: 'Ví dụ: 20CT1' },
    '6': { label: 'Mã số thuế / Mã doanh nghiệp', placeholder: 'Ví dụ: TAX_FPT_01' },
  }[form.roleId] || { label: 'Mã nhận diện', placeholder: '' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.email || !form.password || !form.fullName) { setError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return; }
    if (form.password.length < 8) { setError('Mật khẩu phải từ 8 ký tự trở lên.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, roleId: parseInt(form.roleId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại.');
      setSuccess('Đăng ký thành công! Đang chuyển sang Đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, icon: Icon, label, children }) => (
    <div>
      <label className="block text-sm font-semibold mb-1 ml-1" style={{ color: '#2d4771' }}>{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center" style={{ color: '#6E9AE0' }}><Icon size={18} /></span>
        {children}
      </div>
    </div>
  );

  const inputClass = "w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm font-medium outline-none transition-all";

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Video background */}
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

      <div className="w-full max-w-lg rounded-3xl shadow-xl p-8" style={{ background: 'rgba(255,255,255,0.98)', borderColor: 'rgba(110,154,224,0.2)', position: 'relative', zIndex: 2, border: '1px solid rgba(210,219,234,0.8)' }}>

        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3" style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}>
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#2d4771' }}>Đăng Ký Tài Khoản</h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#6E9AE0' }}>Đăng ký để tham gia đóng góp ý kiến chất lượng</p>
        </div>

        {error && <div className="mb-4 p-4 rounded-2xl text-sm font-medium border" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#dc2626' }}>{error}</div>}
        {success && <div className="mb-4 p-4 rounded-2xl text-sm font-medium border" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="reg-name" label="Họ và Tên *" icon={User}>
              <input id="reg-name" type="text" placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => update('fullName', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'} />
            </Field>
            <Field id="reg-email" label="Địa chỉ Email *" icon={Mail}>
              <input id="reg-email" type="email" placeholder="example@edu.vn" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="reg-role" label="Bạn là đối tượng nào?" icon={Award}>
              <select id="reg-role" value={form.roleId} onChange={e => update('roleId', e.target.value)} className={inputClass + ' appearance-none'} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'}>
                <option value="3">Sinh viên</option>
                <option value="4">Giảng viên</option>
                <option value="5">Cựu sinh viên</option>
                <option value="6">Nhà tuyển dụng</option>
              </select>
            </Field>
            <Field id="reg-code" label={codeInfo.label} icon={Briefcase}>
              <input id="reg-code" type="text" placeholder={codeInfo.placeholder} value={form.code} onChange={e => update('code', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'} />
            </Field>
          </div>

          <Field id="reg-pw" label="Mật khẩu truy cập *" icon={Lock}>
            <input id="reg-pw" type="password" placeholder="Tối thiểu 8 ký tự" value={form.password} onChange={e => update('password', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6E9AE0'} onBlur={e => e.target.style.borderColor = '#D2DBEA'} />
          </Field>

          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="w-full mt-2 py-3 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6E9AE0, #487bc9)' }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus size={20} />Đăng ký tài khoản</>}
          </button>
        </form>

        <div className="mt-6 pt-5 text-center text-sm font-medium" style={{ borderTop: '1px solid #D2DBEA', color: '#487bc9' }}>
          Đã có tài khoản?{' '}<Link to="/login" className="font-bold underline" style={{ color: '#2d4771' }}>Đăng nhập ngay</Link>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.6)', fontSize: 13, position: 'relative', zIndex: 2 }}>
        © 2026 Đại học Kiến trúc Đà Nẵng
      </p>
    </div>
  );
}

export default Register;
