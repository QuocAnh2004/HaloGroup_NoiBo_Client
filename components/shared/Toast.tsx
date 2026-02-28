
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose?: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose,
  duration = 2000 
}) => {
  
  // Auto close timer
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  const isSuccess = type === 'success';

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0, x: "-50%", scale: 0.9 }}
          animate={{ y: 0, opacity: 1, x: "-50%", scale: 1 }}
          exit={{ y: 100, opacity: 0, x: "-50%", scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed bottom-10 left-1/2 z-[9999] px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 justify-center min-w-[280px] ${
            isSuccess 
              ? 'bg-emerald-500 text-white shadow-emerald-200/50' 
              : 'bg-rose-500 text-white shadow-rose-200/50'
          }`}
        >
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            {isSuccess ? (
              <Check size={14} strokeWidth={3} />
            ) : (
              <XCircle size={14} strokeWidth={3} />
            )}
          </div>
          <span className="font-medium text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Toast;
