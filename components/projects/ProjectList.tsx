
import React from 'react';
import { Search, CheckCircle2, Circle } from 'lucide-react';
import { useProjects } from './ProjectContext';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import Loading from '../shared/Loading';
import SearchBox from '../shared/SearchBox';
import TabTriggers, { TabOption } from '../shared/TabTriggers';

interface ProjectListProps {
  onProjectClick: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectClick }) => {
  const { 
    filteredProjects, 
    activeTab, 
    setActiveTab, 
    searchTerm, 
    setSearchTerm,
    activeCount,
    completedCount,
    isLoading 
  } = useProjects();

  const tabs: TabOption<'IN_PROGRESS' | 'COMPLETED'>[] = [
    {
      value: 'IN_PROGRESS',
      label: 'Đang làm',
      icon: <Circle size={18} />,
      count: activeCount,
      activeColorClass: 'text-indigo-600',
      activeBgClass: 'bg-indigo-50'
    },
    {
      value: 'COMPLETED',
      label: 'Đã xong',
      icon: <CheckCircle2 size={18} />,
      count: completedCount,
      activeColorClass: 'text-emerald-600',
      activeBgClass: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Dự Án</h2>
        <AddProjectModal />
      </div>

      {/* Tabs Selection */}
      <TabTriggers 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Toolbar: Search Only */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchBox 
          placeholder="Tìm kiếm dự án..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="w-full sm:max-w-xs"
        />
      </div>

      {/* Project Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="py-20">
           <Loading variant="component" text="Đang tải danh sách dự án..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} onClick={() => onProjectClick(project.id)} className="cursor-pointer">
              <ProjectCard project={project} />
            </div>
          ))}
          
          {filteredProjects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400 bg-white/40 rounded-[48px] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="opacity-30" />
              </div>
              <h4 className="text-lg font-medium text-slate-600 mb-1">Không tìm thấy dự án</h4>
              <p className="text-sm font-light">Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
