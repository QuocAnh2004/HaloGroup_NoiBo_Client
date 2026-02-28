
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Key, ShieldCheck, ArrowLeft, Check, AlertCircle, Fingerprint } from 'lucide-react';
import { AuthenticatedUser } from '../../types';
import { authApi } from '../../api/auth';
import Button from '../../components/shared/Button';

interface ChangePasswordProps {
  user?: AuthenticatedUser;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ user }) => {
  const navigate = useNavigate();
  const [targetId, setTargetId] = useState(user?.id || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    // Quay về trang chủ. 
    // Nếu chưa đăng nhập, App.tsx sẽ tự render component Login.
    // Nếu đã đăng nhập, App.tsx sẽ render Dashboard.
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetId.trim()) {
      setError('Vui lòng nhập ID tài khoản.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 3) {
      setError('Mật khẩu mới quá ngắn.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.changePassword(targetId, currentPassword, newPassword);
      setIsLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-[480px] bg-white rounded-[48px] shadow-2xl shadow-slate-200/60 p-12 text-center space-y-8 animate-in">
          <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-100">
            <Check size={40} strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-900">Thành công!</h2>
            <p className="text-slate-400 font-light text-sm">Mật khẩu của bạn đã được cập nhật an toàn.</p>
          </div>
          <Button
            onClick={handleBack}
            variant="primary"
            className="w-full py-5 rounded-[24px]"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px] -z-0"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-slate-200/50 rounded-full blur-[100px] -z-0"></div>

      <div className="w-full max-w-[520px] bg-white rounded-[48px] shadow-2xl shadow-slate-200/60 p-10 md:p-14 relative z-10 animate-in">
        <button 
          onClick={handleBack}
          className="absolute top-8 left-8 p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-medium tracking-tight text-slate-900">Đổi mật khẩu</h1>
            <p className="text-slate-400 font-light text-sm px-4">Đảm bảo tài khoản của bạn luôn được bảo vệ tốt nhất</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-4">
              {/* Nếu không có user truyền vào (truy cập từ màn hình login), hiển thị input ID */}
              {!user && (
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-4">Mã ID tài khoản</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                      <Fingerprint size={18} />
                    </div>
                    <input
                      type="text"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      placeholder="VD: 1024"
                      maxLength={4}
                      className="w-full bg-slate-50 rounded-[20px] py-4 pl-14 pr-6 focus:outline-none focus:bg-indigo-50/30 transition-all font-light text-slate-800"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-4">Mật khẩu hiện tại</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 rounded-[20px] py-4 pl-14 pr-6 focus:outline-none focus:bg-indigo-50/30 transition-all font-light text-slate-800"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-4">Mật khẩu mới</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <Key size={18} />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full bg-slate-50 rounded-[20px] py-4 pl-14 pr-6 focus:outline-none focus:bg-indigo-50/30 transition-all font-light text-slate-800"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-4">Xác nhận mật khẩu</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-slate-50 rounded-[20px] py-4 pl-14 pr-6 focus:outline-none focus:bg-indigo-50/30 transition-all font-light text-slate-800"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-rose-50 text-rose-500 p-4 rounded-2xl animate-in fade-in">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-xs font-medium text-left">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full py-5 rounded-[24px]"
              >
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
