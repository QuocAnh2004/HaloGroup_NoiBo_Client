
import React from 'react';
import { Project } from '../../types';
import ProjectCard from '../projects/ProjectCard';
import { Folder } from 'lucide-react';

interface MemberProjectsProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
}

const MemberProjects: React.FC<MemberProjectsProps> = ({ projects, onProjectClick }) => {
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-medium text-slate-800">Dự án tham gia</h3>
        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-medium">{projects.length}</span>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => onProjectClick && onProjectClick(project.id)} 
              className={`h-full ${onProjectClick ? 'cursor-pointer' : ''}`}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 bg-white rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
          <Folder size={48} className="opacity-20 mb-4" />
          <p className="font-light">Nhân viên này chưa tham gia dự án nào.</p>
        </div>
      )}
    </div>
  );
};

export default MemberProjects;
