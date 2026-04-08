import { create } from 'zustand';
import { authApi } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('aibuilder_access_token'),
  refreshToken: localStorage.getItem('aibuilder_refresh_token'),
  loading: true,

  login: async (email, password) => {
    const { accessToken, refreshToken, user } = await authApi.login({ email, password });
    localStorage.setItem('aibuilder_access_token', accessToken);
    localStorage.setItem('aibuilder_refresh_token', refreshToken);
    set({ accessToken, refreshToken, user, loading: false });
  },

  register: async (email, name, password) => {
    const data = await authApi.register({ email, name, password });
    if (data.accessToken) {
      localStorage.setItem('aibuilder_access_token', data.accessToken);
      localStorage.setItem('aibuilder_refresh_token', data.refreshToken);
      set({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user, loading: false });
      return { loggedIn: true };
    }
    // Magic link flow (no password) — Hub sends email
    return { loggedIn: false, message: data.message };
  },

  googleLogin: async (idToken) => {
    const { accessToken, refreshToken, user } = await authApi.googleLogin({ idToken });
    localStorage.setItem('aibuilder_access_token', accessToken);
    localStorage.setItem('aibuilder_refresh_token', refreshToken);
    set({ accessToken, refreshToken, user, loading: false });
  },

  requestMagicLink: async (email) => {
    const data = await authApi.magicLink({ email });
    return data;
  },

  ssoCallback: async (ssoToken) => {
    const { accessToken, refreshToken, user } = await authApi.ssoCallback({ ssoToken });
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
      // ignore
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
