
import React, { useEffect, useState } from 'react';
import { Project, ProjectPriority, ProjectStatus } from '../../types';
import { ArrowUpRight, Flag, Clock, CheckCircle2, Calendar, AlertCircle, Timer, Layers, Loader2 } from 'lucide-react';
import { formatProjectDates, isOverdue, formatSimpleDateTime } from '../../utils';
import { tasksApi } from '../../api/tasks';

interface ProjectCardProps {
  project: Project;
}

// --- Types cho Alert Logic ---
type AlertType = 'LATE' | 'WARNING';

interface TaskAlert {
  id: string;
  title: string;
  deadline: string;
  type: AlertType;
}

interface GroupAlert {
  id: string;
  title: string;
  deadline: string;
  type: AlertType | null; 
  tasks: TaskAlert[];
}

const priorityConfig: Record<ProjectPriority, { bg: string, text: string, icon: string }> = {
  [ProjectPriority.LOW]: { bg: 'bg-slate-100', text: 'text-slate-500', icon: 'text-slate-400' },
  [ProjectPriority.MEDIUM]: { bg: 'bg-sky-50', text: 'text-sky-600', icon: 'text-sky-500' },
  [ProjectPriority.HIGH]: { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'text-rose-500' },
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [alerts, setAlerts] = useState<GroupAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Logic kiểm tra trễ hạn tổng quan
  const isProjectLate = project.status === ProjectStatus.IN_PROGRESS && isOverdue(project.dueDate);
  const isProjectWarning = !isProjectLate && project.status === ProjectStatus.IN_PROGRESS && (new Date(project.dueDate).getTime() - Date.now() < 48 * 60 * 60 * 1000);

  useEffect(() => {
    if (project.status !== ProjectStatus.IN_PROGRESS) return;

    const fetchTaskAlerts = async () => {
      setIsLoadingAlerts(true);
      try {
        const groups = await tasksApi.fetchTasksByProjectId(project.id);
        const now = Date.now();
        const WARNING_THRESHOLD = 48 * 60 * 60 * 1000;
        
        const groupAlerts: GroupAlert[] = [];

        const checkType = (dateStr: string): AlertType | null => {
           if (!dateStr) return null;
           const time = new Date(dateStr).getTime();
           if (isNaN(time)) return null;
           if (time < now) return 'LATE';
           if (time - now < WARNING_THRESHOLD) return 'WARNING';
           return null;
        };

        groups.forEach(group => {
           const groupStatus = checkType(group.estimatedTime);
           const taskAlerts: TaskAlert[] = [];
           const isGroupFullyDone = group.taskItems.every(t => t.checkItems.length > 0 && t.checkItems.every(c => c.completed));

           if (!isGroupFullyDone) {
             group.taskItems.forEach(item => {
                const isItemDone = item.checkItems.length > 0 && item.checkItems.every(c => c.completed);
                if (isItemDone) return;

                const itemStatus = checkType(item.estimatedTime);
                if (itemStatus) {
                  taskAlerts.push({
                    id: item.id,
                    title: item.title,
                    deadline: item.estimatedTime,
                    type: itemStatus
                  });
                }
             });

             if (groupStatus || taskAlerts.length > 0) {
               groupAlerts.push({
                 id: group.id,
                 title: group.title,
                 deadline: group.estimatedTime,
                 type: groupStatus,
                 tasks: taskAlerts
               });
             }
           }
        });

        groupAlerts.sort((a, b) => {
           const aScore = (a.type === 'LATE' || a.tasks.some(t => t.type === 'LATE')) ? 2 : 1;
           const bScore = (b.type === 'LATE' || b.tasks.some(t => t.type === 'LATE')) ? 2 : 1;
           return bScore - aScore;
        });

        setAlerts(groupAlerts);
      } catch (error) {
        console.error("Failed to fetch task alerts", error);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    fetchTaskAlerts();
  }, [project.id, project.status]);

  const hasAnyAlert = isProjectLate || isProjectWarning || alerts.length > 0;
  const cardBgColor = isProjectLate ? 'bg-rose-50/30' : (isProjectWarning ? 'bg-amber-50/30' : 'bg-white');

  return (
    <div className={`group relative rounded-[32px] p-7 transition-all duration-500 ease-out flex flex-col h-full ${cardBgColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:-translate-y-1`}>
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap gap-2">
          {/* Priority Badge */}
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 ${priorityConfig[project.priority].bg} ${priorityConfig[project.priority].text}`}>
            <Flag size={10} strokeWidth={3} className={priorityConfig[project.priority].icon} />
            {project.priority}
          </span>
          
          {/* Status Badge */}
          {isProjectLate ? (
            <span className="px-3 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 bg-rose-100 text-rose-600">
              <AlertCircle size={10} strokeWidth={3} />
              Trễ hạn
            </span>
          ) : isProjectWarning ? (
            <span className="px-3 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 bg-amber-100 text-amber-600">
              <Timer size={10} strokeWidth={3} />
              Gấp
            </span>
          ) : (
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 ${project.status === ProjectStatus.IN_PROGRESS ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {project.status === ProjectStatus.IN_PROGRESS ? <Clock size={10} strokeWidth={3} /> : <CheckCircle2 size={10} strokeWidth={3} />}
              {project.status}
            </span>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="mb-6">
        <h3 className="text-xl text-slate-800 mb-3 font-medium group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight" title={project.name}>
          {project.name}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-light">
          {project.description}
        </p>
      </div>

      {/* --- ALERTS SECTION (No Border, Soft Background) --- */}
      {(hasAnyAlert || isLoadingAlerts) && project.status === ProjectStatus.IN_PROGRESS && (
        <div className="flex-1 mb-6 min-h-0 flex flex-col">
           <div className={`rounded-2xl p-4 space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2 ${
             isLoadingAlerts 
               ? 'bg-slate-50' 
               : (isProjectLate || alerts.some(g => g.type === 'LATE' || g.tasks.some(t => t.type === 'LATE')) ? 'bg-rose-100/50' : 'bg-amber-100/50')
           }`}>
              
              {isLoadingAlerts ? (
                <div className="flex flex-col items-center justify-center py-4 gap-2 text-slate-400">
                   <Loader2 size={16} className="animate-spin" />
                   <span className="text-[10px] font-light">Kiểm tra tiến độ...</span>
                </div>
              ) : (
                <>
                  {(isProjectLate || isProjectWarning) && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${isProjectLate ? "bg-rose-500" : "bg-amber-500"}`}></div>
                      <div className="flex-1">
                          <span className="font-medium text-slate-700">Tổng thể:</span>
                          <span className={`ml-1 ${isProjectLate ? "text-rose-600" : "text-amber-600"}`}>
                            {isProjectLate ? 'Quá hạn' : 'Sắp tới hạn'} ({formatSimpleDateTime(project.dueDate)})
                          </span>
                      </div>
                    </div>
                  )}

                  {alerts.map(group => (
                    <div key={group.id} className="space-y-2 animate-in fade-in">
                        {(group.type === 'LATE' || group.type === 'WARNING') && (
                          <div className="flex items-start gap-2 text-xs">
                              <Layers size={12} className={`mt-0.5 shrink-0 ${group.type === 'LATE' ? 'text-rose-500' : 'text-amber-500'}`} />
                              <div className="flex-1 leading-tight">
                                <span className="text-slate-700 font-medium">{group.title}</span>
                                <div className={`text-[10px] ${group.type === 'LATE' ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {formatSimpleDateTime(group.deadline)}
                                </div>
                              </div>
                          </div>
                        )}
                        
                        {group.tasks.map(task => (
                            <div key={task.id} className="flex items-start gap-2 text-xs pl-3 relative">
                              {/* Decor line instead of border */}
                              <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-slate-300/30 rounded-full"></div>
                              
                              <div className="flex-1 leading-tight">
                                  <span className="text-slate-600">{task.title}</span>
                                  <div className={`text-[10px] ${task.type === 'LATE' ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {task.type === 'LATE' ? 'Trễ: ' : 'Hạn: '}{formatSimpleDateTime(task.deadline)}
                                  </div>
                              </div>
                            </div>
                        ))}
                    </div>
                  ))}
                </>
              )}
           </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className={`flex items-center gap-2 text-[11px] font-medium ${isProjectLate ? 'text-rose-500' : 'text-slate-400'}`}>
          <Calendar size={14} />
          <span>
            {formatProjectDates(project.startDate, project.dueDate)}
          </span>
        </div>
      </div>

      {/* Hover Action Icon */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 -translate-x-2 pointer-events-none text-indigo-500">
        <ArrowUpRight size={24} />
      </div>
    </div>
  );
};

export default ProjectCard;
