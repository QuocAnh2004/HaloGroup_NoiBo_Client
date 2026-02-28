
import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Timer } from 'lucide-react';
import { TaskGroup } from '../../../types';
import TaskTreeGroupItem from './TaskTreeGroupItem';
import { useProjectDetail } from '../ProjectDetailContext';
import DeadlinePicker from './DeadlinePicker';
import { getTaskStatus } from '../../../utils';
import { 
  TreeInput, 
  TreeTextArea, 
  TreeEditButton, 
  TreeDeleteButton, 
  TreeConfirmButton, 
  TreeAddButton,
  TreeMemberGroup
} from './TreeShared';

interface TaskTreeGroupProps {
  group: TaskGroup;
  index: number;
}

const TaskTreeGroup: React.FC<TaskTreeGroupProps> = React.memo(({
  group,
  index
}) => {
  const { 
    editingId, 
    setEditingId, 
    updateGroup, 
    deleteGroup, 
    toggleMemberInGroup,
    project,
    addItem,
    isReadOnly
  } = useProjectDetail();
  
  const [isExpanded, setIsExpanded] = useState(true);

  const isItemCompleted = (item: any) => 
    item.checkItems.length > 0 && item.checkItems.every((c: any) => c.completed);
  
  const isGroupCompleted = group.taskItems.length > 0 && group.taskItems.every(item => isItemCompleted(item));
  const isEditingGroup = editingId === group.id && !isReadOnly;

  const statusInfo = getTaskStatus(group.estimatedTime, isGroupCompleted);
  const isLate = statusInfo.type === 'LATE' || statusInfo.type === 'COMPLETED_LATE';

  const totalTasks = group.taskItems.length;
  const completedTasks = group.taskItems.filter(isItemCompleted).length;

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    if (isEditingGroup) return;
    setIsExpanded(prev => !prev);
  }, [isEditingGroup]);

  const handleTitleChange = useCallback((e: any) => updateGroup(group.id, { title: e.target.value }), [group.id, updateGroup]);
  const handleDescChange = useCallback((e: any) => updateGroup(group.id, { description: e.target.value }), [group.id, updateGroup]);
  const handleLateChange = useCallback((e: any) => updateGroup(group.id, { lateReason: e.target.value }), [group.id, updateGroup]);
  const handleTimeChange = useCallback((val: string) => updateGroup(group.id, { estimatedTime: val }), [group.id, updateGroup]);
  
  const handleToggleMember = useCallback((mid: string) => toggleMemberInGroup(group.id, mid), [group.id, toggleMemberInGroup]);
  const handleAddItem = useCallback(() => addItem(group.id), [group.id, addItem]);
  const handleEdit = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setEditingId(group.id); }, [group.id, setEditingId]);
  const handleDelete = useCallback((e: React.MouseEvent) => { e.stopPropagation(); deleteGroup(group.id); }, [group.id, deleteGroup]);
  const handleConfirm = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setEditingId(null); }, [setEditingId]);

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div 
        onClick={toggleExpand}
        className={`flex items-start justify-between p-4 sm:p-6 rounded-[32px] transition-all group relative z-20 cursor-pointer ${isEditingGroup ? 'bg-white shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-50' : 'bg-white shadow-md shadow-slate-100/50 hover:shadow-lg hover:shadow-indigo-100/30'}`}
      >
        <div className="flex items-start gap-4 sm:gap-6 flex-1 pr-14">
          {/* Index Circle */}
          <div className="flex flex-col items-center gap-3 shrink-0 pt-1">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 relative z-30 ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.shadowColor}`}>
              <span className="text-base sm:text-lg font-medium">{index + 1}</span>
            </div>
            
            <div className={`p-1 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          </div>
          
          <div className="space-y-3 flex-1 min-w-0 py-1">
            {/* Title & Count */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex-1">
                <TreeInput 
                  isEditing={isEditingGroup}
                  value={group.title}
                  onChange={handleTitleChange}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-lg sm:text-xl font-medium ${statusInfo.color}`}
                  placeholder="Nhập tên giai đoạn..."
                />
              </div>
              {!isEditingGroup && (
                <div className={`self-start sm:self-auto px-2 py-0.5 rounded-lg text-[10px] font-medium tracking-wide ${isGroupCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {completedTasks}/{totalTasks} Hoàn thành
                </div>
              )}
            </div>
            
            {/* Description */}
            {(group.description || isEditingGroup) && (
              <TreeTextArea 
                isEditing={isEditingGroup}
                value={group.description}
                onChange={handleDescChange}
                onClick={(e) => e.stopPropagation()}
                className={`text-sm text-slate-500 font-light ${isGroupCompleted ? 'text-emerald-600/70' : ''}`}
                placeholder="Thêm mô tả cho giai đoạn này..." 
              />
            )}

            {/* Late Reason */}
            {isLate && isExpanded && (
               <div className="w-full bg-rose-50/50 p-3 rounded-xl border border-rose-100/50 space-y-1" onClick={(e) => e.stopPropagation()}>
                  <label className="text-[9px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={10} /> Lý do trễ hạn
                  </label>
                  <TreeTextArea 
                    isEditing={isEditingGroup}
                    value={group.lateReason || ''}
                    onChange={handleLateChange}
                    placeholder={isEditingGroup ? "Nhập lý do trễ hạn..." : "(Chưa có lý do)"}
                    className={`w-full bg-transparent text-rose-800 text-xs`}
                  />
               </div>
            )}

            {/* Metadata Controls */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
               <div onClick={(e) => e.stopPropagation()}>
                  <DeadlinePicker 
                    value={group.estimatedTime}
                    minDate={project.startDate}
                    maxDate={project.dueDate}
                    isEditing={isEditingGroup}
                    isCompleted={isGroupCompleted}
                    onChange={handleTimeChange}
                  />
               </div>

               {isExpanded && !isReadOnly && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <TreeMemberGroup 
                      assignedMemberIds={group.assignedMemberIds || []}
                      selectableMembers={project.teamMembers}
                      onToggle={handleToggleMember}
                      label={group.title}
                      isEditing={isEditingGroup}
                    />
                  </div>
               )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {!isReadOnly && (
          <div className={`absolute top-6 right-6 flex flex-col gap-2 transition-all duration-300 ${!isEditingGroup ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            {isEditingGroup ? (
              <TreeConfirmButton onClick={handleConfirm} size={20} />
            ) : (
              <>
                <TreeEditButton onClick={handleEdit} />
                <TreeDeleteButton onClick={handleDelete} />
              </>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="ml-[20px] sm:ml-[24px] pl-8 sm:pl-12 relative border-l border-slate-200/60 pb-4 space-y-8 sm:space-y-10">
          {group.taskItems.map((item, iIdx) => (
            <div key={item.id} className="relative">
                {/* Connector Line */}
                <div className="absolute left-[-32px] sm:left-[-48px] top-[28px] w-[32px] sm:w-[48px] h-[1px] bg-slate-200"></div>
                <TaskTreeGroupItem 
                  groupId={group.id}
                  item={item}
                  groupIndex={index}
                  itemIndex={iIdx}
                  groupDeadline={group.estimatedTime}
                  groupMemberIds={group.assignedMemberIds || []}
                />
            </div>
          ))}
          
          {!isReadOnly && (
            <div className="relative pt-2">
               <div className="absolute left-[-32px] sm:left-[-48px] top-[24px] w-[24px] sm:w-[32px] h-[1px] bg-slate-200"></div>
               <TreeAddButton label="Mục tiêu mới" onClick={(e) => { e.stopPropagation(); handleAddItem(); }} size="md" className="ml-[-8px]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default TaskTreeGroup;
