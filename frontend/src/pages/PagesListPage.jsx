import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Plus, Trash2, Eye, GripVertical, Link2 } from 'lucide-react';
import { useIsAdmin } from '../stores/authStore';
import toast from 'react-hot-toast';
import { pagesApi, buildApi } from '../services/api';
import PublishButton from '../components/PublishButton';
import CreatePageModal from '../components/CreatePageModal';
import useSiteStore from '../stores/siteStore';
import { trackSitePreview, trackEvent } from '../lib/posthog';

const PAGE_TYPE_BADGES = {
  homepage: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  contact: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  legal: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8' },
  city: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  booking: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  subpage: { bg: 'rgba(14,165,233,0.15)', color: '#38bdf8' },
};

export default function PagesListPage() {
  const { siteId } = useParams();
  const isAdmin = useIsAdmin();
  const { currentSite } = useSiteStore();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const fetchPages = async () => {
    try {
      const { pages } = await pagesApi.getBySite(siteId);
      setPages(pages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPages(); }, [siteId]);

  const handleDelete = async () => {
    if (!deleteModal || !deleteConfirmed) return;
    try {
      await pagesApi.delete(deleteModal._id);
      trackEvent('page_deleted', { site_id: siteId, page_title: deleteModal.title });
      toast.success('Page supprimée');
      setDeleteModal(null);
      setDeleteConfirmed(false);
      fetchPages();
    } catch { toast.error('Erreur'); }
  };

  const handlePreview = async () => {
    try {
      await buildApi.trigger(siteId);
      trackSitePreview(siteId);
      toast.success('Build lancé — aperçu dans quelques secondes');
      setTimeout(() => {
        window.open(`/api/build/${siteId}/preview/index.html`, '_blank');
      }, 3000);
    } catch { toast.error('Erreur de build'); }
  };

  const handleCopyPreviewLink = async () => {
    try {
      await buildApi.trigger(siteId);
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin + '/api';
      const previewUrl = `${apiBase}/build/${siteId}/preview/index.html`;
      await navigator.clipboard.writeText(previewUrl);
      toast.success('Lien d\'aperçu copié !');
    } catch { toast.error('Erreur'); }
  };

  const getTypeBadge = (type) => PAGE_TYPE_BADGES[type] || PAGE_TYPE_BADGES.subpage;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Pages</h1>
        <div className="flex gap-3">
          <button onClick={handlePreview} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-slate-300 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Eye size={16} /> Aperçu
          </button>
          <button onClick={handleCopyPreviewLink} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-slate-300 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }} title="Copier le lien d'aperçu pour le partager">
            <Link2 size={16} /> Copier le lien
          </button>
          {isAdmin && <PublishButton siteId={siteId} status={currentSite?.status} domain={currentSite?.domain} />}
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-white rounded-lg hover:opacity-90">
            <Plus size={16} /> Nouvelle page
          </button>
        </div>
      </div>

      {showCreate && (
        <CreatePageModal
          siteId={siteId}
          site={currentSite}
          isAdmin={isAdmin}
          existingPages={pages}
          onCreated={() => { setShowCreate(false); fetchPages(); }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <p className="text-slate-500 text-center py-10">Chargement...</p>
      ) : pages.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="mx-auto w-16 h-16 text-slate-600 mb-4" />
          <p className="text-slate-500">Aucune page</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div
              key={page._id}
              className="rounded-lg p-4 flex items-center justify-between hover:border-white/[0.12] transition-all"
              style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-4">
                <GripVertical size={16} className="text-slate-600" aria-hidden="true" />
                <div>
                  <Link to={`/dashboard/sites/${siteId}/pages/${page._id}`} className="font-medium text-white hover:text-accent-text">
                    {page.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">/{page.slug}.html</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: getTypeBadge(page.type).bg, color: getTypeBadge(page.type).color }}
                    >
                      {page.type === 'city' ? 'ville' : page.type === 'booking' ? 'réservation' : page.type}
                    </span>
                    {page.isMainHomepage && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>index</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/dashboard/sites/${siteId}/pages/${page._id}`} className="text-sm text-accent-text hover:underline">Éditer</Link>
                {isAdmin && (
                  <button onClick={() => setDeleteModal(page)} className="text-slate-500 hover:text-danger" aria-label={`Supprimer ${page.title}`}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setDeleteModal(null); setDeleteConfirmed(false); }}>
          <div className="rounded-xl p-6 w-full max-w-sm" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-white text-center mb-2">Supprimer la page</h2>
            <p className="text-sm text-slate-400 text-center mb-2">
              Supprimer <strong className="text-slate-200">"{deleteModal.title}"</strong> ?
            </p>
            <p className="text-xs text-slate-500 text-center mb-4">Cette action est irréversible.</p>
            <label className={`flex items-center gap-3 mb-5 px-4 py-3 rounded-lg cursor-pointer select-none border transition-colors ${deleteConfirmed ? 'border-red-500/30' : 'border-white/[0.07] hover:border-white/[0.12]'}`} style={{ background: deleteConfirmed ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)' }}>
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${deleteConfirmed ? 'bg-red-600 border-red-600' : 'border-slate-600'}`}>
                {deleteConfirmed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <input type="checkbox" checked={deleteConfirmed} onChange={e => setDeleteConfirmed(e.target.checked)} className="sr-only" />
              <span className={`text-sm font-medium ${deleteConfirmed ? 'text-red-400' : 'text-slate-400'}`}>Je confirme vouloir supprimer cette page</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(null); setDeleteConfirmed(false); }} className="flex-1 px-4 py-2.5 text-sm text-slate-300 rounded-lg font-medium hover:bg-white/[0.05]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteConfirmed}
                className={`flex-1 px-4 py-2.5 text-sm text-white rounded-lg font-medium transition-colors ${deleteConfirmed ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600/30 cursor-not-allowed'}`}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
