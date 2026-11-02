import { api } from '../../api/client';
export interface PublicUser {
  id: string;
  username: string;
  createdAt: string;
  postCount: number;
}
export const getUser = (username: string) =>
  api<PublicUser>(`/users/${encodeURIComponent(username)}`);
