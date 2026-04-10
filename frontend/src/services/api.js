import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aibuilder_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('aibuilder_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('aibuilder_access_token');
        window.location.href = '/login';
        return Promise.reject(err.response?.data || err);
      }

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = api.post('/auth/refresh', { refreshToken });
        }

        const { accessToken: newToken, refreshToken: newRefresh } = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        localStorage.setItem('aibuilder_access_token', newToken);
        localStorage.setItem('aibuilder_refresh_token', newRefresh);

        const { default: useAuthStore } = await import('../stores/authStore');
        useAuthStore.setState({ accessToken: newToken, refreshToken: newRefresh });

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        refreshPromise = null;
        localStorage.removeItem('aibuilder_access_token');
        localStorage.removeItem('aibuilder_refresh_token');
        window.location.href = '/login';
        return Promise.reject(err.response?.data || err);
      }
    }

    return Promise.reject(err.response?.data || err);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (data) => api.post('/auth/google', data),
  magicLink: (data) => api.post('/auth/magic-link', data),
  ssoCallback: (data) => api.post('/auth/sso-callback', data),
  refresh: (data) => api.post('/auth/refresh', data),
  getMe: () => api.get('/auth/me'),
  logout: (data) => api.post('/auth/logout', data),
};

export const sitesApi = {
  getAll: () => api.get('/sites'),
  getOne: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/sites', data),
  update: (id, data) => api.put(`/sites/${id}`, data),
  delete: (id) => api.delete(`/sites/${id}`),
  duplicate: (id) => api.post(`/sites/${id}/duplicate`),
  fetchGoogleReviews: (id) => api.post(`/sites/${id}/fetch-reviews`),
};

export const pagesApi = {
  getBySite: (siteId) => api.get(`/pages/site/${siteId}`),
  getOne: (id) => api.get(`/pages/${id}`),
  create: (siteId, data) => api.post(`/pages/site/${siteId}`, data),
  update: (id, data) => api.put(`/pages/${id}`, data),
  delete: (id) => api.delete(`/pages/${id}`),
  updateSection: (pageId, idx, data) => api.patch(`/pages/${pageId}/sections/${idx}`, data),
  updateSections: (pageId, sections) => api.patch(`/pages/${pageId}/sections`, { sections }),
};

export const mediaApi = {
  getBySite: (siteId, folder) => api.get(`/media/site/${siteId}`, { params: { folder } }),
  getOne: (id) => api.get(`/media/${id}`),
  upload: (siteId, formData) => api.post(`/media/site/${siteId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.patch(`/media/${id}`, data),
  delete: (id) => api.delete(`/media/${id}`),
};

export const buildApi = {
  trigger: (siteId) => api.post(`/build/${siteId}`),
  status: (siteId) => api.get(`/build/${siteId}/status`),
  previewUrl: (siteId, page) => `/api/build/${siteId}/preview/${page}`,
};

export const deployApi = {
  publish: (siteId) => api.post(`/deploy/${siteId}/publish`),
  unpublish: (siteId) => api.post(`/deploy/${siteId}/unpublish`),
  status: (siteId) => api.get(`/deploy/${siteId}/status`),
};

export const aiApi = {
  generatePage: (data) => api.post('/ai/generate-page', data),
  generateContact: (data) => api.post('/ai/generate-contact', data),
  generateSeo: (data) => api.post('/ai/generate-seo', data),
  optimizeSeo: (siteId) => api.post('/ai/optimize-seo', { siteId }),
  rewrite: (data) => api.post('/ai/rewrite', data),
  generateAlt: (data) => api.post('/ai/generate-alt', data),
  generateCityPage: (data) => api.post('/ai/generate-city-page', data),
  generateBookingPage: (data) => api.post('/ai/generate-booking-page', data),
};

export const calendarApi = {
  // Services
  getServices: () => api.get('/calendar/services'),
  createService: (data) => api.post('/calendar/services', data),
  updateService: (id, data) => api.put(`/calendar/services/${id}`, data),
  deleteService: (id) => api.delete(`/calendar/services/${id}`),
  reorderServices: (data) => api.patch('/calendar/services/reorder', data),
  // Booking Profile
  getBookingProfile: (siteId) => api.get(`/calendar/booking-profile${siteId ? `?siteId=${siteId}` : ''}`),
  createBookingProfile: (data) => api.post('/calendar/booking-profile', data),
  updateBookingProfile: (data, siteId) => api.put(`/calendar/booking-profile${siteId ? `?siteId=${siteId}` : ''}`, data),
  checkSlug: (slug) => api.get(`/calendar/booking-profile/check-slug/${slug}`),
  // Preferences (working hours)
  updatePreferences: (data) => api.patch('/calendar/preferences', data),
  // Bookings
  getBookings: () => api.get('/calendar/bookings'),
  cancelBooking: (eventId) => api.patch(`/calendar/bookings/${eventId}/cancel`),
  completeBooking: (eventId) => api.patch(`/calendar/bookings/${eventId}/complete`),
};

export const migrationApi = {
  analyze: (data) => api.post('/migration/analyze', data),
  getStatus: (id) => api.get(`/migration/${id}`),
  updateExtracted: (id, data) => api.put(`/migration/${id}/extracted`, data),
  triggerMapping: (id, data) => api.post(`/migration/${id}/map`, data),
  updateMapping: (id, data) => api.put(`/migration/${id}/mapping`, data),
  createSite: (id, data) => api.post(`/migration/${id}/create-site`, data),
  cancel: (id) => api.delete(`/migration/${id}`),
};

export const adminApi = {
  getBilling: (month, year) => api.get('/admin/billing', { params: { month, year } }),
  sendBillingReport: (month, year) => api.post('/admin/billing-report', { month, year }),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
};

export default api;
