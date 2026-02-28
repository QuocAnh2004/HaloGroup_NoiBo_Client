
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'default';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  variant = 'default',
  className = '' 
}) => {
  
  const variants = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-500',
      valueColor: 'text-slate-900',
      labelColor: 'text-slate-400'
    },
    primary: {
      bg: 'bg-white',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      valueColor: 'text-slate-900',
      labelColor: 'text-indigo-400/80'
    },
    secondary: {
      bg: 'bg-white',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      valueColor: 'text-slate-900',
      labelColor: 'text-sky-400/80'
    },
    success: {
      bg: 'bg-white',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-slate-900',
      labelColor: 'text-emerald-400/80'
    },
    warning: {
      bg: 'bg-white',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-slate-900',
      labelColor: 'text-amber-400/80'
    },
    danger: {
      bg: 'bg-white',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      valueColor: 'text-slate-900',
      labelColor: 'text-rose-400/80'
    }
  };

  const theme = variants[variant];

  return (
    <div className={`${theme.bg} p-6 rounded-[28px] shadow-sm hover:shadow-lg hover:shadow-indigo-100/40 transition-all duration-300 flex items-center gap-5 ${className}`}>
      <div className={`w-14 h-14 ${theme.iconBg} ${theme.iconColor} rounded-[20px] flex items-center justify-center shrink-0 shadow-sm`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-medium tracking-tight ${theme.valueColor}`}>
          {value}
        </div>
        <div className={`text-[11px] uppercase tracking-widest font-medium ${theme.labelColor} mt-1`}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
