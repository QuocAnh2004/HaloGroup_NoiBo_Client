
import React, { useRef, useEffect, useState } from 'react';
import { PencilLine, Check, Trash2, PlusCircle, Square, CheckSquare, Users } from 'lucide-react';
import { TeamMember } from '../../../types';
import SelectMemberModal from '../SelectMemberModal';
import MemberItem from '../../shared/MemberItem';

// --- DEBOUNCE HOOK ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface TreeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  isEditing: boolean;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
}

export const TreeInput: React.FC<TreeInputProps> = ({ isEditing, className = "", value, onChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    if (!isEditing) setLocalValue(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (localValue !== value && isEditing) {
      const handler = setTimeout(() => {
        onChange({ target: { value: localValue } });
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [localValue, isEditing]);

  // Style: Xem (Transparent) vs Sửa (Clean White + Shadow)
  const baseStyles = "w-full outline-none transition-all duration-200 rounded-xl px-2 py-1 -ml-2";
  const editingStyles = isEditing 
    ? "bg-white text-slate-800 shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-50 placeholder:text-slate-300 z-50 relative" 
    : "bg-transparent border-transparent cursor-default truncate";
    
  return (
    <input 
      className={`${baseStyles} ${editingStyles} ${className}`} 
      readOnly={!isEditing}
      tabIndex={isEditing ? 0 : -1}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      {...props} 
    />
  );
};

interface TreeTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  isEditing: boolean;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
}

export const TreeTextArea: React.FC<TreeTextAreaProps> = ({ isEditing, className = "", value, onChange, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!isEditing) setLocalValue(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (localValue !== value && isEditing) {
      const handler = setTimeout(() => {
        onChange({ target: { value: localValue } });
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [localValue, isEditing]);

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [localValue, isEditing]);

  const baseStyles = "w-full outline-none transition-all duration-200 rounded-xl px-2 py-1.5 -ml-2 resize-none overflow-hidden block";
  const editingStyles = isEditing 
    ? "bg-white text-slate-800 shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-50 min-h-[80px] z-50 relative leading-relaxed" 
    : "bg-transparent border-transparent cursor-default leading-relaxed whitespace-pre-wrap break-words";

  return (
    <textarea 
      ref={textareaRef}
      className={`${baseStyles} ${editingStyles} ${className}`} 
      readOnly={!isEditing}
      tabIndex={isEditing ? 0 : -1}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      rows={1} 
      {...props} 
    />
  );
};

interface IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number;
  className?: string;
  title?: string;
}

export const TreeEditButton: React.FC<IconButtonProps> = ({ onClick, size = 16, className = "" }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all ${className}`}
    title="Chỉnh sửa"
  >
    <PencilLine size={size} strokeWidth={2} />
  </button>
);

export const TreeDeleteButton: React.FC<IconButtonProps> = ({ onClick, size = 16, className = "" }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all ${className}`}
    title="Xóa"
  >
    <Trash2 size={size} strokeWidth={2} />
  </button>
);

export const TreeConfirmButton: React.FC<IconButtonProps> = ({ onClick, size = 18, className = "" }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm ${className}`}
    title="Xác nhận"
  >
    <Check size={size} strokeWidth={3} />
  </button>
);

export const TreeMemberButton: React.FC<IconButtonProps> = ({ onClick, size = 18, className = "" }) => (
  <button 
    onClick={onClick}
    className={`text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all duration-300 ${className}`}
    title="Gán nhân sự"
  >
    <Users size={size} strokeWidth={2} />
  </button>
);

interface TreeMemberGroupProps {
  assignedMemberIds: string[];
  selectableMembers: TeamMember[];
  onToggle: (memberId: string) => void;
  label: string;
  size?: 'sm' | 'md';
  isEditing?: boolean;
}

export const TreeMemberGroup: React.FC<TreeMemberGroupProps> = ({
  assignedMemberIds,
  selectableMembers,
  onToggle,
  label,
  size = 'md',
  isEditing = false
}) => {
  const assigned = selectableMembers.filter(m => assignedMemberIds.includes(m.id));
  
  const addIconSize = size === 'sm' ? 14 : 16;
  const addButtonClass = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  const triggerButton = (
    <button 
      className={`${addButtonClass} bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90`}
      title="Gán nhân sự"
    >
      <PlusCircle size={addIconSize} />
    </button>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {assigned.map(m => (
          <MemberItem 
            key={m.id} 
            member={m} 
            variant="mini" 
            className={size === 'sm' ? '!w-6 !h-6 !text-[9px]' : '!w-8 !h-8 !text-[10px]'}
          />
        ))}
        
        {isEditing && (
          <SelectMemberModal 
              onSelect={(m) => onToggle(m.id)}
              selectedMemberIds={assignedMemberIds}
              sourceMembers={selectableMembers}
              trigger={triggerButton}
              title="Gán nhân sự"
              subTitle={`Phân bổ thành viên thực hiện cho: ${label}`}
          />
        )}
      </div>
    </div>
  );
};

interface TreeAddButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TreeAddButton: React.FC<TreeAddButtonProps> = ({ onClick, label, size = 'md', className = "" }) => {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-[11px] gap-1.5 rounded-xl",
    md: "px-5 py-3 text-sm gap-2.5 rounded-2xl",
    lg: "px-10 py-5 text-base gap-3 rounded-[32px]"
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center font-medium transition-all duration-300 w-fit bg-indigo-50/40 text-indigo-500 hover:bg-indigo-100/60 hover:text-indigo-700 active:scale-95 ${sizeStyles[size]} ${className}`}
    >
      <PlusCircle size={iconSizes[size]} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
};

interface TreeCheckProps {
  completed: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: number;
}

export const TreeCheck: React.FC<TreeCheckProps> = ({ completed, onToggle, size = 20 }) => (
  <button 
    onClick={onToggle}
    className={`transition-all transform hover:scale-110 shrink-0 relative z-10 bg-[#f8fafc] rounded-md ${completed ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-400'}`}
  >
    {completed ? <CheckSquare size={size} strokeWidth={2} /> : <Square size={size} strokeWidth={2} />}
  </button>
);
