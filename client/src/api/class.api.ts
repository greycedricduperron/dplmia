import api from './client';
import type { Class } from '@dplmia/shared';

export const classApi = {
  create: (data: { name: string; country: string; language: string }) =>
    api.post<{ success: true; data: Class }>('/classes', data),

  getMine: () => api.get<{ success: true; data: Class }>('/classes/mine'),

  update: (data: Partial<{ name: string; country: string; language: string }>) =>
    api.patch<{ success: true; data: Class }>('/classes/mine', data),

  delete: () => api.delete('/classes/mine'),

  search: (name: string, country: string) =>
    api.get<{ success: true; data: Class | null }>('/classes/search', { params: { name, country } }),
};
