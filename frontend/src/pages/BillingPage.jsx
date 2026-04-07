import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Receipt, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  useEffect(() => {
    loadStats();
  }, [month, year]);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await adminApi.getBilling(month, year);
      setStats(data);
    } catch (err) {
      toast.error('Erreur chargement facturation');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReport() {
    setSending(true);
    try {
      await adminApi.sendBillingReport(month, year);
      toast.success('Rapport envoyé par email');
    } catch (err) {
      toast.error(err.error || 'Erreur envoi rapport');
    } finally {
      setSending(false);
    }
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt size={24} /> Facturation
          </h1>
          <p className="text-slate-500 mt-1">Suivi des déploiements et facturation mensuelle</p>
        </div>
        <button
          onClick={handleSendReport}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          <Send size={16} />
          {sending ? 'Envoi...' : 'Envoyer le rapport'}
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-semibold text-white min-w-[200px] text-center">
          {monthNames[month - 1]} {year}
        </span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-slate-400">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Standard ce mois" value={stats.standardCount} color="blue" />
            <StatCard label="PostHog ce mois" value={stats.posthogCount} color="green" />
            <StatCard label="Total Standard" value={stats.totalStandard} color="gray" />
            <StatCard label="Total PostHog" value={stats.totalPosthog} color="gray" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard label="Sites actifs" value={stats.activeCount} color="emerald" />
            <StatCard label="Sites supprimés" value={stats.deletedCount} color="red" />
          </div>

          {/* Deployments table */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-semibold text-white">
                Déploiements — {monthNames[month - 1]} {year}
              </h2>
            </div>
            {stats.deployments.length === 0 ? (
              <p className="px-6 py-8 text-slate-500 text-center">Aucun déploiement ce mois</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <th className="px-6 py-3 text-left font-medium text-slate-400">Nom</th>
                    <th className="px-6 py-3 text-left font-medium text-slate-400">Domaine</th>
                    <th className="px-6 py-3 text-left font-medium text-slate-400">Type</th>
                    <th className="px-6 py-3 text-left font-medium text-slate-400">Date</th>
                    <th className="px-6 py-3 text-left font-medium text-slate-400">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.deployments.map((d) => (
                    <tr key={d._id} className="hover:bg-white/[0.02]" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-6 py-3 font-medium text-slate-200">{d.siteName}</td>
                      <td className="px-6 py-3 text-slate-400">{d.domain}</td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={d.type === 'posthog'
                            ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                            : { background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }
                          }
                        >
                          {d.type === 'posthog' ? 'PostHog' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-400">
                        {new Date(d.firstPublishedAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-3">
                        {d.deletedAt ? (
                          <span className="text-red-400 text-xs font-medium">Supprimé</span>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium">Actif</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa' },
    green: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
    gray: { bg: 'rgba(255,255,255,0.04)', text: '#94a3b8' },
    emerald: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
    red: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
  };
  const c = colors[color] || colors.gray;
  return (
    <div className="rounded-xl p-5" style={{ background: c.bg, color: c.text }}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1 opacity-75">{label}</div>
    </div>
  );
}
