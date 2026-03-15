import api from './client';
import type { ClassConnection } from '../lib/types';

type R<T> = { success: true; data: T };

export const connectionApi = {
  send: (name: string, country: string) =>
    api.post<R<ClassConnection>>('/connections', { name, country }),

  list: () => api.get<R<ClassConnection[]>>('/connections'),

  pending: () => api.get<R<ClassConnection[]>>('/connections/pending'),

  accept: (id: string) => api.patch<R<ClassConnection>>(`/connections/${id}/accept`),

  reject: (id: string) => api.patch<R<ClassConnection>>(`/connections/${id}/reject`),

  remove: (id: string) => api.delete(`/connections/${id}`),
};
