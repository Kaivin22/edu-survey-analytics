import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, Award, Sparkles } from 'lucide-react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [roleId, setRoleId] = useState('3'); // Default role 'Student' (id 3)
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !fullName || !roleId) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu đăng ký phải từ 8 ký tự trở lên.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          code,
          roleId: parseInt(roleId)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get labels dynamically based on roleId selected
  const getCodeFieldInfo = () => {
    switch (roleId) {
      case '3':
        return { label: 'Mã số Sinh viên (MSSV)', placeholder: 'Ví dụ: 2251220153' };
      case '4':
        return { label: 'Mã số Giảng viên (MSGV)', placeholder: 'Ví dụ: GV202201' };
      case '5':
        return { label: 'Mã số Cựu Sinh viên (hoặc lớp)', placeholder: 'Ví dụ: 20CT1' };
      case '6':
        return { label: 'Mã số thuế / Mã doanh nghiệp', placeholder: 'Ví dụ: TAX_FPT_01' };
      default:
        return { label: 'Mã nhận diện (nếu có)', placeholder: 'Nhập mã nhận diện' };
    }
  };

  const codeInfo = getCodeFieldInfo();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-white/60">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3">
            <UserPlus size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center">
            Đăng Ký Tài Khoản
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Đăng ký để tham gia đóng góp khảo sát chất lượng
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1" htmlFor="fullName">
                Họ và Tên
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/75 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1" htmlFor="email">
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
                  className="w-full pl-11 pr-4 py-2.5 bg-white/75 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1" htmlFor="role">
                Bạn là đối tượng nào?
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Award size={18} />
                </span>
                <select
                  id="role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/75 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="3">Sinh viên</option>
                  <option value="4">Giảng viên</option>
                  <option value="5">Cựu sinh viên</option>
                  <option value="6">Nhà tuyển dụng</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1" htmlFor="code">
                {codeInfo.label}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Briefcase size={18} />
                </span>
                <input
                  id="code"
                  type="text"
                  placeholder={codeInfo.placeholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/75 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1 ml-1" htmlFor="password">
              Mật khẩu truy cập
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/75 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus size={20} />
                Đăng ký tài khoản
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
