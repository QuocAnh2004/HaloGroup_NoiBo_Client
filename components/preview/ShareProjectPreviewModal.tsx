
import React, { useState, useEffect } from 'react';
import { Copy, Check, Link, Share2 } from 'lucide-react';
import ModalLayout from '../shared/ModalLayout';

interface ShareProjectPreviewModalProps {
  variant?: 'icon' | 'full'; 
}

const ShareProjectPreviewModal: React.FC<ShareProjectPreviewModalProps> = ({ variant = 'full' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.href);
    }
  }, []);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === 'icon' ? (
        <button 
          onClick={handleOpen}
          className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 active:scale-90 transition-transform"
          title="Chia sẻ dự án"
        >
          <Share2 size={18} />
        </button>
      ) : (
        <button 
          onClick={handleOpen}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-medium hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Share2 size={16} />
          <span>Chia sẻ</span>
        </button>
      )}

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title="Gửi cho thành viên"
        className="max-w-md"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Sao chép liên kết dưới đây để gửi cho các thành viên trong đội ngũ. Họ có thể xem chi tiết lộ trình mà không cần quyền chỉnh sửa.
          </p>

          <div className="bg-slate-50 p-2 rounded-[24px] flex items-center gap-2 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
              <Link size={18} />
            </div>
            <div className="flex-1 min-w-0 px-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Liên kết dự án</div>
              <div className="text-xs text-slate-800 font-medium truncate select-all font-mono" title={url}>{url}</div>
            </div>
            <button 
              onClick={handleCopy}
              className={`h-10 px-5 rounded-2xl text-xs font-medium transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 ${
                copied 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-light">Liên kết có hiệu lực vĩnh viễn</span>
          </div>
        </div>
      </ModalLayout>
    </>
  );
};

export default ShareProjectPreviewModal;
