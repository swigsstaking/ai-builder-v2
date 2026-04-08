import { useState } from 'react';
import { Save, Clock, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import { calendarApi } from '../services/api';

const DAYS_ORDERED = [
  { day: 1, label: 'Lundi' },
  { day: 2, label: 'Mardi' },
  { day: 3, label: 'Mercredi' },
  { day: 4, label: 'Jeudi' },
  { day: 5, label: 'Vendredi' },
  { day: 6, label: 'Samedi' },
  { day: 0, label: 'Dimanche' },
];

const DEFAULT_WORKING_DAYS = DAYS_ORDERED.map(({ day }) => ({
  day,
  enabled: day >= 1 && day <= 5,
  start: '09:00',
  end: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  hasBreak: day >= 1 && day <= 5,
}));

export default function BookingSchedulePage() {
  const [workingDays, setWorkingDays] = useState(DEFAULT_WORKING_DAYS);
  const [saving, setSaving] = useState(false);

  const updateDay = (dayNum, field, value) => {
    setWorkingDays((prev) =>
      prev.map((d) => (d.day === dayNum ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert time strings to numbers for Calendar API
      const apiDays = workingDays.map(({ day, enabled, start, end, breakStart, breakEnd, hasBreak }) => ({
        day,
        enabled,
        start: parseInt(start?.split(':')[0]) || 9,
        end: parseInt(end?.split(':')[0]) || 18,
        breakStart: hasBreak ? (parseInt(breakStart?.split(':')[0]) || 12) : null,
        breakEnd: hasBreak ? (parseInt(breakEnd?.split(':')[0]) || 13) : null,
      }));
      await calendarApi.updatePreferences({
        workingDays: apiDays,
      });
      toast.success('Horaires sauvegardés');
    } catch (err) {
      console.error('Failed to save schedule:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Horaires de travail</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
      </div>

      <p className="text-sm text-white/50">
        Configurez vos jours et horaires de disponibilité pour la prise de rendez-vous.
      </p>

      {/* Schedule grid */}
      <div className="space-y-3">
        {DAYS_ORDERED.map(({ day, label }) => {
          const entry = workingDays.find((d) => d.day === day);
          if (!entry) return null;

          return (
            <div
              key={day}
              className="px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.07] transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => updateDay(day, 'enabled', !entry.enabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    entry.enabled ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      entry.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Day label */}
                <span
                  className={`w-28 text-sm font-medium ${
                    entry.enabled ? 'text-white' : 'text-white/30'
                  }`}
                >
                  {label}
                </span>

                {/* Time inputs */}
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={entry.start}
                    onChange={(e) => updateDay(day, 'start', e.target.value)}
                    disabled={!entry.enabled}
                    className={`px-3 py-2 rounded-lg text-sm bg-white/[0.05] border border-white/[0.07] outline-none transition-colors ${
                      entry.enabled
                        ? 'text-white focus:border-purple-500'
                        : 'text-white/20 cursor-not-allowed'
                    }`}
                  />
                  <span className={`text-sm ${entry.enabled ? 'text-white/50' : 'text-white/20'}`}>
                    —
                  </span>
                  <input
                    type="time"
                    value={entry.end}
                    onChange={(e) => updateDay(day, 'end', e.target.value)}
                    disabled={!entry.enabled}
                    className={`px-3 py-2 rounded-lg text-sm bg-white/[0.05] border border-white/[0.07] outline-none transition-colors ${
                      entry.enabled
                        ? 'text-white focus:border-purple-500'
                        : 'text-white/20 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Break row */}
              {entry.enabled && (
                <div className="flex items-center gap-4 mt-3 pl-[60px]">
                  <button
                    type="button"
                    onClick={() => updateDay(day, 'hasBreak', !entry.hasBreak)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
                      entry.hasBreak
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-white/[0.03] text-white/30 border border-white/[0.05] hover:text-white/50'
                    }`}
                  >
                    <Coffee className="w-3 h-3" />
                    Pause
                  </button>
                  {entry.hasBreak && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={entry.breakStart}
                        onChange={(e) => updateDay(day, 'breakStart', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.05] border border-white/[0.07] text-white outline-none focus:border-amber-500 transition-colors"
                      />
                      <span className="text-xs text-white/50">—</span>
                      <input
                        type="time"
                        value={entry.breakEnd}
                        onChange={(e) => updateDay(day, 'breakEnd', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.05] border border-white/[0.07] text-white outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
