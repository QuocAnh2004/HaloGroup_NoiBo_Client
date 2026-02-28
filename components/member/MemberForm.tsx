
import React, { useState, useEffect } from 'react';
import { SystemUser, membersApi } from '../../api/members';
import { UserRole } from '../../types';
import Input from '../shared/Input';
import TextArea from '../shared/TextArea';
import DangerZone from '../shared/DangerZone';
import Button from '../shared/Button';
import Toast, { ToastType } from '../shared/Toast';
import SaveWarning from '../shared/SaveWarning';
import ModalLayout from '../shared/ModalLayout';
import { User, Mail, Phone, Briefcase, Award, Layers, Github, Code2, RotateCcw, ShieldAlert, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MemberFormProps {
  member: SystemUser;
  onUpdate: (updatedMember: SystemUser) => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, onUpdate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    level: '',
    department: '',
    skills: '',
    github_url: ''
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        position: member.position || '',
        level: member.level || '',
        department: member.department || '',
        skills: member.skills || '',
        github_url: member.github_url || ''
      });
      setHasChanges(false);
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    setIsSavedSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await membersApi.updateMember(member.id, formData);
      onUpdate({ ...member, ...formData });
      setIsSavedSuccess(true);
      // setHasChanges(false); // Reset changes after success logic in SaveWarning usually handles hiding
      setTimeout(() => {
          setIsSavedSuccess(false);
          setHasChanges(false);
      }, 2000);
    } catch (error) {
      setToast({ message: 'Lỗi khi cập nhật thông tin', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        position: member.position || '',
        level: member.level || '',
        department: member.department || '',
        skills: member.skills || '',
        github_url: member.github_url || ''
    });
    setHasChanges(false);
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      await membersApi.resetPassword(member.id);
      setToast({ message: 'Đã khôi phục mật khẩu về "123"', type: 'success' });
      setIsResetModalOpen(false);
    } catch (error) {
      setToast({ message: 'Lỗi khi reset mật khẩu', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteMember = async () => {
    try {
      await membersApi.deleteMember(member.id);
      navigate('/'); 
    } catch (error) {
      setToast({ message: 'Lỗi khi xóa nhân viên', type: 'error' });
    }
  };

  const isManager = member.role === UserRole.MANAGER;

  return (
    <div className="space-y-10 relative pb-20">
      {/* 1. Personal Info */}
      <div className="bg-white p-8 rounded-[40px] space-y-8 shadow-sm">
        <h4 className="text-lg font-medium text-slate-800">Thông tin cá nhân</h4>
        
        <Input 
          label="Họ và tên"
          name="name"
          value={formData.name}
          onChange={handleChange}
          icon={<User size={12} />}
          placeholder="Nhập họ và tên..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={12} />}
            placeholder="example@hola.com"
          />
          <Input 
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone size={12} />}
            placeholder="09xx..."
          />
        </div>
      </div>

      {/* 2. Professional Info */}
      <div className="bg-white p-8 rounded-[40px] space-y-8 shadow-sm">
        <h4 className="text-lg font-medium text-slate-800">Thông tin chuyên môn</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Vị trí / Chức danh"
            name="position"
            value={formData.position}
            onChange={handleChange}
            icon={<Briefcase size={12} />}
            placeholder="VD: Frontend Developer"
          />
          <Input 
            label="Cấp độ (Level)"
            name="level"
            value={formData.level}
            onChange={handleChange}
            icon={<Award size={12} />}
            placeholder="VD: Senior, Junior..."
          />
        </div>

        <Input 
          label="Phòng ban"
          name="department"
          value={formData.department}
          onChange={handleChange}
          icon={<Layers size={12} />}
          placeholder="VD: Engineering Team A"
        />

        <TextArea 
          label="Kỹ năng (Skills)"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          icon={<Code2 size={12} />}
          placeholder="VD: React, Node.js, Docker, AWS (ngăn cách bằng dấu phẩy)"
          rows={3}
        />

        <Input 
          label="Github Profile"
          name="github_url"
          value={formData.github_url}
          onChange={handleChange}
          icon={<Github size={12} />}
          placeholder="https://github.com/..."
        />
      </div>

      {/* 3. Account Settings */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-slate-800 px-2">Cài đặt tài khoản</h4>
        
        <div className="bg-white p-8 rounded-[32px] space-y-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
              <RotateCcw size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Đặt lại mật khẩu</h4>
              <p className="text-xs text-slate-400 font-light mt-0.5">Mật khẩu sẽ quay về mặc định '123'</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-medium hover:bg-sky-50 hover:text-sky-600 transition-colors"
          >
            Đặt lại
          </button>
        </div>

        {/* Danger Zone */}
        {!isManager && (
          <DangerZone 
            title="Xóa nhân viên"
            description="Hành động này sẽ xóa vĩnh viễn tài khoản và lịch sử hoạt động khỏi hệ thống. Không thể hoàn tác."
            actionText="Xóa tài khoản này"
            modalTitle="Xóa nhân viên?"
            modalDescription={`Bạn đang chuẩn bị xóa nhân viên ${member.name}. Toàn bộ dữ liệu liên quan sẽ bị mất.`}
            onAction={handleDeleteMember}
            className="border border-rose-100"
          />
        )}
      </div>

      {/* Floating Save Warning */}
      <SaveWarning 
        show={hasChanges || isSavedSuccess} 
        isSaving={isSaving}
        isSuccess={isSavedSuccess}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Reset Password Modal */}
      <ModalLayout
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        className="max-w-md"
        showCloseButton={false}
      >
        <div className="pb-4 text-center">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sky-100">
                <ShieldAlert size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-2">Xác nhận đặt lại?</h2>
            <p className="text-slate-500 font-light text-sm leading-relaxed px-4">
                Mật khẩu của nhân viên <strong>{member.name}</strong> sẽ được đưa về mặc định là "123".
            </p>
        </div>

        <div className="flex gap-3 pt-6">
            <button 
                onClick={() => setIsResetModalOpen(false)}
                disabled={isResetting}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 transition-colors text-sm"
            >
                Hủy bỏ
            </button>
            <button 
                onClick={handleResetPassword}
                disabled={isResetting}
                className="flex-1 py-3 bg-sky-500 text-white rounded-2xl font-medium hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-sm"
            >
                {isResetting ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                <span>Xác nhận</span>
            </button>
        </div>
      </ModalLayout>

      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default MemberForm;
