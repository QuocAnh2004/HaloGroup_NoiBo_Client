
import React from 'react';
import { Users, X } from 'lucide-react';
import { TeamMember } from '../../types';
import SelectMemberModal from './SelectMemberModal';
import { useProjectDetail } from './ProjectDetailContext';
import MemberItem from '../shared/MemberItem';

const ProjectDetailMember: React.FC = () => {
  const { project, updateProject, isReadOnly } = useProjectDetail();
  const members = project.teamMembers;

  // Logic Toggle: Nếu đã có thì xóa, chưa có thì thêm
  const handleToggleMember = (member: TeamMember) => {
    if (isReadOnly) return;
    const isSelected = members.some(m => m.id === member.id);
    
    if (isSelected) {
      updateProject({ teamMembers: members.filter(m => m.id !== member.id) });
    } else {
      updateProject({ teamMembers: [...members, member] });
    }
  };

  const handleRemove = (id: string) => {
    if (isReadOnly) return;
    updateProject({ teamMembers: members.filter(m => m.id !== id) });
  };

  return (
    <section className="w-full bg-white border-b border-slate-50 px-4 md:px-10 py-6 md:py-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Header Section */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Users size={20} className="md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-base md:text-lg font-medium text-slate-800 tracking-tight">Thành viên</h3>
                <span className="text-[9px] md:text-[11px] text-slate-400 font-light uppercase tracking-wider truncate">
                  {members.length} nhân sự
                </span>
              </div>
            </div>

            {/* Modal Trigger - Hide if ReadOnly */}
            {!isReadOnly && (
              <div className="shrink-0">
                <SelectMemberModal 
                  onSelect={handleToggleMember}
                  selectedMemberIds={members.map(m => m.id)}
                />
              </div>
            )}
          </div>

          {/* Member List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((member) => (
              <MemberItem 
                key={member.id}
                member={member}
                variant="full"
                className={isReadOnly ? 'opacity-80' : ''}
                action={!isReadOnly && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemove(member.id); }}
                    className="w-8 h-8 bg-white text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm active:scale-95"
                    title="Gỡ khỏi dự án"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              />
            ))}

            {members.length === 0 && (
              <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-[28px] md:rounded-[32px] flex flex-col items-center justify-center text-slate-300">
                <p className="text-xs md:text-sm font-light italic">Chưa có nhân sự nào được chỉ định</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectDetailMember;
