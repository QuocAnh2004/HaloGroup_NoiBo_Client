
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  icon,
  className = "", 
  disabled,
  ...props 
}) => {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
          {icon} {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-50 text-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:bg-indigo-50/50 transition-all font-light disabled:bg-slate-100 disabled:text-slate-500 placeholder:text-slate-300 ${className}`}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

export default Input;
