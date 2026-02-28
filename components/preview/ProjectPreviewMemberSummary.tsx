
import React, { useMemo } from 'react';
import { Project, TaskGroup } from '../../types';
import { Sparkles, Calendar, CheckCircle2, Circle, AlertCircle, Clock, ListTodo } from 'lucide-react';
import { formatSimpleDateTime, isOverdue } from '../../utils';

interface ProjectPreviewMemberSummaryProps {
  project: Project;
  currentUserId: string;
}

const ProjectPreviewMemberSummary: React.FC<ProjectPreviewMemberSummaryProps> = ({ project, currentUserId }) => {
  const member = project.teamMembers.find(m => m.id === currentUserId);
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Filter logic: Reconstruct a tree containing only tasks assigned to the current user
  const personalTree = useMemo(() => {
    if (!project.taskGroups) return [];

    return project.taskGroups.reduce((acc, group) => {
      // Find items in this group assigned to the user
      const myItems = group.taskItems.filter(item => 
        item.assignedMemberIds?.includes(currentUserId)
      );

      if (myItems.length > 0) {
        acc.push({
          ...group,
          taskItems: myItems
        });
      }
      return acc;
    }, [] as TaskGroup[]);
  }, [project.taskGroups, currentUserId]);

  const isItemCompleted = (item: any) => 
    item.checkItems.length > 0 && item.checkItems.every((c: any) => c.completed);

  if (!member) return null;

  if (personalTree.length === 0) {
    return (
      <div className="w-full">
         <div className="bg-slate-900 rounded-[32px] p-8 md:p-10 text-center text-white shadow-xl shadow-slate-200">
            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/50">
              <Sparkles size={28} />
            </div>
            <h2 className="text-xl font-medium mb-2">Xin chào, {member.name}</h2>
            <p className="text-slate-400 font-light text-sm">Hiện tại bạn chưa được phân công nhiệm vụ nào trong dự án này.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Personal Header */}
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-[20px] flex items-center justify-center text-xl font-medium shadow-xl shadow-slate-200 shrink-0">
          {getInitial(member.name)}
        </div>
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <ListTodo size={14} />
            <span className="text-[10px] font-medium uppercase tracking-widest">Không gian của bạn</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
            {member.name}
          </h2>
          <p className="text-slate-400 font-light text-xs mt-0.5">
            <span className="text-slate-900 font-medium">{personalTree.reduce((c, g) => c + g.taskItems.length, 0)} nhiệm vụ</span> được giao
          </p>
        </div>
      </div>

      {/* Personal Task Tree */}
      <div className="relative space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-[19px] sm:left-[19px] top-4 bottom-10 w-[2px] bg-slate-100 -z-10"></div>

        {personalTree.map((group, gIdx) => (
          <div key={group.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${gIdx * 100}ms` }}>
            {/* Group Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-100/50 z-10 shrink-0 border border-slate-50">
                <span className="text-indigo-600 font-medium text-base">{gIdx + 1}</span>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl flex-1 min-w-0">
                 <h3 className="text-xs sm:text-sm font-medium text-slate-700 truncate">{group.title}</h3>
              </div>
            </div>

            {/* Items */}
            <div className="pl-12 space-y-4">
              {group.taskItems.map((item) => {
                const isDone = isItemCompleted(item);
                const isLate = !isDone && isOverdue(item.estimatedTime);

                return (
                  <div key={item.id} className="relative group/item">
                    {/* Horizontal Connector */}
                    <div className="absolute left-[-22px] top-6 w-5 h-[2px] bg-slate-100"></div>

                    <div className={`p-5 rounded-[24px] transition-all duration-300 ${
                      isDone 
                        ? 'bg-emerald-50/50 opacity-80' 
                        : isLate 
                          ? 'bg-rose-50/50' 
                          : 'bg-white shadow-lg shadow-slate-100/60 hover:shadow-xl hover:shadow-indigo-100/20 border border-slate-50'
                    }`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <h4 className={`text-base font-medium leading-tight ${
                            isDone ? 'text-emerald-700 line-through' : isLate ? 'text-rose-700' : 'text-slate-800'
                          }`}>
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-400 font-light line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        
                        <div className={`shrink-0 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider ${
                           isDone ? 'bg-emerald-100 text-emerald-600' : isLate ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                           {isDone ? (
                               <CheckCircle2 size={10} />
                           ) : isLate ? (
                               <AlertCircle size={10} />
                           ) : (
                               <Clock size={10} />
                           )}
                        </div>
                      </div>

                      {/* Info Bar */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isLate ? 'text-rose-500' : 'text-slate-400'}`}>
                           <Calendar size={12} />
                           <span>{formatSimpleDateTime(item.estimatedTime)}</span>
                        </div>
                      </div>

                      {/* Checklist */}
                      {item.checkItems.length > 0 && (
                        <div className="bg-slate-50/50 rounded-xl p-3 space-y-2">
                          {item.checkItems.map(check => (
                            <div key={check.id} className="flex items-start gap-2.5">
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                check.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-transparent'
                              }`}>
                                <CheckCircle2 size={10} strokeWidth={3} />
                              </div>
                              <span className={`text-xs font-light transition-colors ${
                                check.completed ? 'text-slate-400 line-through' : 'text-slate-600'
                              }`}>
                                {check.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPreviewMemberSummary;
