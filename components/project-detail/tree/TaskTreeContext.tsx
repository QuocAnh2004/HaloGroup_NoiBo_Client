import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { TaskGroup, TaskItem, CheckItem, TeamMember, ProjectStatus, Project } from '../../../types';
import { tasksApi } from '../../../api/tasks';
import { projectsApi } from '../../../api/projects';

interface ProjectDetailContextType {
  // Project Data
  project: Project;
  updateProject: (data: Partial<Project>) => Promise<void>;
  deleteProject: () => Promise<void>; 
  
  // Task Data
  groups: TaskGroup[];
  totalProgress: number;
  editingId: string | null;
  isLoading: boolean;
  isSyncing: boolean; // Trạng thái đang lưu ngầm
  isReadOnly: boolean;
  setEditingId: (id: string | null) => void;
  
  // Group operations
  addGroup: (title: string, description: string, estimatedTime: string) => void;
  updateGroup: (id: string, data: Partial<TaskGroup>) => void;
  deleteGroup: (id: string) => void;
  toggleMemberInGroup: (groupId: string, memberId: string) => void;
  
  // Item operations
  addItem: (groupId: string) => void;
  updateItem: (groupId: string, itemId: string, data: Partial<TaskItem>) => void;
  deleteItem: (groupId: string, itemId: string) => void;
  toggleMemberInItem: (groupId: string, itemId: string, memberId: string) => void;
  
  // Check operations
  toggleCheck: (groupId: string, itemId: string, checkId: string) => void;
  addCheck: (groupId: string, itemId: string) => void;
  updateCheck: (groupId: string, itemId: string, checkId: string, title: string) => void;
  deleteCheck: (groupId: string, itemId: string, checkId: string) => void;
}

const ProjectDetailContext = createContext<ProjectDetailContextType | undefined>(undefined);

export const useProjectDetail = () => {
  const context = useContext(ProjectDetailContext);
  if (!context) {
    throw new Error('useProjectDetail must be used within a ProjectDetailProvider');
  }
  return context;
};

interface ProjectDetailProviderProps {
  children: ReactNode;
  initialProject: Project;
}

