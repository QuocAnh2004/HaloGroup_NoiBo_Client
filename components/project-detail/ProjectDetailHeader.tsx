
import React, { useState } from 'react';
import { ProjectStatus, ProjectPriority } from '../../types';
import { Flag, Clock, CheckCircle2, Calendar, MonitorPlay, AlertCircle, Power, Lock, Cloud, Loader2 } from 'lucide-react';
import { formatProjectDates, isOverdue } from '../../utils';
import BackButton from '../shared/BackButton';
import { useProjectDetail } from './ProjectDetailContext';
import { useNavigate } from 'react-router-dom';

interface ProjectDetailHeaderProps {
  onBack: () => void;
}

const priorityColors: Record<ProjectPriority, string> = {
  [ProjectPriority.LOW]: 'bg-slate-100 text-slate-500',
  [ProjectPriority.MEDIUM]: 'bg-sky-50 text-sky-600',
  [ProjectPriority.HIGH]: 'bg-rose-50 text-rose-600',
};

const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-600',
  [ProjectStatus.COMPLETED]: 'bg-emerald-50 text-emerald-600',
};

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({ 
  onBack
}) => {
  const { project, updateProject, totalProgress, isSyncing } = useProjectDetail();
  const navigate = useNavigate();
  const [completionError, setCompletionError] = useState<string | null>(null);

  const isLate = project.status === ProjectStatus.IN_PROGRESS && isOverdue(project.dueDate);
  const isCompleted = project.status === ProjectStatus.COMPLETED;

  const toggleStatus = () => {
    setCompletionError(null);

    // Nếu đang ở trạng thái In Progress và muốn chuyển sang Completed
    if (project.status === ProjectStatus.IN_PROGRESS) {
      if (totalProgress < 100) {
        setCompletionError("Cần đạt 100% tiến độ để hoàn thành.");
        setTimeout(() => setCompletionError(null), 3000);
        return;
      }
    }

    const newStatus = project.status === ProjectStatus.COMPLETED 
      ? ProjectStatus.IN_PROGRESS 
      : ProjectStatus.COMPLETED;
    
    updateProject({ status: newStatus });
  };

  const onPreview = () => navigate(`/project/${project.id}/preview`);

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b border-slate-100 transition-all">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          
          {/* --- TOP ROW (Mobile: Nav + Title + Action) --- */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="flex items-center gap-3 md:gap-5 min-w-0 flex-1">
                <BackButton onClick={onBack} />
                <div className="flex flex-col gap-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base md:text-2xl font-medium truncate text-slate-900 tracking-tight">
                      {project.name}
                    </h2>
                    {/* Sync Indicator */}
                    {isSyncing && (
                      <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full animate-in fade-in zoom-in">
                        <Loader2 size={10} className="animate-spin" />
                        <span className="text-[9px] font-medium uppercase tracking-wider">Lưu...</span>
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] md:text-xs font-light ${isLate ? 'text-rose-400' : 'text-slate-400'}`}>
                    <Calendar size={15} className={isLate ? "text-rose-300" : "text-slate-300"} />
                    <span className="sm:inline">{formatProjectDates(project.startDate, project.dueDate)}</span>
                  </div>
                </div>
             </div>

             {/* Mobile Preview Button */}
             <button 
                onClick={onPreview}
                className="md:hidden w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg active:scale-95 transition-transform"
                title="Xem trước"
              >
                <MonitorPlay size={18} />
              </button>
          </div>

          {/* --- BOTTOM ROW (Mobile: Status + Metadata) --- */}
          {/* On mobile: Border top + padding to separate from title */}
          <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4 border-t border-slate-50 md:border-0 md:pt-0">
            
            {/* 1. Status Switcher */}
            <div className="relative flex items-center gap-3">
               {completionError && (
                  <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 z-50 flex items-center gap-2 text-rose-500 bg-white border border-rose-100 shadow-xl px-3 py-2 rounded-xl animate-in fade-in slide-in-from-top-1 w-max">
                      <Lock size={12} className="shrink-0" />
                      <span className="text-[10px] font-medium">{completionError}</span>
                  </div>
               )}
               
               <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                 <button 
                    type="button"
                    onClick={toggleStatus}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 shadow-inner ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                    title={isCompleted ? "Mở lại dự án" : "Hoàn thành dự án"}
                  >
                    <div 
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform flex items-center justify-center ${
                        isCompleted ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    >
                      <Power size={10} className={isCompleted ? "text-emerald-500" : "text-slate-400"} strokeWidth={3} />
                    </div>
                  </button>
                  <span className={`text-[10px] uppercase font-medium tracking-wider ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                   {isCompleted ? 'Đã xong' : 'Đang làm'}
                 </span>
               </div>
            </div>
            
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>

            {/* 2. Metadata Badges */}
            <div className="flex items-center gap-2 justify-end">
              {/* Priority */}
              <span className={`p-2.5 rounded-lg text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${priorityColors[project.priority]}`}>
                <Flag size={15} strokeWidth={2.5} /> 
                <span className="hidden sm:inline">{project.priority}</span>
              </span>

              {/* Status/Late Badge */}
              {isLate && (
                <span className="p-2.5 rounded-lg text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 shadow-sm bg-rose-50 text-rose-500">
                  <AlertCircle size={15} strokeWidth={2.5} /> 
                  <span>Trễ</span>
                </span>
              )}
              
            </div>

            {/* Desktop Preview Button */}
            <button 
              onClick={onPreview}
              className="hidden md:flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 ml-2"
              title="Xem trước"
            >
              <MonitorPlay size={16} className="mr-2" />
              <span>Xem trước</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default ProjectDetailHeader;
