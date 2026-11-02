import { api } from '../../api/client';
import type { PageResult, Post, PostValues } from './types';

export const postsApi = {
  list: (page: number, username?: string) =>
    api<PageResult<Post>>(
      `${username ? `/users/${encodeURIComponent(username)}/posts` : '/posts'}?page=${page}&pageSize=5`,
    ),
  get: (id: string) => api<Post>(`/posts/${id}`),
  create: (values: PostValues) =>
    api<Post>('/posts', { method: 'POST', body: JSON.stringify(values) }),
  update: (id: string, values: PostValues) =>
    api<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(values) }),
  delete: (id: string) => api<void>(`/posts/${id}`, { method: 'DELETE' }),
};
