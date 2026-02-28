
import React, { useCallback } from 'react';
import { TaskItem } from '../../../types';
import TaskTreeGroupItemCheck from './TaskTreeGroupItemCheck';
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

interface TaskTreeGroupItemProps {
  groupId: string;
  item: TaskItem;
  groupIndex: number;
  itemIndex: number;
  groupDeadline: string;
  groupMemberIds: string[];
}

const TaskTreeGroupItem: React.FC<TaskTreeGroupItemProps> = React.memo(({
  groupId,
  item,
  groupIndex,
  itemIndex,
  groupDeadline,
  groupMemberIds
}) => {
  const { 
    editingId, 
    setEditingId, 
    updateItem, 
    deleteItem, 
    toggleMemberInItem,
    project,
    addCheck,
    isReadOnly
  } = useProjectDetail();
  
  const isItemCompleted = item.checkItems.length > 0 && item.checkItems.every(c => c.completed);
  const isEditingItem = editingId === item.id && !isReadOnly;

  const statusInfo = getTaskStatus(item.estimatedTime, isItemCompleted);
  const isLate = statusInfo.type === 'LATE' || statusInfo.type === 'COMPLETED_LATE';

  const selectableMembers = groupMemberIds.length > 0 
    ? project.teamMembers.filter(m => groupMemberIds.includes(m.id)) 
    : project.teamMembers;

  const handleTitleChange = useCallback((e: any) => updateItem(groupId, item.id, { title: e.target.value }), [groupId, item.id, updateItem]);
  const handleDescChange = useCallback((e: any) => updateItem(groupId, item.id, { description: e.target.value }), [groupId, item.id, updateItem]);
  const handleLateChange = useCallback((e: any) => updateItem(groupId, item.id, { lateReason: e.target.value }), [groupId, item.id, updateItem]);
  const handleTimeChange = useCallback((val: string) => updateItem(groupId, item.id, { estimatedTime: val }), [groupId, item.id, updateItem]);
  const handleToggleMember = useCallback((mid: string) => toggleMemberInItem(groupId, item.id, mid), [groupId, item.id, toggleMemberInItem]);
  
  const handleEdit = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setEditingId(item.id); }, [item.id, setEditingId]);
  const handleDelete = useCallback((e: React.MouseEvent) => { e.stopPropagation(); deleteItem(groupId, item.id); }, [groupId, item.id, deleteItem]);
  const handleConfirm = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setEditingId(null); }, [setEditingId]);
  const handleAddCheck = useCallback((e: React.MouseEvent) => { e.stopPropagation(); addCheck(groupId, item.id); }, [groupId, item.id, addCheck]);

  return (
    <div className="space-y-4 relative group/item">
      {/* Main Card */}
      <div className={`flex items-start justify-between p-4 sm:p-5 rounded-3xl transition-all relative z-10 ${isEditingItem ? 'bg-white shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-50' : 'bg-white shadow-sm hover:shadow-md hover:shadow-indigo-50'}`}>
        <div className="flex items-start gap-4 flex-1 min-w-0 pr-12">
          {/* Number Badge */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold mt-1.5 transition-colors ${statusInfo.bgColor} ${statusInfo.color}`}>
            {groupIndex + 1}.{itemIndex + 1}
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-2 min-w-0">
            <TreeInput 
              isEditing={isEditingItem}
              value={item.title}
              onChange={handleTitleChange}
              className={`text-base font-medium ${statusInfo.color}`}
              placeholder="Mục tiêu công việc..."
            />
            
            {(item.description || isEditingItem) && (
              <TreeTextArea 
                isEditing={isEditingItem}
                value={item.description || ''}
                onChange={handleDescChange}
                className={`text-xs text-slate-500 ${isItemCompleted ? 'text-emerald-500/70' : ''}`}
                placeholder="Thêm ghi chú..."
              />
            )}
            
            {/* Late Reason */}
            {isLate && (
               <div className="w-full bg-rose-50/50 p-2 rounded-lg border border-rose-100 space-y-1">
                  <label className="text-[9px] font-bold text-rose-400 uppercase">Lý do trễ</label>
                  <TreeTextArea 
                    isEditing={isEditingItem}
                    value={item.lateReason || ''}
                    onChange={handleLateChange}
                    placeholder={isEditingItem ? "Nhập lý do..." : "..."}
                    className={`w-full bg-transparent text-rose-800 text-xs`}
                  />
               </div>
            )}

            {/* Footer Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-50 mt-1">
               <div className="flex items-center gap-3">
                  <DeadlinePicker 
                    value={item.estimatedTime}
                    minDate={project.startDate}
                    maxDate={groupDeadline}
                    isEditing={isEditingItem}
                    isCompleted={isItemCompleted}
                    onChange={handleTimeChange}
                  />
               </div>

               {!isReadOnly && (
                   <TreeMemberGroup 
                    assignedMemberIds={item.assignedMemberIds || []}
                    selectableMembers={selectableMembers}
                    onToggle={handleToggleMember}
                    label={item.title}
                    size="sm"
                    isEditing={isEditingItem}
                  />
                )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isReadOnly && (
          <div className={`absolute top-4 right-4 flex gap-2 transition-all duration-300 ${!isEditingItem ? 'opacity-0 group-hover/item:opacity-100' : 'opacity-100'}`}>
            {isEditingItem ? (
              <TreeConfirmButton onClick={handleConfirm} size={16} />
            ) : (
              <>
                <TreeEditButton onClick={handleEdit} size={14} />
                <TreeDeleteButton onClick={handleDelete} size={14} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Sub-Items (Checklist) */}
      <div className="pl-8 sm:pl-10 space-y-3 relative">
        {/* Connector */}
        {item.checkItems.length > 0 && (
           <div className="absolute left-[16px] top-[-10px] bottom-4 w-[1px] bg-slate-200"></div>
        )}

        {item.checkItems.map(check => (
          <div key={check.id} className="relative">
             <div className="absolute left-[-24px] top-[50%] w-[16px] h-[1px] bg-slate-200"></div>
             <TaskTreeGroupItemCheck groupId={groupId} itemId={item.id} check={check} />
          </div>
        ))}
        
        {!isReadOnly && (
          <div className="relative pt-1">
            <div className="absolute left-[-24px] top-[18px] w-[12px] h-[1px] bg-slate-200"></div>
            <TreeAddButton label="Đầu việc" onClick={handleAddCheck} size="sm" className="ml-[-8px]" />
          </div>
        )}
      </div>
    </div>
  );
});

export default TaskTreeGroupItem;
