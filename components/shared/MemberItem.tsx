
import React from 'react';
import { User } from 'lucide-react';

export interface MemberItemProps {
  member: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  variant?: 'full' | 'mini';
  subText?: string; // Text phụ thay thế cho ID (ví dụ: Role hoặc Email)
  action?: React.ReactNode; // Nút hành động bên phải (nếu có)
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const MemberItem: React.FC<MemberItemProps> = ({
  member,
  variant = 'full',
  subText,
  action,
  onClick,
  className = "",
  disabled = false
}) => {
  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  // --- VARIANT: MINI (Avatar Only + Tooltip) ---
  if (variant === 'mini') {
    return (
      <div 
        onClick={!disabled ? onClick : undefined}
        className={`group/member relative w-8 h-8 md:w-9 md:h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-medium shadow-sm transition-all cursor-default ${!disabled && onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
      >
        <span className="text-[10px] md:text-xs">{getInitial(member.name)}</span>
        
        {/* Tooltip - Sử dụng group-hover/member để chỉ hiện khi hover đúng vào item này */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover/member:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-xl">
          {member.name}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      </div>
    );
  }

  // --- VARIANT: FULL (Row List Item) ---
  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`group/member flex items-center justify-between p-3 md:p-4 rounded-[20px] md:rounded-[24px] transition-all relative ${
        disabled 
          ? 'opacity-60 cursor-default bg-slate-50/50' 
          : onClick 
            ? 'cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 bg-slate-50' 
            : 'bg-slate-50'
      } ${className}`}
    >
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* Avatar */}
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-medium shadow-sm shrink-0 transition-colors ${
           disabled ? 'bg-slate-300 text-white' : 'bg-indigo-600 text-white'
        }`}>
          {getInitial(member.name)}
        </div>
        
        {/* Info */}
        <div className="flex flex-col min-w-0">
          <span className={`text-xs md:text-sm font-medium truncate transition-colors ${disabled ? 'text-slate-500' : 'text-slate-800 group-hover/member:text-indigo-700'}`}>
            {member.name}
          </span>
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            {subText ? (
              <span>{subText}</span>
            ) : (
              <>
                <User size={10} strokeWidth={2.5} />
                ID: {member.id}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Area */}
      {action && (
        <div className="pl-3 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default MemberItem;
