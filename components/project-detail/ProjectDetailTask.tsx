
import React from 'react';
import { ListChecks, Lock, ShieldCheck, Plus, LayoutTemplate } from 'lucide-react';
import TaskTree from './tree/TaskTree';
import { useProjectDetail } from './ProjectDetailContext';
import Loading from '../shared/Loading';

const ProjectDetailTask: React.FC = () => {
  const { groups, addGroup, totalProgress, isReadOnly, isLoading } = useProjectDetail();
  
  const handleAddCustom = () => {
    addGroup(
      "Giai đoạn mới", 
      "", 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );
  };

  return (
    <section className="space-y-8 pb-20">
      {/* Header & Progress */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-indigo-600">
              <ListChecks size={22} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-medium tracking-tight text-slate-800">Lộ trình triển khai</h3>
          </div>
          
          {isReadOnly && (
             <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-medium">
                <Lock size={12} />
                <span>Đã khóa chỉnh sửa</span>
             </div>
          )}
        </div>

        {/* Progress Bar Card */}
        <div className={`bg-white rounded-[32px] p-8 shadow-sm space-y-4 ${isReadOnly ? 'border border-emerald-100' : ''}`}>
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Tiến độ tổng thể</span>
              <span className="text-[10px] text-slate-300 font-light italic">(Tự động dựa trên checklist)</span>
            </div>
            <span className={`text-xl font-medium ${isReadOnly ? 'text-emerald-600' : 'text-indigo-600'}`}>{totalProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${isReadOnly ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.3)]'}`}
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Read Only Banner */}
        {isReadOnly && (
          <div className="bg-emerald-50 rounded-[24px] p-5 flex items-start gap-3 border border-emerald-100/50">
            <div className="p-2 bg-white rounded-xl text-emerald-500 shadow-sm shrink-0">
               <ShieldCheck size={18} />
            </div>
            <div className="space-y-1">
               <h4 className="text-sm font-medium text-emerald-800">Dự án hoàn tất</h4>
               <p className="text-xs text-emerald-600 font-light leading-relaxed">
                 Lộ trình này hiện đang ở chế độ <strong>chỉ xem</strong>. Chuyển trạng thái dự án về <strong>Đang làm</strong> nếu cần cập nhật thêm.
               </p>
            </div>
          </div>
        )}
      </div> 
      {/* End of Header & Progress div */}

      {/* Task Tree Content / Loading / Empty */}
      {isLoading ? (
        <div className="py-20">
           <Loading variant="component" text="Đang đồng bộ lộ trình..." />
        </div>
      ) : groups.length > 0 ? (
        <TaskTree />
      ) : (
        <div className="bg-white rounded-[48px] p-10 md:p-16 shadow-sm flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-indigo-200">
             <LayoutTemplate size={48} />
          </div>
          
          <div className="space-y-3 max-w-sm">
            <h4 className="text-2xl font-medium text-slate-800">Bắt đầu lộ trình của bạn</h4>
            <p className="text-slate-400 font-light text-sm leading-relaxed">
              Dự án này chưa có kế hoạch cụ thể. Hãy thêm giai đoạn đầu tiên để bắt đầu quản lý công việc.
            </p>
          </div>

          {!isReadOnly && (
            <div className="flex flex-col w-full max-w-xs gap-3">
              <button 
                onClick={handleAddCustom}
                className="group flex items-center justify-center gap-3 w-full py-5 bg-indigo-600 text-white rounded-[24px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 font-medium"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                <span>Thêm giai đoạn mới</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProjectDetailTask;
