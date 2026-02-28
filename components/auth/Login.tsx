
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fingerprint, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthenticatedUser, UserRole } from '../../types';
import { authApi } from '../../api/auth';
import Button from '../../components/shared/Button';

interface LoginProps {
  onLogin: (user: AuthenticatedUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await authApi.login(userId, password);
      
      // Gọi hàm onLogin để lưu state global
      onLogin(user);

      // Điều hướng dựa trên Role
      if (user.role === UserRole.MEMBER) {
        // Member -> Trang thông tin cá nhân (Preview)
        navigate(`/member-info/${user.id}`);
      } else {
        // Manager -> Trang Dashboard
        navigate('/');
      }

    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden z-50">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] -z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-200/50 rounded-full blur-[120px] -z-0"></div>

      <div className="w-full max-w-[480px] bg-white rounded-[48px] shadow-2xl shadow-slate-200/60 p-10 md:p-16 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-slate-300 overflow-hidden">
             <img src="/logo.png" alt="HolaGroup Logo" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-slate-900">Chào mừng trở lại</h1>
            <p className="text-slate-400 font-light text-sm">Nhập thông tin nhân sự để tiếp tục truy cập hệ thống</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Fingerprint size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Mã ID (VD: 1024)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  maxLength={4}
                  className="w-full bg-slate-50 rounded-[24px] py-4 pl-14 pr-6 placeholder:text-slate-300 focus:outline-none focus:bg-indigo-50/30 transition-all font-light text-slate-800"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 rounded-[24px] py-4 pl-14 pr-6 placeholder:text-slate-300 focus:outline-none focus:bg-indigo-50/30 transition-all font-light text-slate-800"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-rose-50 text-rose-500 p-4 rounded-2xl animate-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-left leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full py-5 rounded-[24px] text-base"
              >
                <span>Đăng nhập</span>
                {!isLoading && <ArrowRight size={20} />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/change-password')}
                disabled={isLoading}
                className="w-full py-3 text-xs"
                icon={<ShieldCheck size={14} />}
              >
                Đổi mật khẩu?
              </Button>
            </div>
          </form>

          <div className="pt-4">
            <p className="text-[11px] text-slate-300 uppercase tracking-[0.2em] font-medium">Hệ thống quản lý nội bộ HolaGroup</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
