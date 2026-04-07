import { create } from 'zustand';
import { authApi } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('aibuilder_token'),
  loading: true,

  login: async (email, password) => {
    const { token, user } = await authApi.login({ email, password });
    localStorage.setItem('aibuilder_token', token);
    set({ token, user, loading: false });
  },

  logout: () => {
    localStorage.removeItem('aibuilder_token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const { user } = await authApi.getMe();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem('aibuilder_token');
      set({ user: null, token: null, loading: false });
    }
  },
}));

export default useAuthStore;

export const useIsAdmin = () => useAuthStore(state => ['admin', 'superadmin'].includes(state.user?.role));
