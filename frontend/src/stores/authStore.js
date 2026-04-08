import { create } from 'zustand';
import { authApi } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('aibuilder_access_token'),
  refreshToken: localStorage.getItem('aibuilder_refresh_token'),
  loading: true,

  loginWithHub: () => {
    window.location.href = '/api/auth/login';
  },

  registerWithHub: () => {
    const hubUrl = import.meta.env.VITE_HUB_URL || 'https://apps.swigs.online';
    const returnUrl = encodeURIComponent(window.location.origin + '/api/auth/login');
    window.location.href = `${hubUrl}/register?returnUrl=${returnUrl}`;
  },

  exchangeAuthCode: async (authCode) => {
    const { accessToken, refreshToken, user } = await authApi.exchange({ authCode });
    localStorage.setItem('aibuilder_access_token', accessToken);
    localStorage.setItem('aibuilder_refresh_token', refreshToken);
    set({ accessToken, refreshToken, user, loading: false });
  },

  refreshAccessToken: async () => {
    const currentRefresh = get().refreshToken;
    if (!currentRefresh) throw new Error('No refresh token');

    const { accessToken, refreshToken, user } = await authApi.refresh({ refreshToken: currentRefresh });
    localStorage.setItem('aibuilder_access_token', accessToken);
    localStorage.setItem('aibuilder_refresh_token', refreshToken);
    set({ accessToken, refreshToken, user, loading: false });
    return accessToken;
  },

  logout: async () => {
    const rt = get().refreshToken;
    try {
      if (rt) await authApi.logout({ refreshToken: rt });
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('aibuilder_access_token');
    localStorage.removeItem('aibuilder_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  fetchUser: async () => {
    try {
      const { user } = await authApi.getMe();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem('aibuilder_access_token');
      localStorage.removeItem('aibuilder_refresh_token');
      set({ user: null, accessToken: null, refreshToken: null, loading: false });
    }
  },
}));

export default useAuthStore;

export const useIsAdmin = () => useAuthStore(state => ['admin', 'superadmin'].includes(state.user?.role));
