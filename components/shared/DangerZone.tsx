
import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import ModalLayout from './ModalLayout';

interface DangerZoneProps {
  // Props cho hiển thị bên ngoài (Box)
  title?: string;
  description: string;
  actionText?: string;
  
  // Props cho Modal xác nhận
  modalTitle?: string;
  modalDescription?: string;
  
  // Logic xử lý
  onAction: () => Promise<void> | void;
  
  // Verification (Nếu có giá trị này, người dùng phải nhập đúng mới xóa được)
  verificationText?: string;
  
  className?: string;
}

const DangerZone: React.FC<DangerZoneProps> = ({
  title = "Khu vực nguy hiểm",
  description,
  actionText = "Xóa vĩnh viễn",
  modalTitle = "Xác nhận xóa?",
  modalDescription,
  onAction,
  verificationText,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  // Reset state khi mở modal
  const handleOpen = () => {
    setConfirmInput('');
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    // Nếu yêu cầu verify mà nhập sai thì return
    if (verificationText && confirmInput !== verificationText) return;

    setIsLoading(true);
    try {
      await onAction();
      // Nếu action thành công (ví dụ chuyển trang), component có thể unmount.
      // Nếu không unmount (ví dụ chỉ xóa item trong list), ta đóng modal.
      setIsOpen(false);
    } catch (error) {
      console.error("DangerZone Error:", error);
    } finally {
      // Chỉ set loading false nếu component vẫn còn mounted (thường handled bởi React automatically in functional updates, nhưng an toàn thì set)
      setIsLoading(false);
    }
  };

  const isButtonDisabled = verificationText ? confirmInput !== verificationText : false;

  return (
    <>
      {/* 1. Trigger UI Box */}
      <div className={`bg-rose-50/50 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden ${className}`}>
         <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-rose-600">
               <AlertTriangle size={20} />
               <h4 className="text-base font-medium">{title}</h4>
            </div>
            <p className="text-xs text-rose-800/70 font-light max-w-md leading-relaxed">
              {description}
            </p>
         </div>
         
         <button 
           onClick={handleOpen}
           className="relative z-10 px-6 py-3 bg-white text-rose-600 rounded-2xl text-xs font-medium hover:bg-rose-600 hover:text-white hover:border-transparent transition-all shadow-sm active:scale-95 flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
         >
           <Trash2 size={16} />
           <span>{actionText}</span>
         </button>
      </div>

      {/* 2. Confirmation Modal (Self-contained) */}
      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-md"
        showCloseButton={false}
      >
        <div className="pb-4 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100">
                <ShieldAlert size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-2">{modalTitle}</h2>
            <p className="text-slate-500 font-light text-sm leading-relaxed px-4">
                {modalDescription || `Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?`}
            </p>
        </div>

        <div className="space-y-4">
            {/* Nếu cần Verification Text */}
            {verificationText && (
              <div className="space-y-2">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block text-center">
                      Nhập <span className="text-slate-800 select-all">"{verificationText}"</span> để xác nhận
                  </label>
                  <input 
                      type="text" 
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      placeholder={verificationText}
                      className="w-full bg-slate-50 text-slate-800 rounded-2xl py-3 px-4 text-center focus:outline-none focus:bg-rose-50/50 focus:border-rose-200 border border-transparent transition-all font-medium placeholder:text-slate-300"
                      autoFocus
                      disabled={isLoading}
                  />
              </div>
            )}

            <div className="flex gap-3 pt-4">
                <button 
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 transition-colors text-sm"
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={handleConfirm}
                    disabled={isButtonDisabled || isLoading}
                    className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-medium hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    <span>Xóa ngay</span>
                </button>
            </div>
        </div>
      </ModalLayout>
    </>
  );
};

export default DangerZone;
