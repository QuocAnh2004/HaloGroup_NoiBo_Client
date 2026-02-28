
import React from 'react';
import { SystemUser } from '../../api/members';
import { Project, ProjectStatus, UserRole } from '../../types';
import { Folder, User, CheckCircle2, ShieldCheck, Fingerprint, Calendar } from 'lucide-react';
import { formatSimpleDate } from '../../utils';
import StatCard from '../shared/StatCard';

interface MemberStatsProps {
  member: SystemUser;
  projects: Project[];
}

const MemberStats: React.FC<MemberStatsProps> = ({ member, projects }) => {
  const isManager = member.role === UserRole.MANAGER;
  const activeProjectsCount = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
  const completedProjectsCount = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col items-center sm:items-start gap-6">
        <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-4xl text-white font-medium shadow-2xl ${isManager ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-400 shadow-slate-200'}`}>
          {getInitial(member.name)}
        </div>
        
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <h2 className="text-3xl font-medium text-slate-900 tracking-tight">
              {member.name}
            </h2>
            {isManager && (
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs justify-center sm:justify-start">
              <div className="flex items-center gap-1.5">
                <Fingerprint size={12} />
                <span>ID: {member.id}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>Tham gia: {member.created_at ? formatSimpleDate(member.created_at) : 'N/A'}</span>
              </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          label="Tổng dự án" 
          value={projects.length} 
          icon={<Folder size={24} strokeWidth={2} />} 
          variant="primary"
        />
        <StatCard 
          label="Đang tham gia" 
          value={activeProjectsCount} 
          icon={<User size={24} strokeWidth={2} />} 
          variant="secondary"
        />
        <StatCard 
          label="Đã hoàn thành" 
          value={completedProjectsCount} 
          icon={<CheckCircle2 size={24} strokeWidth={2} />} 
          variant="success"
        />
      </div>
    </div>
  );
};

export default MemberStats;
