
import React from 'react';
import BackButton from '../shared/BackButton';
import { UserRole } from '../../types';

interface PreviewHeaderProps {
  onBack: () => void;
  title?: string;
  subtitle?: string; 
  role?: UserRole;
  showShare?: boolean; 
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({ 
  onBack, 
  title = "Cổng thông tin dự án",
  subtitle,
}) => {

  return (
    <header className="bg-white/90 backdrop-blur-md px-4 md:px-8 py-3 md:py-5 sticky top-0 z-30 shadow-sm border-b border-slate-100 transition-all">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 md:gap-6">
        
        {/* Left side: Navigation & Title */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
          <BackButton onClick={onBack} />
          <div className="flex flex-col min-w-0">
            <h2 className="text-base md:text-2xl font-medium truncate text-slate-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <span className="text-[10px] md:text-xs text-slate-400 font-light truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PreviewHeader;
