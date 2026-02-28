
import React, { useMemo } from 'react';
import { Project, ProjectStatus } from '../../types';
import { Calendar, Flag, CheckCircle2, Layout, Github, Globe, Code2, Users, AlertTriangle, Hourglass, Server, Database, Cloud } from 'lucide-react';
import { formatProjectDates } from '../../utils';
import MemberItem from '../shared/MemberItem';

interface ProjectPreviewInfoProps {
  project: Project;
}

const ProjectPreviewInfo: React.FC<ProjectPreviewInfoProps> = ({ project }) => {
  const getTimeStatus = () => {
    if (project.status === ProjectStatus.COMPLETED) {
      return { 
        value: 'Xong', 
        label: 'Đã hoàn tất', 
        color: 'text-emerald-500', 
        icon: <CheckCircle2 size={16} />,
        bg: 'text-emerald-500' 
      };
    }

    const end = new Date(project.dueDate);
    const now = new Date();
    now.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        value: `${Math.abs(diffDays)} ngày`, 
        label: 'Đã trễ hạn', 
        color: 'text-rose-500', 
        icon: <AlertTriangle size={16} />,
        bg: 'text-rose-500'
      };
    }

    return { 
      value: `${diffDays} ngày`, 
      label: 'Thời gian còn lại', 
      color: 'text-slate-800', 
      icon: <Hourglass size={16} />,
      bg: 'text-indigo-500'
    };
  };

  const timeStatus = getTimeStatus();

  // Categorize Tech Stack
  const techCategories = useMemo(() => {
    const cats = {
        fe: { title: 'Frontend', icon: <Layout size={14} />, items: [] as string[] },
        be: { title: 'Backend', icon: <Server size={14} />, items: [] as string[] },
        db: { title: 'Database', icon: <Database size={14} />, items: [] as string[] },
        do: { title: 'DevOps & Infra', icon: <Cloud size={14} />, items: [] as string[] },
        other: { title: 'Khác', icon: <Code2 size={14} />, items: [] as string[] }
    };

    project.techStack.forEach(t => {
        if (t.startsWith('fe:')) cats.fe.items.push(t.substring(3));
        else if (t.startsWith('be:')) cats.be.items.push(t.substring(3));
        else if (t.startsWith('db:')) cats.db.items.push(t.substring(3));
        else if (t.startsWith('do:')) cats.do.items.push(t.substring(3));
        else cats.other.items.push(t); // Legacy support
    });

    // Merge 'other' into 'fe' or keep separate based on preference. 
    // Here we keep them but only render categories that have items.
    return Object.values(cats).filter(c => c.items.length > 0);
  }, [project.techStack]);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (project.progress / 100) * circumference;

  return (
    <div className="max-w-[1400px] mx-auto pt-32 px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Information - 7 Columns */}
        <div className="lg:col-span-7 space-y-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <Layout size={24} />
              <span className="text-sm font-medium tracking-[0.2em] uppercase">Trình diễn dự án</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-slate-900 leading-[1.1]">
              {project.name}
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-light max-w-2xl">
              {project.description}
            </p>
          </div>

          {/* Tech Stack (Redesigned Grid) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-slate-400">
              <Code2 size={20} />
              <span className="text-sm font-medium tracking-[0.2em] uppercase">Công nghệ cốt lõi</span>
            </div>
            
            {techCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {techCategories.map((cat) => (
                        <div key={cat.title} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-2 text-indigo-500 mb-3">
                                {cat.icon}
                                <span className="text-xs font-semibold uppercase tracking-wider">{cat.title}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {cat.items.map(tech => (
                                    <span key={tech} className="bg-white text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm border border-slate-100/50">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-300 italic font-light">Chưa cập nhật thông tin công nghệ.</p>
            )}
          </div>

          {/* Team Members */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-slate-400">
              <Users size={20} />
              <span className="text-sm font-medium tracking-[0.2em] uppercase">Đội ngũ thực hiện</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.teamMembers.length > 0 ? project.teamMembers.map((member) => (
                <MemberItem key={member.id} member={member} variant="full" />
              )) : (
                <p className="text-slate-300 italic font-light">Chưa có thông tin nhân sự.</p>
              )}
            </div>
          </div>

          <div className="flex gap-10 pt-4">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors">
                <Github size={24} />
                <span className="text-sm font-medium">Mã nguồn Github</span>
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-colors">
                <Globe size={24} />
                <span className="text-sm font-medium">Bản chạy thử</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Side: Visual Progress - 5 Columns */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-end">
          <div className="relative group">
            {/* Bold Circular Progress */}
            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
              {/* Track */}
              <circle
                cx="50%"
                cy="50%"
                r={`${radius}%`}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="24"
                strokeLinecap="round"
              />
              {/* Progress */}
              <circle
                cx="50%"
                cy="50%"
                r={`${radius}%`}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="24"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-indigo-600 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
              <span className="text-5xl md:text-7xl font-medium text-slate-900">{project.progress}%</span>
              <span className="text-xs md:text-sm text-slate-400 uppercase tracking-widest font-medium">Hoàn thành</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-16 w-full md:max-w-sm">
            {/* Time Card - Updated with Logic */}
            <div className={`p-6 bg-slate-50 rounded-[32px] space-y-2 ${timeStatus.color === 'text-rose-500' ? 'bg-rose-50' : ''}`}>
              <div className={`flex items-center gap-2 mb-1 ${timeStatus.bg}`}>
                {timeStatus.icon}
                <span className="text-[10px] font-medium uppercase tracking-wider">Tiến độ</span>
              </div>
              <div className={`text-2xl font-medium ${timeStatus.color}`}>{timeStatus.value}</div>
              <div className={`text-[10px] ${timeStatus.color === 'text-rose-500' ? 'text-rose-400' : 'text-slate-400'}`}>
                {timeStatus.label}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-[32px] space-y-2">
              <div className="flex items-center gap-2 text-indigo-500 mb-1">
                <Flag size={16} />
                <span className="text-[10px] font-medium uppercase tracking-wider">Ưu tiên</span>
              </div>
              <div className="text-2xl font-medium text-slate-800">{project.priority}</div>
              <div className="text-[10px] text-slate-400">Mức độ dự án</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Timeline / Info - 2 Columns now */}
      <div className="mt-32 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                  <Calendar size={18} />
                  <span className="text-xs font-medium uppercase tracking-widest">Thời gian dự án</span>
              </div>
              <div className="text-lg text-slate-800 font-medium">
                  {formatProjectDates(project.startDate, project.dueDate)}
              </div>
          </div>
          
          <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-medium uppercase tracking-widest">Trạng thái hiện tại</span>
              </div>
              <div className={`text-lg font-medium ${project.status === ProjectStatus.COMPLETED ? 'text-emerald-500' : 'text-indigo-600'}`}>
                  {project.status}
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProjectPreviewInfo;
