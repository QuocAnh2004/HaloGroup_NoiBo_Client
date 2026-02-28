
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  className = '', 
  containerClassName = '', 
  placeholder = 'Tìm kiếm...',
  ...props 
}) => {
  return (
    <div className={`relative group ${containerClassName}`}>
      <Search 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" 
        size={18} 
      />
      <input 
        type="text" 
        placeholder={placeholder}
        className={`w-full bg-slate-100 rounded-3xl py-4 pl-11 pr-4 placeholder:text-slate-400 focus:outline-none transition-all font-light text-sm ${className}`}
        {...props}
      />
    </div>
  );
};

export default SearchBox;
