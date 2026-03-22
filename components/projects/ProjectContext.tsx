
import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Project, ProjectStatus, ProjectPriority } from '../../types';
import { projectsApi } from '../../api/projects';

interface ProjectContextType {
  projects: Project[];
  searchTerm: string;
  activeTab: 'IN_PROGRESS' | 'COMPLETED' | 'MEMBER_TASKS';
  filteredProjects: Project[];
  activeCount: number;
  completedCount: number;
  memberCount: number;
  totalMemberTasks: number;
  isLoading: boolean;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: 'IN_PROGRESS' | 'COMPLETED' | 'MEMBER_TASKS') => void;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: ReactNode; user?: any }> = ({ children, user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'IN_PROGRESS' | 'COMPLETED' | 'MEMBER_TASKS'>('IN_PROGRESS');
  const [searchParams, setSearchParams] = useSearchParams();
  const [memberCount, setMemberCount] = useState(0);
  const [totalMemberTasks, setTotalMemberTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load dự án và số lượng nhân viên khi mount/login
  useEffect(() => {
    const loadInitialData = async () => {
      const savedUser = localStorage.getItem('hola_user');
      if (!savedUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [projectsData, membersData] = await Promise.all([
          projectsApi.fetchProjects(),
          import('../../api/members').then(m => m.membersApi.fetchMembersWithTaskCount())
        ]);
        setProjects(projectsData);
        setMemberCount(membersData.length);
        const totalTasks = membersData.reduce((sum, m) => sum + (m.task_count || 0), 0);
        setTotalMemberTasks(totalTasks);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [user?.id]);

  // Đồng bộ activeTab với URL search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'member-tasks' && activeTab !== 'MEMBER_TASKS') {
      setActiveTab('MEMBER_TASKS');
    } else if (tabParam === 'completed' && activeTab !== 'COMPLETED') {
      setActiveTab('COMPLETED');
    } else if (!tabParam && activeTab === 'MEMBER_TASKS') {
      // Nếu không có param mà đang ở tab nhân viên thì về tab mặc định
      setActiveTab('IN_PROGRESS');
    }
  }, [searchParams, activeTab]);

  // Khi activeTab thay đổi bắng tay trên UI, cập nhật URL (tùy chọn nhưng tốt cho UX)
  const handleTabChange = (tab: 'IN_PROGRESS' | 'COMPLETED' | 'MEMBER_TASKS') => {
    setActiveTab(tab);
    
    // Nếu không ở trang chủ, chuyển về trang chủ
    if (location.pathname !== '/') {
      if (tab === 'MEMBER_TASKS') {
        navigate('/?tab=member-tasks');
      } else if (tab === 'COMPLETED') {
        navigate('/?tab=completed');
      } else {
        navigate('/');
      }
      return;
    }

    if (tab === 'MEMBER_TASKS') {
      setSearchParams({ tab: 'member-tasks' });
    } else if (tab === 'COMPLETED') {
      setSearchParams({ tab: 'completed' });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      setSearchParams(newParams);
    }
  };

  const addProject = async (project: Project) => {
    // Optimistic update: Cập nhật UI ngay lập tức
    const tempId = Date.now().toString();
    const tempProject = { ...project, id: tempId };
    setProjects(prev => [tempProject, ...prev]);

    try {
      // Gọi API thực tế
      const newProject = await projectsApi.createProject(project);
      // Cập nhật lại với dữ liệu thật từ server (đặc biệt là ID nếu server sinh ra)
      setProjects(prev => prev.map(p => p.id === tempId ? newProject : p));
    } catch (error) {
      console.error("Failed to add project:", error);
      // Rollback nếu lỗi
      setProjects(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

    try {
      await projectsApi.updateProject(id, data);
    } catch (error) {
      console.error("Failed to update project:", error);
      // Có thể implement rollback logic ở đây nếu cần thiết, 
      // nhưng với update đơn giản thì fetch lại data là an toàn nhất
      const freshData = await projectsApi.fetchProjects();
      setProjects(freshData);
    }
  };

  const activeCount = useMemo(() => 
    projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length, 
  [projects]);

  const completedCount = useMemo(() => 
    projects.filter(p => p.status === ProjectStatus.COMPLETED).length, 
  [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              project.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'IN_PROGRESS' 
          ? project.status === ProjectStatus.IN_PROGRESS 
          : project.status === ProjectStatus.COMPLETED;
        return matchesSearch && matchesTab;
      })
      .sort((a, b) => {
        const score = (p: ProjectPriority) => p === ProjectPriority.HIGH ? 3 : p === ProjectPriority.MEDIUM ? 2 : 1;
        return score(b.priority) - score(a.priority);
      });
  }, [projects, searchTerm, activeTab]);

  return (
    <ProjectContext.Provider value={{
      projects,
      searchTerm,
      activeTab,
      filteredProjects,
      activeCount,
      completedCount,
      memberCount,
      totalMemberTasks,
      isLoading,
      setSearchTerm,
      setActiveTab: handleTabChange,
      addProject,
      updateProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
