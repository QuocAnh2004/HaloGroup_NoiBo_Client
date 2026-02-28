
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, UserRole, AuthenticatedUser } from '../types';
import ProjectPreviewInfo from '../components/preview/ProjectPreviewInfo';
import ProjectPreviewTaskTree from '../components/preview/ProjectPreviewTaskTree';
import PreviewHeader from '../components/preview/PreviewHeader';
import ProjectPreviewMemberSummary from '../components/preview/ProjectPreviewMemberSummary';
import ProjectPreviewNotifications from '../components/preview/ProjectPreviewNotifications'; 
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { ShieldAlert, Lock } from 'lucide-react';
import Loading from '../components/shared/Loading';

interface ProjectPreviewPageProps {
  currentUser: AuthenticatedUser;
  onLogout?: () => void;
}

const ProjectPreviewPage: React.FC<ProjectPreviewPageProps> = ({ currentUser, onLogout }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      setIsLoading(true);
      setError(null);
      setAccessDenied(false);

      try {
        const allProjects = await projectsApi.fetchProjects();
        const foundProject = allProjects.find(p => p.id === projectId);

        if (!foundProject) {
          setError("Dự án không tồn tại hoặc đã bị xóa.");
          return;
        }

        // KIỂM TRA QUYỀN TRUY CẬP TRÊN CLIENT (UX)
        if (currentUser.role === UserRole.MEMBER) {
          const isAssigned = foundProject.teamMembers.some(m => m.id === currentUser.id);
          if (!isAssigned) {
            setAccessDenied(true);
            setIsLoading(false);
            return;
          }
        }

        try {
            // Lấy task và đảm bảo sắp xếp đúng từ API
            const taskGroups = await tasksApi.fetchTasksByProjectId(projectId);
            setProject({
                ...foundProject,
                taskGroups: taskGroups
            });
        } catch (apiErr: any) {
            if (apiErr.message.includes('403') || apiErr.message.includes('không có quyền')) {
                setAccessDenied(true);
            } else {
                console.error("Task API Error:", apiErr);
                setProject(foundProject);
            }
        }

      } catch (err) {
        console.error("Error loading preview data:", err);
        setError("Không thể tải dữ liệu dự án.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, currentUser]);

  const isManager = currentUser.role === UserRole.MANAGER;
  const isMember = currentUser.role === UserRole.MEMBER;

  const handleExit = () => {
    if (isManager) {
      // Manager: Quay về trang chỉnh sửa chi tiết
      navigate(`/project/${projectId}`);
    } else {
      // Member: Quay về trang thông tin cá nhân (MemberPreviewPage)
      navigate(`/member-info/${currentUser.id}`);
    }
  };

  if (isLoading) {
    return <Loading variant="fullscreen" text="Đang xác thực quyền truy cập..." />;
  }

  if (accessDenied) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-100/50 rounded-full blur-[120px] -z-0"></div>

            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 p-10 text-center space-y-6 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-rose-100">
                    <Lock size={32} strokeWidth={1.5} />
                </div>
                
                <div className="space-y-3">
                    <h2 className="text-2xl font-medium text-slate-900">Quyền truy cập bị từ chối</h2>
                    <p className="text-slate-400 font-light text-sm leading-relaxed">
                        Tài khoản <span className="text-slate-700 font-medium">{currentUser.name}</span> ({currentUser.id}) không nằm trong danh sách thành viên của dự án này.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 text-left">
                    <ShieldAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 font-light">
                        Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ với Quản lý dự án để được cấp quyền.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <button 
                        onClick={onLogout}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-medium shadow-lg hover:bg-slate-800 transition-all active:scale-95 text-sm"
                    >
                        Đăng nhập tài khoản khác
                    </button>
                </div>
            </div>
        </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-rose-500 font-medium">{error || "Lỗi không xác định"}</p>
        <button onClick={handleExit} className="text-indigo-600 hover:underline">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-light overflow-x-hidden animate-in">
      {/* Unified Header */}
      <PreviewHeader 
        onBack={handleExit} 
        role={currentUser.role} 
        title={project.name} 
        subtitle="Cổng thông tin dự án"
      />

      {/* Main Content Area */}
      <div className="pt-0">
        
        {/* 0. Notifications View (Hiển thị trên cùng) */}
        <ProjectPreviewNotifications 
            projectId={project.id} 
            currentUserId={currentUser.id} 
            userRole={currentUser.role}
        />

        {/* 1. Top: Project Info (Full Width) */}
        <ProjectPreviewInfo project={project} />
        
        {/* 2. Bottom: Split Layout (Left: Member, Right: Task Tree) */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-24 py-10">
          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Left Column: Member Summary (40%) - Chỉ hiện cho Member */}
            {isMember && (
              <div className="w-full lg:w-[40%] relative">
                <div className="lg:sticky lg:top-24">
                  <ProjectPreviewMemberSummary 
                    project={project} 
                    currentUserId={currentUser.id} 
                  />
                </div>
              </div>
            )}

            {/* Right Column: Task Tree (60% or Full if Manager) */}
            <div className={isMember ? "w-full lg:w-[60%]" : "w-full"}>
               {project.taskGroups && (
                <ProjectPreviewTaskTree 
                  groups={project.taskGroups} 
                  projectMembers={project.teamMembers} 
                />
              )}
            </div>

            {/* Vertical Divider for large screens (Only if split) */}
            {isMember && (
              <div className="hidden lg:block absolute left-[40%] top-0 bottom-0 w-[1px] bg-slate-100 -ml-[1px]"></div>
            )}

          </div>
        </div>

      </div>
      
      {/* Background Decor */}
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-indigo-50 rounded-full blur-[120px] -z-10 opacity-60"></div>
      <div className="fixed top-32 -left-32 w-64 h-64 bg-slate-100 rounded-full blur-[100px] -z-10 opacity-40"></div>
    </div>
  );
};

export default ProjectPreviewPage;
