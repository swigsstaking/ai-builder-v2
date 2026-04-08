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

export default function App() {
  const { accessToken, fetchUser, loading, user, exchangeAuthCode } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle SSO auth_code from callback redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authCode = params.get('auth_code');
    const authError = params.get('auth_error');

    if (authError) {
      console.error('SSO auth error:', authError);
      // Clean URL
      const cleanUrl = location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      return;
    }

    if (authCode) {
      // Clean URL immediately
      const cleanUrl = location.pathname;
      window.history.replaceState({}, '', cleanUrl);

      exchangeAuthCode(authCode)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch((err) => {
          console.error('Auth code exchange failed:', err);
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
        <Route path="/dashboard/new" element={<ProtectedRoute><AdminRoute><SiteCreatePage /></AdminRoute></ProtectedRoute>} />

        {/* Dashboard (protected, with sidebar layout) */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="sites/:siteId" element={<SiteOverviewPage />} />
          <Route path="sites/:siteId/settings" element={<SiteSettingsPage />} />
          <Route path="sites/:siteId/pages" element={<PagesListPage />} />
          <Route path="sites/:siteId/media" element={<MediaLibraryPage />} />
          <Route path="sites/:siteId/seo" element={<SeoPage />} />
          <Route path="users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
