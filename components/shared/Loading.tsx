
import React from 'react';
import { Loader2 } from 'lucide-react';

type LoadingVariant = 'fullscreen' | 'component' | 'inline';

interface LoadingProps {
  variant?: LoadingVariant;
  text?: string;
  size?: number;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'component',
  text,
  size,
  className = ''
}) => {
  // Xác định kích thước icon mặc định dựa trên variant
  const defaultSize = variant === 'inline' ? 18 : (variant === 'fullscreen' ? 48 : 32);
  const iconSize = size || defaultSize;

  // 1. Fullscreen Overlay
  if (variant === 'fullscreen') {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-500 ${className}`}>
        <Loader2 size={iconSize} className="animate-spin text-indigo-600" />
        {text && (
          <p className="text-slate-500 font-light text-sm tracking-wide animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  // 2. Component Block (Centered inside parent)
  if (variant === 'component') {
    return (
      <div className={`flex flex-col items-center justify-center py-12 w-full h-full min-h-[200px] ${className}`}>
        <Loader2 size={iconSize} className="animate-spin text-indigo-600 mb-3" />
        {text && (
          <p className="text-slate-400 text-sm font-light text-center">{text}</p>
        )}
      </div>
    );
  }

  // 3. Inline (Row)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 size={iconSize} className="animate-spin text-indigo-600" />
      {text && <span className="text-slate-500 text-sm font-light">{text}</span>}
    </div>
  );
};

export default Loading;
