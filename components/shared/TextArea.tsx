
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: React.ReactNode;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  icon,
  className = "", 
  disabled,
  rows = 4,
  ...props 
}) => {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
          {icon} {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full bg-slate-50 text-slate-800 rounded-3xl px-6 py-5 placeholder:text-slate-300 focus:outline-none focus:bg-indigo-50/50 transition-all font-light resize-none leading-relaxed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

export default TextArea;
