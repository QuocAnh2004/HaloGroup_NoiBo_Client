
import React from 'react';
import TaskTreeGroup from './TaskTreeGroup';
import { useProjectDetail } from '../ProjectDetailContext';
import { TreeAddButton } from './TreeShared';

const TaskTree: React.FC = () => {
  const { groups, addGroup, isReadOnly } = useProjectDetail();

  const handleAddQuickGroup = () => {
    // UPDATED: Text mặc định cho nút thêm nhanh
    addGroup(
      "Giai đoạn mới", 
      "Chưa có mô tả giai đoạn", 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );
  };

  return (
    <div className="relative">
      {/* Trục chính kết nối các Stage */}
      {groups.length > 1 && (
        <div 
          // Mobile: left-[36px] = p-4(16px) + w-10/2(20px) -> Tâm của badge
          // Desktop: left-[60px] = p-8(32px) + w-14/2(28px) -> Tâm của badge
          className="absolute left-[36px] sm:left-[60px] top-10 bottom-24 w-[1px] sm:w-[1.5px] bg-slate-600 -z-0"
          style={{ height: 'calc(100% - 140px)' }}
        ></div>
      )}

      <div className="space-y-12 sm:space-y-24 relative z-10">
        <div className="space-y-10 sm:space-y-16">
          {groups.map((group, index) => (
            <TaskTreeGroup 
              key={group.id}
              group={group}
              index={index}
            />
          ))}
        </div>

        {!isReadOnly && (
          <div className="pt-8 sm:pt-12 flex justify-center">
            <TreeAddButton 
              label="Thêm giai đoạn mới" 
              onClick={handleAddQuickGroup}
              size="lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTree;
