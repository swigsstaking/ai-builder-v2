import { useEffect, useState } from 'react';
import { Users, Plus, Pencil, Trash2, Key, X, Shield, User, RefreshCw, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi, sitesApi } from '../services/api';
import useAuthStore from '../stores/authStore';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const currentUser = useAuthStore(s => s.user);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'client', assignedSites: [],
  });
  const [copied, setCopied] = useState(false);
  const [copiedReset, setCopiedReset] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const symbols = '!@#$%&*';
    let pw = '';
    for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    pw += symbols[Math.floor(Math.random() * symbols.length)];
    pw += Math.floor(Math.random() * 10);
    return pw;
  };

  const handleGenerate = (target) => {
    const pw = generatePassword();
    if (target === 'form') {
      setForm(p => ({ ...p, password: pw }));
    } else {
      setNewPassword(pw);
    }
  };

  const handleCopyPassword = async (pw, target) => {
    await navigator.clipboard.writeText(pw);
    if (target === 'form') { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    else { setCopiedReset(true); setTimeout(() => setCopiedReset(false), 2000); }
  };

  const fetchData = async () => {
    try {
      const [usersRes, sitesRes] = await Promise.all([usersApi.getAll(), sitesApi.getAll()]);
      setUsers(usersRes.users);
      setAllSites(sitesRes.sites);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'client', assignedSites: [] });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      assignedSites: (user.assignedSites || []).map(s => typeof s === 'object' ? s._id : s),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        const { password, ...data } = form;
        const { user } = await usersApi.update(editingUser._id, data);
        setUsers(prev => prev.map(u => u._id === user._id ? user : u));
        toast.success('Utilisateur modifié');
      } else {
        if (!form.password) { toast.error('Mot de passe requis'); return; }
        const { user } = await usersApi.create(form);
        setUsers(prev => [user, ...prev]);
        toast.success('Utilisateur créé');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.error || 'Erreur');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer l'utilisateur "${name}" ?`)) return;
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('Utilisateur supprimé');
    } catch (err) {
      toast.error(err.error || 'Erreur');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const { user: updated } = await usersApi.update(user._id, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
      toast.success(updated.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé');
    } catch { toast.error('Erreur'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword) { toast.error('Mot de passe requis'); return; }
    try {
      await usersApi.resetPassword(showResetModal._id, { newPassword });
      toast.success('Mot de passe réinitialisé');
      setShowResetModal(null);
      setNewPassword('');
    } catch { toast.error('Erreur'); }
  };

  const toggleSite = (siteId) => {
    setForm(prev => ({
      ...prev,
      assignedSites: prev.assignedSites.includes(siteId)
        ? prev.assignedSites.filter(id => id !== siteId)
        : [...prev.assignedSites, siteId],
    }));
  };

  if (loading) return <div className="p-8 text-slate-500">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users size={24} /> Gestion des utilisateurs
        </h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus size={18} /> Nouvel utilisateur
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Sites</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="hover:bg-white/[0.02]" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="px-6 py-4 text-sm font-medium text-slate-200">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={user.role === 'admin'
                      ? { background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }
                      : { background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }
                    }
                  >
                    {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                    {user.role === 'admin' ? 'Admin' : 'Client'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {user.role === 'admin' ? (
                    <span className="text-slate-500">Tous</span>
                  ) : (
                    <span>{(user.assignedSites || []).map(s => typeof s === 'object' ? s.name : s).join(', ') || '—'}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(user)}
                    disabled={user._id === currentUser?._id}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                    }`}
                    style={user.isActive
                      ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                      : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
                    }
                  >
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(user)} className="text-slate-500 hover:text-slate-300" title="Modifier">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => { setShowResetModal(user); setNewPassword(''); }} className="text-slate-500 hover:text-amber-400" title="Réinitialiser le mot de passe">
                      <Key size={16} />
                    </button>
                    {user._id !== currentUser?._id && (
                      <button onClick={() => handleDelete(user._id, user.name)} className="text-slate-500 hover:text-danger" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-slate-500">Aucun utilisateur</div>
        )}
      </div>

      {/* Modal création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-lg font-bold text-white">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/[0.05]">
                <X size={18} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2 rounded-lg outline-none" />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="flex-1 px-4 py-2 rounded-lg outline-none font-mono text-sm" placeholder="Saisir ou générer" />
                    <button type="button" onClick={() => handleGenerate('form')} className="px-3 py-2 rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05]" style={{ background: 'rgba(255,255,255,0.06)' }} title="Générer un mot de passe">
                      <RefreshCw size={16} />
                    </button>
                    <button type="button" onClick={() => handleCopyPassword(form.password, 'form')} disabled={!form.password} className="px-3 py-2 rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05] disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.06)' }} title="Copier le mot de passe">
                      {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rôle</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full px-4 py-2 rounded-lg outline-none">
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {form.role === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sites assignés</label>
                  <div className="rounded-lg max-h-48 overflow-y-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    {allSites.map(site => (
                      <label key={site._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                          type="checkbox"
                          checked={form.assignedSites.includes(site._id)}
                          onChange={() => toggleSite(site._id)}
                          className="rounded border-slate-600 text-accent focus:ring-accent"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{site.name}</p>
                          {site.domain && <p className="text-xs text-slate-500">{site.domain}</p>}
                        </div>
                      </label>
                    ))}
                    {allSites.length === 0 && (
                      <p className="text-sm text-slate-500 p-4 text-center">Aucun site disponible</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.05] rounded-lg">
                Annuler
              </button>
              <button onClick={handleSave} className="px-5 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:opacity-90">
                {editingUser ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reset mot de passe */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowResetModal(null)}>
          <div className="rounded-xl p-6 w-full max-w-sm" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Réinitialiser le mot de passe</h2>
            <p className="text-sm text-slate-400 mb-4">Pour : <strong className="text-slate-200">{showResetModal.name}</strong> ({showResetModal.email})</p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Saisir ou générer"
                className="flex-1 px-4 py-2 rounded-lg outline-none font-mono text-sm"
              />
              <button type="button" onClick={() => handleGenerate('reset')} className="px-3 py-2 rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05]" style={{ background: 'rgba(255,255,255,0.06)' }} title="Générer">
                <RefreshCw size={16} />
              </button>
              <button type="button" onClick={() => handleCopyPassword(newPassword, 'reset')} disabled={!newPassword} className="px-3 py-2 rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05] disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.06)' }} title="Copier">
                {copiedReset ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetModal(null)} className="px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.05] rounded-lg">
                Annuler
              </button>
              <button onClick={handleResetPassword} className="px-5 py-2 bg-amber-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
