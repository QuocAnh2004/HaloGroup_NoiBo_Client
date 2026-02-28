
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useProjectDetail } from '../ProjectDetailContext';
import { TreeMemberButton } from './TreeShared';
import ModalLayout from '../../shared/ModalLayout';
import MemberItem from '../../shared/MemberItem';

interface TaskTreeMemberProps {
  assignedMemberIds: string[];
  onToggle: (memberId: string) => void;
  title: string;
}

const TaskTreeMember: React.FC<TaskTreeMemberProps> = ({
  assignedMemberIds,
  onToggle,
  title
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { project } = useProjectDetail();
  const projectMembers = project.teamMembers;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <TreeMemberButton onClick={handleOpen} size={18} />

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title="Gán nhân sự"
        subTitle={`Phân bổ thành viên thực hiện cho: ${title}`}
        className="max-w-md"
      >
        <div className="space-y-3">
            {projectMembers.map((member) => {
            const isSelected = assignedMemberIds.includes(member.id);
            return (
                <MemberItem 
                    key={member.id}
                    member={member}
                    variant="full"
                    onClick={() => onToggle(member.id)}
                    className={isSelected ? 'bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200' : ''}
                    action={isSelected && <Check size={18} strokeWidth={3} className="text-indigo-600" />}
                />
            );
            })}

            {projectMembers.length === 0 && (
            <div className="py-8 text-center text-[11px] text-slate-300 font-light italic">
                Dự án chưa có nhân sự nào.
            </div>
            )}
        </div>

        <div className="pt-6 flex justify-end">
            <button 
            onClick={handleClose}
            className="w-full py-3 bg-slate-900 text-white rounded-[20px] text-sm font-medium hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
            Xong
            </button>
        </div>
      </ModalLayout>
    </>
  );
};

export default TaskTreeMember;
