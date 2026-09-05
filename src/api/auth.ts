import { api } from './client';

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/login', { username, password });
    if (res?.token) {
      api.setToken(res.token);
    }
    return res;
  },
  getCurrentUser: () => api.get<UserInfo>('/api/auth/me'),
  logout: () => {
    api.setToken(null);
  },
};
