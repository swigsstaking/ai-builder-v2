import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, FileText, Image, Search, LogOut, Plus, Sparkles, ArrowLeft, Users, BarChart3, Home, Calendar, Briefcase, Clock } from 'lucide-react';
import useAuthStore, { useIsAdmin } from '../stores/authStore';
import useSiteStore from '../stores/siteStore';
import { pagesApi } from '../services/api';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { siteId } = useParams();
  const { user, logout } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { currentSite, fetchSite } = useSiteStore();
  const navigate = useNavigate();

  const [hasBookingPage, setHasBookingPage] = useState(false);

  useEffect(() => {
    if (siteId) {
      fetchSite(siteId);
      pagesApi.getBySite(siteId).then(res => {
        setHasBookingPage((res.pages || []).some(p => p.type === 'booking'));
      }).catch(() => {});
    } else {
      setHasBookingPage(false);
    }
  }, [siteId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/10 text-purple-300 border border-purple-500/10'
        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
    }`;

  return (
    <div className="flex h-screen bg-[#0f0f1a]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-gradient-to-r focus:from-purple-600 focus:to-blue-600 focus:text-white focus:rounded-lg focus:m-2">
        Aller au contenu principal
      </a>

      <aside className="w-64 flex flex-col shrink-0 bg-[#151525] border-r border-white/[0.07]">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.07]">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#3b82f6]">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">AI Builder</span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Navigation principale">
          {siteId ? (
            <>
              <NavLink to="/dashboard" end className={linkClass}>
                <ArrowLeft size={18} /> Dashboard
              </NavLink>

              {currentSite && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate" title={currentSite.name}>
                      {currentSite.name}
                    </p>
                  </div>
                  <NavLink to={`/dashboard/sites/${siteId}`} end className={linkClass}><Home size={18} /> Vue d'ensemble</NavLink>
                  <NavLink to={`/dashboard/sites/${siteId}/pages`} className={linkClass}><FileText size={18} /> Pages</NavLink>
                  <NavLink to={`/dashboard/sites/${siteId}/media`} className={linkClass}><Image size={18} /> Médias</NavLink>
                  <NavLink to={`/dashboard/sites/${siteId}/seo`} className={linkClass}><Search size={18} /> SEO</NavLink>
                  <NavLink to={`/dashboard/sites/${siteId}/settings`} className={linkClass}><Settings size={18} /> Paramètres</NavLink>

                  {hasBookingPage && (
                    <>
                      <div className="pt-4 pb-2">
                        <p className="px-4 text-[10px] font-semibold text-emerald-500/70 uppercase tracking-wider">Réservations</p>
                      </div>
                      <NavLink to={`/dashboard/sites/${siteId}/booking/services`} className={linkClass}><Briefcase size={18} /> Prestations</NavLink>
                      <NavLink to={`/dashboard/sites/${siteId}/booking/schedule`} className={linkClass}><Clock size={18} /> Horaires</NavLink>
                      <NavLink to={`/dashboard/sites/${siteId}/booking/appointments`} className={linkClass}><Calendar size={18} /> Rendez-vous</NavLink>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/dashboard" end className={linkClass}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
              <NavLink to="/dashboard/new" className={linkClass}>
                <Plus size={18} /> Nouveau site
              </NavLink>
              {user?.role === 'superadmin' && (
                <NavLink to="/dashboard/users" className={linkClass}>
                  <Users size={18} /> Utilisateurs
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/[0.07]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-slate-300 truncate" title={user?.name}>{user?.name}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                user?.role === 'admin'
                  ? 'bg-gradient-to-r from-purple-500/15 to-blue-500/15 text-purple-300'
                  : 'bg-white/[0.05] text-slate-400'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'Client'}
              </span>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" aria-label="Se déconnecter">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main id="main-content" className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
