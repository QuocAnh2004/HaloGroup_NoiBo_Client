
import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { Project, ProjectStatus, ProjectPriority } from '../../types';
import { projectsApi } from '../../api/projects';

interface ProjectContextType {
  projects: Project[];
  searchTerm: string;
  activeTab: 'IN_PROGRESS' | 'COMPLETED';
  filteredProjects: Project[];
  activeCount: number;
  completedCount: number;
  isLoading: boolean;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: 'IN_PROGRESS' | 'COMPLETED') => void;
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

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  const [isLoading, setIsLoading] = useState(true);

  // Load dự án khi mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const data = await projectsApi.fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

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
      isLoading,
      setSearchTerm,
      setActiveTab,
      addProject,
      updateProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
