
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/projects/ProjectList';
import ProjectTeam from '../components/projects/ProjectTeam';
import ProjectHeader from '../components/projects/ProjectHeader';
import { ProjectProvider } from '../components/projects/ProjectContext';

interface ProjectPageProps {
  onLogout: () => void;
}

const ProjectPageContent: React.FC<ProjectPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleProjectClick = (id: string) => {
    navigate(`/project/${id}`);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 font-light">
      <ProjectHeader onLogout={onLogout} onChangePassword={handleChangePassword} />

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8 md:mt-12">
        {/* Layout: Main (65%) - Side (35%) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Left Column: Projects */}
          <div className="lg:w-[100%] min-w-0">
            <ProjectList onProjectClick={handleProjectClick} />
          </div>

          {/* Right Column: Team - Sticky on desktop */}
          {/* <div className="lg:w-[35%] relative">
             <div className="sticky top-28">
               <ProjectTeam />
             </div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

const ProjectPage: React.FC<ProjectPageProps> = (props) => {
  return (
    <ProjectProvider>
      <ProjectPageContent {...props} />
    </ProjectProvider>
  );
};

export default ProjectPage;
