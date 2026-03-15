import api from './client';
import type { Post, Comment } from '../lib/types';

type R<T> = { success: true; data: T };

export const feedApi = {
  getFeed: () => api.get<R<Post[]>>('/feed'),
  getGallery: () => api.get<R<Post[]>>('/feed/gallery'),
  getAudio: () => api.get<R<Post[]>>('/feed/audio'),

  createText: (data: { title: string; content?: string }) =>
    api.post<R<Post>>('/feed/posts', data),

  createImage: (title: string, content: string | undefined, file: File) => {
    const form = new FormData();
    form.append('title', title);
    if (content) form.append('content', content);
    form.append('file', file);
    return api.post<R<Post>>('/feed/posts/image', form);
  },

  createAudio: (title: string, content: string | undefined, file: File) => {
    const form = new FormData();
    form.append('title', title);
    if (content) form.append('content', content);
    form.append('file', file);
    return api.post<R<Post>>('/feed/posts/audio', form);
  },

  deletePost: (id: string) => api.delete(`/feed/posts/${id}`),

  getComments: (postId: string) => api.get<R<Comment[]>>(`/feed/posts/${postId}/comments`),

  addComment: (postId: string, content: string) =>
    api.post<R<Comment>>(`/feed/posts/${postId}/comments`, { content }),

  deleteComment: (postId: string, commentId: string) =>
    api.delete(`/feed/posts/${postId}/comments/${commentId}`),
};
