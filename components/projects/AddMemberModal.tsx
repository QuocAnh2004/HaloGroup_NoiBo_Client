
import React, { useState } from 'react';
import { User, Fingerprint, Plus, Check, Info } from 'lucide-react';
import { UserRole } from '../../types';
import { generateNumericId } from '../../utils';
import Toast, { ToastType } from '../shared/Toast';
import Button from '../shared/Button';
import ModalLayout from '../shared/ModalLayout';
import Input from '../shared/Input';

interface Member {
  id: string;
  name: string;
  password: string;
  role: UserRole;
}

interface AddMemberModalProps {
  onAdd: (member: Member) => Promise<void> | void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
    setNewName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isLoading) return;

    setIsLoading(true);

    const newMember: Member = {
      id: generateNumericId(4),
      name: newName.trim(),
      password: '123',
      role: UserRole.MEMBER,
    };

    try {
      await onAdd(newMember);
      setToast({ message: 'Thêm nhân sự thành công!', type: 'success' });
      handleClose();
    } catch (error) {
      // Toast error handled by parent usually, but valid to keep structure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleOpen}
        variant="primary"
        className="px-6 py-3 text-sm"
        icon={<Plus size={18} />}
      >
        Thêm Nhân Sự
      </Button>

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title="Thêm Nhân Sự"
        className="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          <Input 
            label="Họ và tên"
            icon={<User size={12} />}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nhập tên nhân viên..."
            autoFocus
            required
            disabled={isLoading}
          />

          <div className="bg-slate-50 p-6 rounded-[28px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Fingerprint size={16} />
                <span className="text-[11px] font-medium uppercase tracking-wider">Mã ID (4 chữ số)</span>
              </div>
              <span className="text-indigo-600 text-[10px] font-medium italic">Tự động tạo</span>
            </div>
            
            <div className="flex items-start gap-3 pt-2">
              <Info size={14} className="text-slate-300 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                Tài khoản mới sẽ có vai trò là <span className="text-slate-600 font-medium">Nhân viên</span>. Mật khẩu mặc định là <span className="text-slate-600 font-medium">123</span>.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="px-6 py-3 rounded-2xl text-sm"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="px-8 py-3 rounded-2xl text-sm"
              icon={<Check size={18} />}
            >
              Xác nhận
            </Button>
          </div>
        </form>
      </ModalLayout>

      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onClose={() => setToast(null)}
      />
    </>
  );
};

export default AddMemberModal;
