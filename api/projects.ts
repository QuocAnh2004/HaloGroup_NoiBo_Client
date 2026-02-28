
import { Project, ProjectNotification } from '../types';
import { authFetch } from './config';

export const projectsApi = {
  fetchProjects: async (): Promise<Project[]> => {
    return authFetch('/projects');
  },

  createProject: async (project: Project): Promise<Project> => {
    return authFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    return authFetch(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteProject: async (id: string): Promise<boolean> => {
    const data = await authFetch(`/projects/${id}`, {
      method: 'DELETE'
    });
    return data.success;
  },

  // --- Notification Methods (Real API) ---
  
  fetchNotifications: async (projectId: string): Promise<ProjectNotification[]> => {
    return authFetch(`/projects/${projectId}/notifications`);
  },

  sendNotification: async (projectId: string, notification: Omit<ProjectNotification, 'id' | 'createdAt'>): Promise<ProjectNotification> => {
    return authFetch(`/projects/${projectId}/notifications`, {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  }
};
