
import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import ModalLayout from '../shared/ModalLayout';

interface ProjectDetailDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  projectName: string;
}

const ProjectDetailDeleteModal: React.FC<ProjectDetailDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const handleDelete = async () => {
    if (confirmName !== projectName) return;
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <ModalLayout
        isOpen={isOpen}
        onClose={!isDeleting ? onClose : () => {}}
        className="max-w-md"
        showCloseButton={false}
    >
        <div className="pb-4 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100">
                <AlertTriangle size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-2">Xóa dự án?</h2>
            <p className="text-slate-500 font-light text-sm leading-relaxed px-2">
                Hành động này sẽ xóa vĩnh viễn dự án <span className="font-medium text-slate-800">"{projectName}"</span> và toàn bộ dữ liệu liên quan. Không thể hoàn tác.
            </p>
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block text-center">
                    Nhập tên dự án để xác nhận
                </label>
                <input 
                    type="text" 
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={projectName}
                    className="w-full bg-slate-50 text-slate-800 rounded-2xl py-3 px-4 text-center focus:outline-none focus:bg-rose-50/50 focus:border-rose-200 border border-transparent transition-all font-medium placeholder:text-slate-300"
                    autoFocus
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button 
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 transition-colors text-sm"
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={confirmName !== projectName || isDeleting}
                    className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-medium hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    <span>Xóa vĩnh viễn</span>
                </button>
            </div>
        </div>
    </ModalLayout>
  );
};

export default ProjectDetailDeleteModal;
