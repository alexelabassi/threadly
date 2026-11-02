import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '../../api/client';
import { authApi } from './api';

export const sessionKey = ['session'] as const;
export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}
export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      client.setQueryData(sessionKey, null);
      void client.invalidateQueries({ queryKey: ['posts'] });
      toast.success('You’re signed out. See you soon.');
    },
    onError: (e) => toast.error(e.message),
  });
}
