import { Department, DepartmentStatus } from '../types';
import { SystemUser } from './members';
import { authFetch } from './config';

export const departmentsApi = {
  fetchDepartments: async (): Promise<Department[]> => {
    return authFetch('/departments');
  },

  fetchDepartmentById: async (id: string): Promise<Department> => {
    return authFetch(`/departments/${id}`);
  },

  createDepartment: async (department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> => {
    return authFetch('/departments', {
      method: 'POST',
      body: JSON.stringify(department)
    });
  },

  updateDepartment: async (id: string, department: Partial<Department>): Promise<Department> => {
    return authFetch(`/departments/${id}`, {
      method: 'PUT', 
      body: JSON.stringify(department)
    });
  },

  deleteDepartment: async (id: string): Promise<boolean> => {
    const data = await authFetch(`/departments/${id}`, {
      method: 'DELETE'
    });
    return data.success;
  },

  fetchDepartmentMembers: async (departmentId: string): Promise<SystemUser[]> => {
    return authFetch(`/departments/${departmentId}/members`);
  }
};