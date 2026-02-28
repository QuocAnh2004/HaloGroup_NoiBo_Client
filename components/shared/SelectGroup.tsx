
import React from 'react';

export interface SelectOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  // Class áp dụng khi option này được chọn
  activeClass?: string;
  // Class áp dụng khi option này KHÔNG được chọn
  inactiveClass?: string;
}

interface SelectGroupProps<T> {
  label?: string;
  icon?: React.ReactNode;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

function SelectGroup<T extends string | number>({ 
  label, 
  icon, 
  options, 
  value, 
  onChange, 
  disabled = false,
  className = ""
}: SelectGroupProps<T>) {
  
  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
          {icon} {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 relative z-20">
        {options.map((option) => {
          const isActive = value === option.value;
          
          // Default styles nếu không truyền custom class
          const defaultActive = "bg-indigo-600 text-white shadow-lg shadow-indigo-200";
          const defaultInactive = "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600";

          const activeStyle = option.activeClass || defaultActive;
          const inactiveStyle = option.inactiveClass || defaultInactive;

          return (
            <button
              key={String(option.value)}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-medium transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                isActive ? activeStyle : inactiveStyle
              }`}
            >
              {option.icon && (
                <span className={isActive ? "opacity-100" : "opacity-70"}>{option.icon}</span>
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SelectGroup;
