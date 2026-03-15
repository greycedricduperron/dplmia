import api from './client';
import type { Teacher } from '@dplmia/shared';

export const authApi = {
  register: (data: { name: string; email: string; password: string; country: string; language: string }) =>
    api.post<{ success: true; data: Teacher }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: true; data: Teacher }>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ success: true; data: Teacher }>('/auth/me'),
};
