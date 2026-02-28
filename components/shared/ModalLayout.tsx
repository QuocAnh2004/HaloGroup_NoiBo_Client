
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subTitle?: string;
  children: React.ReactNode;
  className?: string; // Để custom width (vd: max-w-lg, max-w-md)
  showCloseButton?: boolean;
}

const ModalLayout: React.FC<ModalLayoutProps> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  children,
  className = "max-w-md", // Default width
  showCloseButton = true,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className={`relative w-full ${className} bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="p-8 pb-4 flex justify-between items-start shrink-0 z-10 bg-white">
                <div className="space-y-1">
                  {title && (
                    <div className="text-2xl font-medium text-slate-800 tracking-tight">
                      {title}
                    </div>
                  )}
                  {subTitle && (
                     <p className="text-xs text-slate-400 font-light italic">{subTitle}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-colors -mr-2 -mt-2"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>
            )}

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ModalLayout;
