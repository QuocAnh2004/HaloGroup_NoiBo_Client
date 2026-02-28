
import React from 'react';
import { TaskGroup, TaskItem, TeamMember } from '../../types';
import { Clock, CheckCircle2, Circle, Users, AlertCircle, AlertTriangle, MessageSquareWarning } from 'lucide-react';
import { formatSimpleDateTime, isOverdue } from '../../utils';
import MemberItem from '../shared/MemberItem';

interface ProjectPreviewTaskTreeProps {
  groups: TaskGroup[];
  projectMembers: TeamMember[];
}

const ProjectPreviewTaskTree: React.FC<ProjectPreviewTaskTreeProps> = ({ groups, projectMembers }) => {
  const getAssignedMembers = (ids: string[] = []) => {
    return projectMembers.filter(m => ids.includes(m.id));
  };

  const isItemCompleted = (item: TaskItem) => 
    item.checkItems.length > 0 && item.checkItems.every(c => c.completed);

  return (
    <div className="w-full pl-0 lg:pl-4">
      <div className="space-y-12">
        {/* Section Title */}
        <div className="flex items-center gap-3 sm:gap-4 border-b border-slate-100 pb-6 mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">Lộ trình tổng thể</h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-light mt-0.5 uppercase tracking-[0.1em]">Toàn bộ các hạng mục công việc</p>
          </div>
        </div>

        <div className="relative">
          {/* Main vertical line for the timeline */}
          {groups.length > 1 && (
            <div className="absolute left-[20px] sm:left-[30px] top-10 bottom-10 w-[1px] bg-slate-700 -z-0"></div>
          )}

          <div className="space-y-16 sm:space-y-20 relative z-10">
            {groups.map((group, gIdx) => {
              const assignedMembers = getAssignedMembers(group.assignedMemberIds);
              const completedCount = group.taskItems.filter(isItemCompleted).length;
              const totalCount = group.taskItems.length;
              
              const isGroupCompleted = totalCount > 0 && completedCount === totalCount;
              const isGroupLate = !isGroupCompleted && isOverdue(group.estimatedTime);
              
              // UPDATED: Removed cleanDescription helper, display text directly

              return (
                <div key={group.id} className="group/stage animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${gIdx * 100}ms` }}>
                  {/* Stage Header */}
                  <div className="flex items-start gap-4 sm:gap-6">
                    {/* Circle Indicator */}
                    <div className={`w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] shadow-xl rounded-xl sm:rounded-[22px] flex items-center justify-center shrink-0 transition-transform group-hover/stage:-translate-y-1 duration-500 ${isGroupLate ? 'bg-rose-50 shadow-rose-100' : 'bg-white shadow-slate-100'}`}>
                      {isGroupLate ? (
                        <AlertTriangle className="text-rose-500 sm:w-8 sm:h-8" size={20} />
                      ) : (
                        <span className={`text-sm sm:text-xl font-medium ${isGroupCompleted ? 'text-emerald-500' : 'text-indigo-600'}`}>{gIdx + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 pt-0.5 sm:pt-1 space-y-4 sm:space-y-6 min-w-0">
                      {/* Title Bar */}
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
                        <div className="space-y-1 min-w-0">
                          <h3 className={`text-lg sm:text-2xl font-medium tracking-tight leading-tight break-words ${isGroupLate ? 'text-rose-600' : 'text-slate-800'}`}>
                            {group.title}
                          </h3>
                          <div className={`flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-light ${isGroupLate ? 'text-rose-500' : 'text-slate-400'}`}>
                            {isGroupLate ? <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> : <Clock size={12} className="sm:w-3.5 sm:h-3.5" />}
                            <span className={isGroupLate ? "font-medium" : ""}>
                              {isGroupLate ? 'Đã quá hạn: ' : 'Thời hạn: '} 
                              {formatSimpleDateTime(group.estimatedTime)}
                            </span>
                          </div>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-medium uppercase tracking-widest self-start xl:self-auto shrink-0 ${isGroupCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                          {completedCount}/{totalCount} Mục tiêu
                        </div>
                      </div>

                      {/* Description - UPDATED: Direct display */}
                      {group.description && (
                        <p className="text-slate-500 text-sm sm:text-base font-light leading-relaxed break-words whitespace-pre-wrap">
                          {group.description}
                        </p>
                      )}

                      {/* Late Reason Display for Group */}
                      {group.lateReason && (
                        <div className="bg-rose-50/50 rounded-xl p-3 sm:p-4 flex items-start gap-3 border border-rose-100/50">
                           <MessageSquareWarning size={16} className="text-rose-400 mt-0.5 shrink-0" />
                           <div className="space-y-1">
                              <span className="text-[9px] font-medium text-rose-500 uppercase tracking-wider block">Lý do trễ hạn</span>
                              <p className="text-sm text-rose-800 font-light leading-relaxed break-words">{group.lateReason}</p>
                           </div>
                        </div>
                      )}

                      {/* Stage Personnel List */}
                      {assignedMembers.length > 0 && (
                        <div className="space-y-2 sm:space-y-3 pt-1">
                          <div className="flex items-center gap-2 text-slate-300 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium">
                            <Users size={10} className="sm:w-3" />
                            <span>Nhân sự giai đoạn</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {assignedMembers.map(m => (
                              <MemberItem 
                                key={m.id} 
                                member={m} 
                                variant="mini" 
                                className="!w-6 !h-6 sm:!w-7 sm:!h-7 !text-[9px] sm:!text-[10px]"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items (Tasks) */}
                      <div className="mt-10 sm:mt-14 space-y-16 sm:space-y-20 pl-4 sm:pl-10 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-700"></div>

                        {group.taskItems.map((item, iIdx) => {
                          const isDone = isItemCompleted(item);
                          const isItemLate = !isDone && isOverdue(item.estimatedTime);
                          const itemMembers = getAssignedMembers(item.assignedMemberIds);

                          return (
                            <div key={item.id} className="relative animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${(gIdx * 200) + (iIdx * 100)}ms` }}>
                              {/* Horizontal connector line */}
                              <div className={`absolute left-[-16px] sm:left-[-40px] top-5 sm:top-6 w-4 sm:w-10 h-[1px] ${isItemLate ? 'bg-rose-100' : 'bg-slate-700'}`}></div>
                              
                              <div className="space-y-5 sm:space-y-6">
                                {/* Item Header */}
                                <div className="flex items-start gap-3 sm:gap-4">
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm shrink-0 ${
                                    isDone ? 'bg-emerald-50 text-emerald-500' : isItemLate ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                                  }`}>
                                    {isDone ? <CheckCircle2 size={18} className="sm:w-5 sm:h-5" /> : isItemLate ? <AlertCircle size={18} className="sm:w-5 sm:h-5" /> : <Circle size={18} className="sm:w-5 sm:h-5" />}
                                  </div>
                                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                                    <h4 className={`text-base sm:text-lg font-medium transition-colors leading-tight break-words ${
                                      isDone ? 'text-emerald-600' : isItemLate ? 'text-rose-600' : 'text-slate-700'
                                    }`}>
                                      {item.title}
                                    </h4>
                                    <div className={`flex items-center gap-2 text-[10px] sm:text-[11px] font-light ${isItemLate ? 'text-rose-400' : 'text-slate-400'}`}>
                                      <Clock size={10} className="sm:w-3" />
                                      <span>
                                        {formatSimpleDateTime(item.estimatedTime)}
                                        {isItemLate && <span className="font-medium ml-1">(Trễ hạn)</span>}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Item Description - UPDATED: Direct display */}
                                {item.description && (
                                  <p className="text-[13px] sm:text-sm text-slate-400 font-light leading-relaxed pl-13 sm:pl-16 break-words whitespace-pre-wrap">
                                    {item.description}
                                  </p>
                                )}

                                {/* Late Reason Display for Item */}
                                {item.lateReason && (
                                  <div className="pl-13 sm:pl-16">
                                    <div className="bg-rose-50/30 rounded-xl p-3 flex items-start gap-2 border border-rose-50">
                                      <MessageSquareWarning size={14} className="text-rose-400 mt-0.5 shrink-0" />
                                      <div className="space-y-0.5">
                                          <span className="text-[8px] font-medium text-rose-500 uppercase tracking-wider block">Lý do trễ hạn</span>
                                          <p className="text-xs text-rose-800 font-light leading-relaxed break-words">{item.lateReason}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Item Personnel List */}
                                {itemMembers.length > 0 && (
                                  <div className="pl-13 sm:pl-16 space-y-2 sm:space-y-3">
                                    <div className="flex items-center gap-2 text-slate-300 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium">
                                      <span>Nhân sự phụ trách</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {itemMembers.map(m => (
                                        <MemberItem 
                                          key={m.id} 
                                          member={m} 
                                          variant="mini" 
                                          className="!w-5 !h-5 sm:!w-6 sm:!h-6 !text-[8px] sm:!text-[9px]"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Check Items */}
                                <div className="pl-13 sm:pl-16 space-y-3 sm:space-y-3">
                                  {item.checkItems.map(check => (
                                    <div key={check.id} className="flex items-start gap-3 sm:gap-4 group/check">
                                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-all duration-500 shrink-0 ${check.completed ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-slate-200'}`}></div>
                                      <span className={`text-[13px] sm:text-sm font-light transition-all break-words ${check.completed ? 'text-slate-300 line-through' : 'text-slate-500'}`}>
                                        {check.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style>{`
        .pl-13 { padding-left: 3.25rem; }
      `}</style>
    </div>
  );
};

export default ProjectPreviewTaskTree;
