import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { postsApi } from './api';

export function usePosts(page: number, username?: string) {
  return useQuery({
    queryKey: ['posts', 'list', username ?? 'all', page],
    queryFn: () => postsApi.list(page, username),
    placeholderData: keepPreviousData,
  });
}
export function usePost(id?: string) {
  return useQuery({
    queryKey: ['posts', 'detail', id],
    queryFn: () => postsApi.get(id!),
    enabled: !!id,
    retry: false,
  });
}
