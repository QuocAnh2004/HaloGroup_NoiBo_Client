
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '../types';
import ProjectDetailHeader from '../components/project-detail/ProjectDetailHeader';
import ProjectDetailInfo from '../components/project-detail/ProjectDetailInfo';
import ProjectDetailTask from '../components/project-detail/ProjectDetailTask';
import ProjectDetailMember from '../components/project-detail/ProjectDetailMember';
import ProjectNotificationsManager from '../components/project-detail/ProjectNotificationsManager'; // Import mới
import { ProjectDetailProvider } from '../components/project-detail/ProjectDetailContext';
import { projectsApi } from '../api/projects';
import Loading from '../components/shared/Loading';

const ProjectDetailContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-light flex flex-col">
      <ProjectDetailHeader 
        onBack={() => navigate('/')} 
      />

      {/* 1. Project Team Section (Đưa lên đầu để ưu tiên gán thành viên) */}
      <ProjectDetailMember />

      {/* 2. Notifications Manager Section */}
      <ProjectNotificationsManager />

      {/* 3. Main Container - Split Layout 5:5 */}
      <div className="flex flex-1 flex-col lg:flex-row relative">
        
        {/* Left Column: Deployment Tasks - 50% */}
        <div className="w-full lg:w-[50%] px-4 md:px-8 py-10 bg-slate-50/50 min-h-full">
          <ProjectDetailTask />
        </div>

        {/* Right Column: Project Information - 50% */}
        <div className="w-full lg:w-[50%] px-4 md:px-8 py-10 border-l border-slate-100 bg-white">
          <ProjectDetailInfo />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load project data from API
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const allProjects = await projectsApi.fetchProjects();
        const found = allProjects.find(p => p.id === projectId);
        if (found) {
          setProject(found);
        } else {
          setError("Không tìm thấy dự án");
        }
      } catch (err) {
        setError("Lỗi khi tải dự án");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return <Loading variant="fullscreen" text="Đang tải dữ liệu dự án..." />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-rose-500 font-medium">{error || "Dự án không tồn tại"}</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Quay lại</button>
      </div>
    );
  }

  return (
    <ProjectDetailProvider initialProject={project}>
      <ProjectDetailContent />
    </ProjectDetailProvider>
  );
};

export default ProjectDetailPage;