export const ProjectDetailProvider: React.FC<ProjectDetailProviderProps> = ({ 
  children, 
  initialProject
}) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // New state for background sync
  
  // Update local project state when prop changes
  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  // Helper: Sort function
  const sortByDate = useCallback((a: any, b: any) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeA - timeB;
  }, []);

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const data = await tasksApi.fetchTasksByProjectId(project.id);
        // Ensure initial load is sorted
        const sortedGroups = data.sort(sortByDate).map(g => ({
            ...g,
            taskItems: g.taskItems ? g.taskItems.sort(sortByDate) : []
        }));
        setGroups(sortedGroups);
      } catch (error) {
        console.error("Failed to load tasks", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [project.id, sortByDate]);

  // Derived State
  const isReadOnly = project.status === ProjectStatus.COMPLETED;

  const totalProgress = useMemo(() => {
    const allCheckItems = groups.flatMap(g => g.taskItems.flatMap(i => i.checkItems));
    if (allCheckItems.length === 0) return 0;
    const completedCount = allCheckItems.filter(c => c.completed).length;
    return Math.round((completedCount / allCheckItems.length) * 100);
  }, [groups]);

  // Wrapper for background API calls to track syncing state
  const backgroundSave = useCallback(async (promise: Promise<any>) => {
    setIsSyncing(true);
    try {
        await promise;
    } catch (e) {
        console.error("Background save failed:", e);
    } finally {
        // Add a small delay so the spinner doesn't flash too quickly
        setTimeout(() => setIsSyncing(false), 500);
    }
  }, []);

  // --- Project Operations ---
  const updateProjectLogic = useCallback(async (data: Partial<Project>) => {
    setProject(prev => ({ ...prev, ...data }));
    backgroundSave(projectsApi.updateProject(project.id, data));
  }, [project.id, backgroundSave]);

  const deleteProjectLogic = useCallback(async () => {
    try {
      await projectsApi.deleteProject(project.id);
    } catch (e) {
      console.error("Failed to delete project", e);
      throw e;
    }
  }, [project.id]);

  useEffect(() => {
    if (!isLoading && project.progress !== totalProgress) {
        const timer = setTimeout(() => {
            updateProjectLogic({ progress: totalProgress });
        }, 1000); 
        return () => clearTimeout(timer);
    }
  }, [totalProgress, project.progress, isLoading, updateProjectLogic]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Task Operations (Optimized with useCallback) ---
  
  const addGroup = useCallback((title: string, description: string, estimatedTime: string) => {
    if (isReadOnly) return;
    const createdAt = new Date().toISOString();
    const newGroup: TaskGroup = {
      id: generateId(),
      title,
      description,
      estimatedTime,
      taskItems: [],
      assignedMemberIds: [],
      createdAt
    };
    
    setGroups(prev => [...prev, newGroup].sort(sortByDate));
    backgroundSave(tasksApi.addGroup(project.id, newGroup));
  }, [isReadOnly, project.id, sortByDate, backgroundSave]);

  const updateGroup = useCallback((groupId: string, data: Partial<TaskGroup>) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...data } : g));
    backgroundSave(tasksApi.updateGroup(project.id, groupId, data));
  }, [isReadOnly, project.id, backgroundSave]);

  const deleteGroup = useCallback((groupId: string) => {
    if (isReadOnly) return;
    setGroups(prev => prev.filter(g => g.id !== groupId));
    backgroundSave(tasksApi.deleteGroup(project.id, groupId));
  }, [isReadOnly, project.id, backgroundSave]);

  const toggleMemberInGroup = useCallback((groupId: string, memberId: string) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        const currentIds = g.assignedMemberIds || [];
        const finalIds = currentIds.includes(memberId) 
            ? currentIds.filter(id => id !== memberId) 
            : [...currentIds, memberId];
        
        backgroundSave(tasksApi.updateGroup(project.id, groupId, { assignedMemberIds: finalIds }));
        
        return { ...g, assignedMemberIds: finalIds };
    }));
  }, [isReadOnly, project.id, backgroundSave]);

  const addItem = useCallback((groupId: string) => {
    if (isReadOnly) return;
    const createdAt = new Date().toISOString();
    
    setGroups(prev => {
        const group = prev.find(g => g.id === groupId);
        if (!group) return prev;

        const newItem: TaskItem = {
            id: generateId(),
            title: 'Nhiệm vụ mới',
            description: '',
            estimatedTime: group.estimatedTime || new Date().toISOString(),
            checkItems: [],
            assignedMemberIds: [],
            createdAt
        };

        backgroundSave(tasksApi.addItem(project.id, groupId, newItem));

        return prev.map(g => {
            if (g.id !== groupId) return g;
            const updatedItems = [...g.taskItems, newItem].sort(sortByDate);
            return { ...g, taskItems: updatedItems };
        });
    });
  }, [isReadOnly, project.id, sortByDate, backgroundSave]);

  const updateItem = useCallback((groupId: string, itemId: string, data: Partial<TaskItem>) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const updatedItems = g.taskItems.map(i => i.id === itemId ? { ...i, ...data } : i);
      return { ...g, taskItems: updatedItems };
    }));
    backgroundSave(tasksApi.updateItem(project.id, groupId, itemId, data));
  }, [isReadOnly, project.id, backgroundSave]);

  const deleteItem = useCallback((groupId: string, itemId: string) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, taskItems: g.taskItems.filter(i => i.id !== itemId) };
    }));
    backgroundSave(tasksApi.deleteItem(project.id, groupId, itemId));
  }, [isReadOnly, project.id, backgroundSave]);

  const toggleMemberInItem = useCallback((groupId: string, itemId: string, memberId: string) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        return {
            ...g,
            taskItems: g.taskItems.map(i => {
                if (i.id !== itemId) return i;
                const currentIds = i.assignedMemberIds || [];
                const finalIds = currentIds.includes(memberId) ? currentIds.filter(id => id !== memberId) : [...currentIds, memberId];
                
                backgroundSave(tasksApi.updateItem(project.id, groupId, itemId, { assignedMemberIds: finalIds }));
                return { ...i, assignedMemberIds: finalIds };
            })
        };
    }));
  }, [isReadOnly, project.id, backgroundSave]);

  const toggleCheck = useCallback((groupId: string, itemId: string, checkId: string) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        taskItems: g.taskItems.map(i => {
          if (i.id !== itemId) return i;
          let newStatus = false;
          const updatedChecks = i.checkItems.map(c => {
              if (c.id === checkId) {
                  newStatus = !c.completed;
                  return { ...c, completed: newStatus };
              }
              return c;
          });
          
          if (updatedChecks !== i.checkItems) {
             backgroundSave(tasksApi.updateCheck(project.id, groupId, itemId, checkId, { completed: newStatus }));
          }
          return { ...i, checkItems: updatedChecks };
        })
      };
    }));
  }, [isReadOnly, project.id, backgroundSave]);

  const addCheck = useCallback((groupId: string, itemId: string) => {
    if (isReadOnly) return;
    const newCheck: CheckItem = { id: generateId(), title: 'Công việc cụ thể', completed: false };
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        taskItems: g.taskItems.map(i => {
          if (i.id !== itemId) return i;
          return { ...i, checkItems: [...i.checkItems, newCheck] };
        })
      };
    }));
    backgroundSave(tasksApi.addCheck(project.id, groupId, itemId, newCheck));
  }, [isReadOnly, project.id, backgroundSave]);

  const updateCheck = useCallback((groupId: string, itemId: string, checkId: string, title: string) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        taskItems: g.taskItems.map(i => {
          if (i.id !== itemId) return i;
          return {
            ...i,
            checkItems: i.checkItems.map(c => c.id === checkId ? { ...c, title } : c)
          };
        })
      };
    }));
    backgroundSave(tasksApi.updateCheck(project.id, groupId, itemId, checkId, { title }));
  }, [isReadOnly, project.id, backgroundSave]);

  const deleteCheck = useCallback((groupId: string, itemId: string, checkId: string) => {
    if (isReadOnly) return;
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        taskItems: g.taskItems.map(i => {
          if (i.id !== itemId) return i;
          return { ...i, checkItems: i.checkItems.filter(c => c.id !== checkId) };
        })
      };
    }));
    backgroundSave(tasksApi.deleteCheck(project.id, groupId, itemId, checkId));
  }, [isReadOnly, project.id, backgroundSave]);

  // Memoize the value provided to context consumers
  const value = useMemo(() => ({ 
      project,
      updateProject: updateProjectLogic,
      deleteProject: deleteProjectLogic,
      groups,
      totalProgress,
      editingId, 
      setEditingId,
      isLoading,
      isSyncing, // Expose syncing state
      isReadOnly,
      addGroup,
      updateGroup, 
      deleteGroup,
      toggleMemberInGroup,
      addItem,
      updateItem, 
      deleteItem,
      toggleMemberInItem,
      toggleCheck, 
      addCheck,
      updateCheck,
      deleteCheck
  }), [
      project, updateProjectLogic, deleteProjectLogic, groups, totalProgress, editingId, isLoading, isSyncing, isReadOnly,
      addGroup, updateGroup, deleteGroup, toggleMemberInGroup,
      addItem, updateItem, deleteItem, toggleMemberInItem,
      toggleCheck, addCheck, updateCheck, deleteCheck
  ]);

  return (
    <ProjectDetailContext.Provider value={value}>
      {children}
    </ProjectDetailContext.Provider>
  );
};