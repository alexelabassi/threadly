import { api, resetCsrf } from '../../api/client';
import type { CurrentUser, LoginValues, RegisterValues } from './types';

export const authApi = {
  me: () => api<CurrentUser>('/auth/me'),
  async login(values: LoginValues) {
    const user = await api<CurrentUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    resetCsrf();
    return user;
  },
  async register(values: RegisterValues) {
    const user = await api<CurrentUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    resetCsrf();
    return user;
  },
  async logout() {
    await api<void>('/auth/logout', { method: 'POST' });
    resetCsrf();
  },
};
