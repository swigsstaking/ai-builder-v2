import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import Layout from './components/Layout';
import { identifyUser, trackPageView } from './lib/posthog';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SiteCreatePage = lazy(() => import('./pages/SiteCreatePage'));
const SiteSettingsPage = lazy(() => import('./pages/SiteSettingsPage'));
const PagesListPage = lazy(() => import('./pages/PagesListPage'));
const PageEditorPage = lazy(() => import('./pages/editor/PageEditorPage'));
const MediaLibraryPage = lazy(() => import('./pages/MediaLibraryPage'));
const SeoPage = lazy(() => import('./pages/SeoPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const MigrationWizardPage = lazy(() => import('./pages/MigrationWizardPage'));
const SiteOverviewPage = lazy(() => import('./pages/SiteOverviewPage'));
const TemplateTestPage = lazy(() => import('./pages/TemplateTestPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BookingCreatePage = lazy(() => import('./pages/BookingCreatePage'));
const BookingServicesPage = lazy(() => import('./pages/BookingServicesPage'));
const BookingSchedulePage = lazy(() => import('./pages/BookingSchedulePage'));
const BookingAppointmentsPage = lazy(() => import('./pages/BookingAppointmentsPage'));

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, accessToken } = useAuthStore();
  if (loading || (accessToken && !user)) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuthStore();
  if (!['admin', 'superadmin'].includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function SuperAdminRoute({ children }) {
  const { user } = useAuthStore();
  if (user?.role !== 'superadmin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { accessToken, fetchUser, loading, user, ssoCallback } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle SSO token from magic link redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ssoToken = params.get('sso_token');

    if (ssoToken) {
      window.history.replaceState({}, '', location.pathname);
      ssoCallback(ssoToken)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch((err) => {
          console.error('SSO callback failed:', err);
          useAuthStore.setState({ loading: false });
          navigate('/login', { replace: true });
        });
      return;
    }

    if (accessToken) fetchUser();
    else useAuthStore.setState({ loading: false });
  }, []);

  useEffect(() => {
    if (user?.email) identifyUser(user.email);
  }, [user]);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  if (loading) return <Loader />;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/migrate" element={<MigrationWizardPage />} />
        <Route path="/templates" element={<TemplateTestPage />} />

        {/* Full-screen editor (protected) */}
        <Route path="/dashboard/sites/:siteId/pages/:pageId" element={<ProtectedRoute><PageEditorPage /></ProtectedRoute>} />

        {/* Full-screen create page (no sidebar) */}
        <Route path="/dashboard/new" element={<ProtectedRoute><SiteCreatePage /></ProtectedRoute>} />
        <Route path="/dashboard/new-booking" element={<ProtectedRoute><BookingCreatePage /></ProtectedRoute>} />

        {/* Dashboard (protected, with sidebar layout) */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="sites/:siteId" element={<SiteOverviewPage />} />
          <Route path="sites/:siteId/settings" element={<SiteSettingsPage />} />
          <Route path="sites/:siteId/pages" element={<PagesListPage />} />
          <Route path="sites/:siteId/media" element={<MediaLibraryPage />} />
          <Route path="sites/:siteId/seo" element={<SeoPage />} />
          <Route path="sites/:siteId/booking/services" element={<BookingServicesPage />} />
          <Route path="sites/:siteId/booking/schedule" element={<BookingSchedulePage />} />
          <Route path="sites/:siteId/booking/appointments" element={<BookingAppointmentsPage />} />
          <Route path="users" element={<SuperAdminRoute><UserManagementPage /></SuperAdminRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
