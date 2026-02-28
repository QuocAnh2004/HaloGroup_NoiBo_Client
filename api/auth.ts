
import { AuthenticatedUser } from '../types';
import { API_URL, handleResponse, authFetch } from './config';

export const authApi = {
  login: async (id: string, password: string): Promise<AuthenticatedUser> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    return handleResponse(response);
  },

  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    const data = await authFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ id, currentPassword, newPassword })
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
