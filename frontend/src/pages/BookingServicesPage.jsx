import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { calendarApi } from '../services/api';

const CURRENCIES = [
  { value: 'CHF', label: 'CHF' },
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
];

const CURRENCY_SYMBOLS = { CHF: 'CHF', EUR: '€', USD: '$' };

const emptyForm = {
  name: '',
  description: '',
  duration: 60,
  price: '',
  currency: 'CHF',
  bufferAfter: 0,
  isActive: true,
};

export default function BookingServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchServices = async () => {
    try {
      const res = await calendarApi.getServices();
      const list = Array.isArray(res) ? res : res.services || [];
      setServices(list);
    } catch (err) {
      const msg = err?.response?.status === 502
        ? 'Service calendrier indisponible'
        : err?.error || 'Erreur de chargement des prestations';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditingService(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name || '',
      description: service.description || '',
      duration: service.duration || 60,
      price: service.price != null ? service.price : '',
      currency: service.currency || 'CHF',
      bufferAfter: service.bufferAfter || 0,
      isActive: service.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    if (!form.duration || form.duration < 5 || form.duration > 480) {
      toast.error('La durée doit être entre 5 et 480 minutes');
      return;
    }

    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: Number(form.duration),
      currency: form.currency,
      bufferAfter: Number(form.bufferAfter) || 0,
      isActive: form.isActive,
    };
    if (form.price !== '' && form.price != null) {
      data.price = Number(form.price);
    }

    setSaving(true);
    try {
      if (editingService) {
        const res = await calendarApi.updateService(editingService._id, data);
        const updated = res.service || res;
        setServices(prev => prev.map(s => s._id === editingService._id ? updated : s));
        toast.success('Prestation modifiée');
      } else {
        const res = await calendarApi.createService(data);
        const created = res.service || res;
        setServices(prev => [...prev, created]);
        toast.success('Prestation créée');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err?.error || err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`Supprimer la prestation "${service.name}" ?`)) return;
    try {
      await calendarApi.deleteService(service._id);
      setServices(prev => prev.filter(s => s._id !== service._id));
      toast.success('Prestation supprimée');
    } catch (err) {
      toast.error(err?.error || 'Erreur lors de la suppression');
    }
  };

  const formatPrice = (service) => {
    if (service.price == null || service.price === '') return '—';
    return `${service.price} ${CURRENCY_SYMBOLS[service.currency] || service.currency}`;
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Prestations</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-white text-sm font-medium hover:bg-accent/80 transition"
        >
          <Plus className="w-4 h-4" />
          Nouvelle prestation
        </button>
      </div>

      {/* Empty state */}
      {services.length === 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-12 text-center">
          <Clock className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4">Aucune prestation configurée</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-white text-sm font-medium hover:bg-accent/80 transition"
          >
            <Plus className="w-4 h-4" />
            Créer ma première prestation
          </button>
        </div>
      )}

      {/* Services list */}
      {services.length > 0 && (
        <div className="rounded-xl border border-white/[0.07] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Nom</th>
                <th className="text-left px-5 py-3 font-medium">Durée</th>
                <th className="text-left px-5 py-3 font-medium">Prix</th>
                <th className="text-left px-5 py-3 font-medium">Statut</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr
                  key={service._id}
                  className="border-b border-white/[0.04] bg-white/[0.03] hover:bg-white/[0.05] transition"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {service.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: service.color }}
                        />
                      )}
                      <div>
                        <span className="text-white font-medium">{service.name}</span>
                        {service.description && (
                          <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{service.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/60">{service.duration} min</td>
                  <td className="px-5 py-4 text-white/60">{formatPrice(service)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-white/[0.06] text-white/30'
                      }`}
                    >
                      {service.isActive !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(service)}
                        className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border border-white/[0.07] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <h2 className="text-lg font-semibold text-white">
                {editingService ? 'Modifier la prestation' : 'Nouvelle prestation'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Nom *</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-white rounded-lg text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition"
                  placeholder="Ex: Consultation 60 min"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Description</label>
                <textarea
                  maxLength={1000}
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-white rounded-lg text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition resize-none"
                  placeholder="Description optionnelle de la prestation..."
                />
              </div>

              {/* Duration + Buffer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Durée (minutes) *</label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={form.duration}
                    onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-white rounded-lg text-sm focus:outline-none focus:border-white/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Tampon après (min)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={form.bufferAfter}
                    onChange={e => setForm(p => ({ ...p, bufferAfter: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-white rounded-lg text-sm focus:outline-none focus:border-white/20 transition"
                  />
                </div>
              </div>

              {/* Price + Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Prix</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-white rounded-lg text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition"
                    placeholder="Optionnel"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Devise</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-white rounded-lg text-sm focus:outline-none focus:border-white/20 transition"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.value} value={c.value} className="bg-[#1a1a2e]">{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/10 bg-white/[0.04] text-accent focus:ring-accent/50"
                />
                <span className="text-sm text-white/60">Prestation active</span>
              </label>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white/[0.06] rounded-lg text-white/60 text-sm hover:bg-white/[0.1] transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-white text-sm font-medium hover:bg-accent/80 transition disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingService ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
