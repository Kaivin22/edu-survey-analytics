import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const LOGIN_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_074327_a4d6275d-82d9-4c83-bfbe-f1fb2213c17c.mp4';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Vui lòng nhập địa chỉ email.');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.length !== 6) return setError('Mã OTP phải gồm 6 chữ số.');
    if (newPassword.length < 8) return setError('Mật khẩu mới phải từ 8 ký tự trở lên.');
    if (newPassword !== confirmPassword) return setError('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #D2DBEA, #6E9AE0, #F9FAFD, #FBECAC)', fontFamily: "'Outfit', 'Inter', sans-serif" }}>


      {/* Floating Home Button */}
      <Link to="/" style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)', padding: '10px 18px', borderRadius: 12, backdropFilter: 'blur(8px)', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
      >
        ← Quay lại Trang chủ
      </Link>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 460, padding: '0 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.98)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', border: '1px solid rgba(210,219,234,0.8)' }}>

          {/* Back link */}
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6E9AE0', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(110,154,224,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              {step === 1 ? <Mail size={26} color="#6E9AE0" /> : <KeyRound size={26} color="#6E9AE0" />}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0d1c2f', marginBottom: 8 }}>
              {step === 1 ? 'Quên mật khẩu' : 'Nhập mã xác minh'}
            </h1>
            <p style={{ color: '#718096', fontSize: 14, lineHeight: 1.6 }}>
              {step === 1
                ? 'Nhập địa chỉ email của bạn. Chúng tôi sẽ gửi mã OTP 6 chữ số để xác minh.'
                : `Chúng tôi đã gửi mã OTP đến ${email}. Mã có hiệu lực trong 10 phút.`}
            </p>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#6E9AE0' : '#D2DBEA', transition: 'background 0.3s' }} />
            ))}
          </div>

          {/* Success message */}
          {success && step === 2 && (
            <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#065f46', fontSize: 14, fontWeight: 600 }}>
              <CheckCircle size={18} color="#059669" /> {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b', fontSize: 14 }}>
              <AlertCircle size={18} color="#ef4444" /> {error}
            </div>
          )}

          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2d4771', marginBottom: 8 }}>Địa chỉ email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#6E9AE0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#F9FAFD', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                    onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                  />
                </div>
              </div>

              <div style={{ background: '#FFF8E6', border: '1px solid #FBECAC', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                ⚠️ <strong>Lưu ý:</strong> Tính năng này chỉ hoạt động với tài khoản bạn đã tự đăng ký bằng email thực. Tài khoản demo hệ thống không hỗ trợ đặt lại mật khẩu.
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)' }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Đang gửi...</> : 'Gửi mã xác minh OTP →'}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP + new password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2d4771', marginBottom: 8 }}>Mã OTP (6 chữ số)</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={18} color="#6E9AE0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Nhập mã 6 chữ số từ email"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#F9FAFD', fontSize: 22, fontWeight: 700, letterSpacing: 8, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                    onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2d4771', marginBottom: 8 }}>Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#6E9AE0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: 12, border: '1.5px solid #D2DBEA', background: '#F9FAFD', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                    onBlur={e => e.target.style.borderColor = '#D2DBEA'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2d4771', marginBottom: 8 }}>Xác nhận mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#6E9AE0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: 12, border: `1.5px solid ${confirmPassword && newPassword !== confirmPassword ? '#ef4444' : '#D2DBEA'}`, background: '#F9FAFD', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#6E9AE0'}
                    onBlur={e => e.target.style.borderColor = confirmPassword && newPassword !== confirmPassword ? '#ef4444' : '#D2DBEA'}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #6E9AE0, #487bc9)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(110,154,224,0.45)', marginBottom: 12 }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Đang xử lý...</> : <><CheckCircle size={18} />Đặt lại mật khẩu</>}
              </button>

              <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); }}
                style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'transparent', color: '#6E9AE0', fontWeight: 600, fontSize: 14, border: '1.5px solid #D2DBEA', cursor: 'pointer' }}>
                Gửi lại mã OTP
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
