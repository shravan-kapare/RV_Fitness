import { create } from 'zustand';
import api from '@/lib/api';
import {
  getToken,
  getUser,
  setToken,
  setRefreshToken,
  setUser,
  clearAuth,
  getRefreshToken,
} from '@/lib/auth';
import { User, LoginResponse } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: getUser(),
  token: getToken(),
  isAuthenticated: !!getToken(),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const payload: LoginResponse = response.data.data || response.data;
      const { accessToken, refreshToken, user } = payload;

      setToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      setUser(user);

      set({
        token: accessToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const user: User = response.data.data || response.data;
      setUser(user);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // If check fails, try token refresh
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, user } = refreshRes.data.data || refreshRes.data;
          setToken(accessToken);
          if (user) {
            setUser(user);
            set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
            return;
          }
        } catch {
          // Both failed
        }
      }
      clearAuth();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  refreshAuth: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuth();
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken, user } = response.data.data || response.data;
      setToken(accessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);
      if (user) setUser(user);

      set((state) => ({
        token: accessToken,
        user: user || state.user,
        isAuthenticated: true,
      }));
    } catch {
      clearAuth();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
