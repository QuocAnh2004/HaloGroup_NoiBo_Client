
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membersApi, SystemUser } from '../api/members';
import { projectsApi } from '../api/projects';
import { Project } from '../types';
import BackButton from '../components/shared/BackButton';
import Loading from '../components/shared/Loading';
import MemberStats from '../components/member/MemberStats';
import MemberProjects from '../components/member/MemberProjects';
import MemberForm from '../components/member/MemberForm';

const MemberDetailPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<SystemUser | null>(null);
  const [participatedProjects, setParticipatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!memberId) return;
      setIsLoading(true);
      try {
        // 1. Fetch Member Info
        const memberData = await membersApi.fetchMemberById(memberId);
        setMember(memberData);

        // 2. Fetch Projects and Filter
        const allProjects = await projectsApi.fetchProjects();
        const memberProjects = allProjects.filter(p => 
          p.teamMembers.some(m => m.id === memberId)
        );
        setParticipatedProjects(memberProjects);

      } catch (error) {
        console.error("Failed to load member data", error);
        navigate('/'); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [memberId, navigate]);

  const handleMemberUpdate = (updatedMember: SystemUser) => {
    setMember(updatedMember);
  };

  const handleProjectClick = (projectId: string) => {
    // Manager click vào thì sang trang Edit
    navigate(`/project/${projectId}`);
  };

  if (isLoading || !member) {
    return <Loading variant="fullscreen" text="Đang tải hồ sơ nhân sự..." />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-light animate-in fade-in">
      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-4 md:px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton onClick={() => navigate(-1)} />
            {/* <BackButton onClick={() => navigate('/')} /> */}
            <h1 className="text-xl font-medium text-slate-900">Chi tiết nhân sự</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column (50%): Stats & Projects */}
          <div className="w-full lg:w-1/2 space-y-12">
            <MemberStats member={member} projects={participatedProjects} />
            <div className="w-full h-[1px] bg-slate-200/60 lg:hidden"></div>
            <MemberProjects 
              projects={participatedProjects} 
              onProjectClick={handleProjectClick}
            />
          </div>

          {/* Right Column (50%): Detailed Form */}
          <div className="w-full lg:w-1/2 lg:pl-10 lg:border-l lg:border-slate-200/60">
             <MemberForm member={member} onUpdate={handleMemberUpdate} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberDetailPage;
