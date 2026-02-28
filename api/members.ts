
import { UserRole } from '../types';
import { authFetch } from './config';

export interface SystemUser {
  id: string;
  name: string;
  password?: string;
  role: UserRole;
  avatar_url?: string;
  
  // New Fields
  email?: string;
  phone?: string;
  position?: string;
  level?: string;
  department?: string;
  skills?: string;
  github_url?: string;
  
  created_at?: string;
}

export const membersApi = {
  fetchMembers: async (): Promise<SystemUser[]> => {
    return authFetch('/members');
  },

  fetchMemberById: async (id: string): Promise<SystemUser> => {
    return authFetch(`/members/${id}`);
  },

  addMember: async (member: SystemUser): Promise<SystemUser> => {
    return authFetch('/members', {
      method: 'POST',
      body: JSON.stringify(member)
    });
  },

  updateMember: async (id: string, data: Partial<SystemUser>): Promise<SystemUser> => {
    return authFetch(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteMember: async (id: string): Promise<boolean> => {
    const data = await authFetch(`/members/${id}`, {
      method: 'DELETE'
    });
    return data.success;
  },

  resetPassword: async (id: string): Promise<boolean> => {
    const data = await authFetch(`/members/${id}/reset-password`, {
      method: 'POST'
    });
    return data.success;
  }
};
