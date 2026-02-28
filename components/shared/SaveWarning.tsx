
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Toast from './Toast';

interface SaveWarningProps {
  show: boolean;
  isSaving: boolean;
  isSuccess: boolean;
  onSave: () => void;
  onCancel?: () => void; // Optional cancel
  label?: string; // Custom label, default "Có thay đổi!"
}

const SaveWarning: React.FC<SaveWarningProps> = ({
  show,
  isSaving,
  isSuccess,
  onSave,
  onCancel,
  label = "Có thay đổi chưa lưu!"
}) => {
  // Logic hiển thị:
  // 1. Toast Success: Hiển thị khi isSuccess = true
  // 2. Warning Bar: Hiển thị khi show = true VÀ KHÔNG PHẢI success
  
  const showWarningBar = show && !isSuccess;

  return (
    <>
      {/* 1. Success Toast */}
      <Toast 
        isVisible={isSuccess} 
        message="Lưu thay đổi thành công!" 
        type="success" 
      />

      {/* 2. Unsaved Changes Warning Bar */}
      <AnimatePresence>
        {showWarningBar && (
          <motion.div 
            initial={{ y: 150, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 150, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 z-[100] w-[90%] md:w-auto"
          >
             <div className="bg-slate-900/90 backdrop-blur-md text-white px-2 py-2 rounded-full shadow-2xl shadow-slate-400/50 flex items-center justify-between gap-6 md:gap-12 border border-slate-700/50">
              <div className="flex items-center gap-3 pl-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{label}</span>
                  <span className="text-[10px] text-slate-400 font-light">Đừng quên lưu công việc</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onCancel && (
                  <button 
                    onClick={onCancel}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium"
                  >
                    Hủy
                  </button>
                )}
                <button 
                  onClick={onSave}
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-xs md:text-sm font-medium shadow-lg hover:bg-indigo-500 transition-all flex items-center gap-2 justify-center"
                >
                  {isSaving && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isSaving ? null : <span>Lưu thay đổi</span>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SaveWarning;
