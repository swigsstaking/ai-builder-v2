import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Image, Settings, Globe, Pencil, BarChart3,
  Clock, Loader2, ArrowUpRight, Rocket,
} from 'lucide-react';
import useSiteStore from '../stores/siteStore';
import { useIsAdmin } from '../stores/authStore';
import { pagesApi, mediaApi } from '../services/api';
import { useState } from 'react';
import { Card, CardBody, Button, SiteStatusBadge, Badge } from '../ui';
import PublishButton from '../components/PublishButton';

export default function SiteOverviewPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const { currentSite, fetchSite, loading } = useSiteStore();
  const [stats, setStats] = useState({ pages: 0, media: 0 });

  useEffect(() => {
    fetchSite(siteId);
    loadStats();
  }, [siteId]);

  const loadStats = async () => {
    try {
      const [pagesRes, mediaRes] = await Promise.all([
        pagesApi.getAll(siteId),
        mediaApi.getAll(siteId),
      ]);
      setStats({
        pages: pagesRes.pages?.length || 0,
        media: mediaRes.media?.length || 0,
      });
    } catch { /* silent */ }
  };

  if (loading || !currentSite) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const site = currentSite;
  const quickActions = [
    {
      label: "Modifier les pages",
      desc: "Ouvrir l'éditeur visuel",
      icon: Pencil,
      onClick: () => navigate(`/dashboard/sites/${siteId}/pages`),
    },
    {
      label: "Paramètres",
      desc: "Nom, design, domaine",
      icon: Settings,
      onClick: () => navigate(`/dashboard/sites/${siteId}/settings`),
    },
    {
      label: "Médias",
      desc: "Gérer les images",
      icon: Image,
      onClick: () => navigate(`/dashboard/sites/${siteId}/media`),
    },
    {
      label: "SEO",
      desc: "Titre, description, mots-clés",
      icon: BarChart3,
      onClick: () => navigate(`/dashboard/sites/${siteId}/seo`),
    },
  ];

  const statCards = [
    { label: 'Pages', value: stats.pages, icon: FileText, color: 'text-blue-400' },
    { label: 'Médias', value: stats.media, icon: Image, color: 'text-purple-400' },
    { label: 'Status', value: site.status, icon: Globe, isBadge: true },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Site header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{site.name}</h1>
            <SiteStatusBadge status={site.status} />
          </div>
          {site.domain && (
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Globe size={14} />
              {site.domain}
              {site.status === 'published' && (
                <a href={`https://${site.domain}`} target="_blank" rel="noopener" className="text-purple-400 hover:text-purple-300">
                  <ArrowUpRight size={14} />
                </a>
              )}
            </p>
          )}
          {site.business?.activity && (
            <p className="text-sm text-slate-500 mt-1">
              {site.business.activity}{site.business.city ? ` — ${site.business.city}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <PublishButton siteId={siteId} status={site.status} domain={site.domain} />}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, isBadge }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] ${color || ''}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                {isBadge ? (
                  <SiteStatusBadge status={value} />
                ) : (
                  <p className="text-xl font-bold text-white">{value}</p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions rapides</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {quickActions.map(({ label, desc, icon: Icon, onClick }) => (
          <Card key={label} variant="interactive" onClick={onClick}>
            <CardBody className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/15">
                <Icon size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Site info */}
      {site.design && (
        <>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Design</h2>
          <Card className="mb-8">
            <CardBody className="flex items-center gap-6">
              <Badge variant="purple">{site.design.designStyle || 'modern'}</Badge>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-white/10" style={{ background: site.design.primaryColor || '#7c3aed' }} title="Primaire" />
                <div className="w-6 h-6 rounded-full border border-white/10" style={{ background: site.design.secondaryColor || '#1e293b' }} title="Secondaire" />
                <div className="w-6 h-6 rounded-full border border-white/10" style={{ background: site.design.accentColor || '#f59e0b' }} title="Accent" />
              </div>
              {site.design.fontHeading && (
                <span className="text-xs text-slate-500">{site.design.fontHeading} / {site.design.fontBody}</span>
              )}
            </CardBody>
          </Card>
        </>
      )}

      {/* Updated info */}
      {site.updatedAt && (
        <p className="text-xs text-slate-600 flex items-center gap-1.5">
          <Clock size={12} />
          Dernière modification : {new Date(site.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
