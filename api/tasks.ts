
import { TaskGroup, TaskItem, CheckItem } from '../types';
import { authFetch } from './config';

export const tasksApi = {
  fetchTasksByProjectId: async (projectId: string): Promise<TaskGroup[]> => {
    return authFetch(`/tasks/${projectId}`);
  },

  // --- Group Operations ---
  addGroup: async (projectId: string, group: TaskGroup): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups`, {
      method: 'POST',
      body: JSON.stringify(group)
    });
    return data.success;
  },

  updateGroup: async (projectId: string, groupId: string, updates: Partial<TaskGroup>): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return data.success;
  },

  deleteGroup: async (projectId: string, groupId: string): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}`, {
      method: 'DELETE'
    });
    return data.success;
  },

  // --- Item Operations ---
  addItem: async (projectId: string, groupId: string, item: TaskItem): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}/items`, {
      method: 'POST',
      body: JSON.stringify(item)
    });
    return data.success;
  },

  updateItem: async (projectId: string, groupId: string, itemId: string, updates: Partial<TaskItem>): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return data.success;
  },

  deleteItem: async (projectId: string, groupId: string, itemId: string): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}/items/${itemId}`, {
      method: 'DELETE'
    });
    return data.success;
  },

  // --- Check Operations ---
  addCheck: async (projectId: string, groupId: string, itemId: string, check: CheckItem): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}/items/${itemId}/checks`, {
      method: 'POST',
      body: JSON.stringify(check)
    });
    return data.success;
  },

  updateCheck: async (projectId: string, groupId: string, itemId: string, checkId: string, updates: Partial<CheckItem>): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}/items/${itemId}/checks/${checkId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return data.success;
  },

  deleteCheck: async (projectId: string, groupId: string, itemId: string, checkId: string): Promise<boolean> => {
    const data = await authFetch(`/tasks/${projectId}/groups/${groupId}/items/${itemId}/checks/${checkId}`, {
      method: 'DELETE'
    });
    return data.success;
  }
};
