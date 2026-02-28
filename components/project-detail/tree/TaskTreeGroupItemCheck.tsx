
import React, { useCallback } from 'react';
import { CheckItem } from '../../../types';
import { useProjectDetail } from '../ProjectDetailContext';
import { 
  TreeInput, 
  TreeCheck, 
  TreeEditButton, 
  TreeDeleteButton, 
  TreeConfirmButton 
} from './TreeShared';

interface TaskTreeGroupItemCheckProps {
  groupId: string;
  itemId: string;
  check: CheckItem;
}

const TaskTreeGroupItemCheck: React.FC<TaskTreeGroupItemCheckProps> = React.memo(({
  groupId,
  itemId,
  check
}) => {
  const { editingId, setEditingId, toggleCheck, updateCheck, deleteCheck, isReadOnly } = useProjectDetail();
  const isEditing = editingId === check.id && !isReadOnly;

  const handleToggle = useCallback(() => !isReadOnly && toggleCheck(groupId, itemId, check.id), [groupId, itemId, check.id, isReadOnly, toggleCheck]);
  const handleChange = useCallback((e: any) => updateCheck(groupId, itemId, check.id, e.target.value), [groupId, itemId, check.id, updateCheck]);
  const handleEdit = useCallback(() => setEditingId(check.id), [check.id, setEditingId]);
  const handleConfirm = useCallback(() => setEditingId(null), [setEditingId]);
  const handleDelete = useCallback(() => deleteCheck(groupId, itemId, check.id), [groupId, itemId, check.id, deleteCheck]);

  return (
    <div className="flex items-center gap-3 p-3 sm:gap-4 group relative bg-white bg-white shadow-md shadow-slate-100/50 hover:shadow-lg hover:shadow-indigo-100/30 rounded-2xl transition-all relative">
      <div className={isReadOnly ? "opacity-50 pointer-events-none" : ""}>
        <TreeCheck 
          completed={check.completed} 
          onToggle={handleToggle} 
          size={18}
        />
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <TreeInput 
          isEditing={isEditing && !check.completed}
          value={check.title}
          onChange={handleChange}
          className={`text-[13px] sm:text-sm ${check.completed ? 'text-emerald-600 line-through' : 'text-slate-600'}`}
          placeholder="Nhiệm vụ cụ thể..."
        />
        
        {!check.completed && !isReadOnly && (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditing ? (
              <TreeConfirmButton onClick={handleConfirm} size={14} className="sm:w-[15px]" />
            ) : (
              <>
                <TreeEditButton onClick={handleEdit} size={14} className="sm:w-[15px]" />
                <TreeDeleteButton onClick={handleDelete} size={14} className="sm:w-[15px]" />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default TaskTreeGroupItemCheck;
