
import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading = false, 
  variant = 'primary', 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  
  const baseStyles = "relative flex items-center justify-center gap-2 rounded-2xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200",
    secondary: "bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200",
    ghost: "bg-transparent text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button 
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 size={18} className="animate-spin absolute" />
      )}
      
      <div className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {icon}
        {children}
      </div>
    </button>
  );
};

export default Button;
