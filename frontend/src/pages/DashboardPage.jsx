import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Globe, Pencil, Eye, Trash2, Copy, ExternalLink, Search, X, CloudOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useSiteStore from '../stores/siteStore';
import { useIsAdmin } from '../stores/authStore';
import { sitesApi, deployApi } from '../services/api';
import PublishButton from '../components/PublishButton';
import { trackEvent } from '../lib/posthog';
import { Button, Card, SiteStatusBadge, Badge, EmptyState, ConfirmDialog } from '../ui';

export default function DashboardPage() {
  const { sites, loading, fetchSites, deleteSite } = useSiteStore();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [unpublishModal, setUnpublishModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchSites(); }, []);

  const filteredSites = sites.filter(site => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      site.name?.toLowerCase().includes(q) ||
      site.domain?.toLowerCase().includes(q) ||
      site.business?.city?.toLowerCase().includes(q) ||
      site.business?.activity?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteSite(deleteModal._id);
      trackEvent('site_deleted', { site_id: deleteModal._id, site_name: deleteModal.name });
      toast.success('Site supprimé');
      setDeleteModal(null);
    } catch { toast.error('Erreur lors de la suppression'); }
    setDeleting(false);
  };

  const handleUnpublish = async () => {
    if (!unpublishModal) return;
    try {
      await deployApi.unpublish(unpublishModal._id);
      trackEvent('site_unpublished', { site_id: unpublishModal._id, site_name: unpublishModal.name });
      fetchSites();
      toast.success('Site dépublié');
      setUnpublishModal(null);
    } catch { toast.error('Erreur lors de la dépublication'); }
  };

  const handleDuplicate = async (id) => {
    try {
      const { site } = await sitesApi.duplicate(id);
      trackEvent('site_duplicated', { source_site_id: id, new_site_id: site._id, site_name: site.name });
      fetchSites();
      toast.success(`Site dupliqué : ${site.name}`);
    } catch { toast.error('Erreur lors de la duplication'); }
  };

  // Design style gradient for thumbnail area
  const getStyleGradient = (site) => {
    const primary = site.design?.primaryColor || '#7c3aed';
    const accent = site.design?.accentColor || '#3b82f6';
    return `linear-gradient(135deg, ${primary}30, ${accent}20)`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Mes sites</h1>
          {sites.length > 0 && (
            <Badge variant="purple" size="sm">{sites.length}</Badge>
          )}
        </div>
        <Button icon={Plus} onClick={() => navigate('/dashboard/new')}>
          Nouveau site
        </Button>
      </div>

      {/* Search */}
      {sites.length > 0 && (
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, ville, domaine, activité..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#151525] border border-white/[0.07] rounded-xl text-sm text-[#e2e8f0] placeholder:text-[#64748b] outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/15 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : sites.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="Aucun site pour le moment"
          description="Créez votre premier site web en quelques clics grâce à l'intelligence artificielle."
          actionLabel="Créer un site"
          onAction={() => navigate('/dashboard/new')}
        />
      ) : filteredSites.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun résultat"
          description={`Aucun site ne correspond à "${search}"`}
          actionLabel="Effacer la recherche"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSites.map((site) => (
            <Card
              key={site._id}
              variant="interactive"
              className="overflow-hidden group"
              onClick={(e) => {
                if (e.target.closest('button, a')) return;
                navigate(`/dashboard/sites/${site._id}`);
              }}
            >
              {/* Thumbnail area */}
              <div
                className="h-28 relative flex items-center justify-center overflow-hidden"
                style={{ background: getStyleGradient(site) }}
              >
                <span className="text-3xl font-bold text-white/10 uppercase tracking-widest select-none">
                  {site.design?.designStyle || 'modern'}
                </span>
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {site.sourceUrl && <Badge variant="info" size="sm">Migré</Badge>}
                  <SiteStatusBadge status={site.status} />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="font-semibold text-white text-base mb-0.5 truncate">{site.name}</h2>
                {site.domain && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                    <Globe size={12} /> {site.domain}
                  </p>
                )}
                {site.business?.activity && (
                  <p className="text-xs text-slate-500 truncate">
                    {site.business.activity}{site.business.city ? ` — ${site.business.city}` : ''}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Pencil}
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sites/${site._id}/pages`); }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sites/${site._id}/pages`, { state: { preview: true } }); }}
                  >
                    Aperçu
                  </Button>
                  <div onClick={e => e.stopPropagation()}>
                    <PublishButton siteId={site._id} status={site.status} domain={site.domain} compact />
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/[0.05] bg-white/[0.02]">
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleDuplicate(site._id); }} className="text-slate-500 hover:text-slate-300 transition-colors" title="Dupliquer">
                    <Copy size={15} />
                  </button>
                  {site.status === 'published' && site.domain && (
                    <a href={`https://${site.domain}`} target="_blank" rel="noopener" className="text-slate-500 hover:text-purple-400 transition-colors" title="Voir en ligne" onClick={e => e.stopPropagation()}>
                      <ExternalLink size={15} />
                    </a>
                  )}
                  {site.status === 'published' && (
                    <button onClick={(e) => { e.stopPropagation(); setUnpublishModal(site); }} className="text-slate-500 hover:text-orange-400 transition-colors" title="Dépublier">
                      <CloudOff size={15} />
                    </button>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); setDeleteModal(site); }} className="text-slate-500 hover:text-red-400 transition-colors" title="Supprimer">
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Supprimer le site"
        message={
          <>
            Supprimer <strong className="text-white">"{deleteModal?.name}"</strong> et toutes ses pages et médias ?
            {deleteModal?.status === 'published' && deleteModal?.domain && (
              <span className="block mt-2 text-red-400">Le site {deleteModal.domain} sera mis hors ligne.</span>
            )}
          </>
        }
        confirmLabel="Supprimer"
        variant="danger"
        requireCheck
        checkLabel="Je confirme vouloir supprimer définitivement ce site"
        loading={deleting}
      />

      {/* Unpublish confirmation */}
      <ConfirmDialog
        open={!!unpublishModal}
        onClose={() => setUnpublishModal(null)}
        onConfirm={handleUnpublish}
        title="Dépublier le site"
        message={
          <>
            Retirer <strong className="text-white">"{unpublishModal?.name}"</strong> de la mise en ligne ?
            {unpublishModal?.domain && (
              <span className="block mt-2 text-orange-400">{unpublishModal.domain} ne sera plus accessible.</span>
            )}
            <span className="block mt-2 text-xs text-slate-500">Le site reste dans AI Builder et peut être republié à tout moment.</span>
          </>
        }
        confirmLabel="Dépublier"
        variant="danger"
      />
    </div>
  );
}
