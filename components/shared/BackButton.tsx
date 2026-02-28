
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = "" }) => {
  return (
    <button 
      onClick={onClick}
      className={`p-2.5 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-90 group ${className}`}
      title="Quay lại"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
    </button>
  );
};

export default BackButton;
