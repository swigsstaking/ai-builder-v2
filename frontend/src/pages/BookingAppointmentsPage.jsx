import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, X, Phone, FileText, Loader2, Clock, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { calendarApi } from '../services/api';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmé', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  cancelled: { label: 'Annulé', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  completed: { label: 'Terminé', bg: 'bg-blue-400/15', text: 'text-blue-300', border: 'border-blue-400/30' },
};

function formatDate(isoString) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

function formatDuration(start, end) {
  const diffMs = new Date(end) - new Date(start);
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.confirmed;
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text} border ${config.border}`}>
      {config.label}
    </span>
  );
}

export default function BookingAppointmentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await calendarApi.getBookings();
      const data = res.data?.bookings || res.data || [];
      const sorted = [...data].sort((a, b) => new Date(b.start) - new Date(a.start));
      setBookings(sorted);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleComplete = async (eventId) => {
    try {
      setActionLoading(eventId + '-complete');
      await calendarApi.completeBooking(eventId);
      toast.success('Rendez-vous marqué comme terminé');
      await fetchBookings();
    } catch (err) {
      console.error('Failed to complete booking:', err);
      toast.error('Impossible de terminer le rendez-vous');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    try {
      setActionLoading(eventId + '-cancel');
      await calendarApi.cancelBooking(eventId);
      toast.success('Rendez-vous annulé');
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      toast.error("Impossible d'annuler le rendez-vous");
    } finally {
      setActionLoading(null);
    }
  };

  const bookingStatus = (b) => b.booking?.status || b.status || 'confirmed';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="w-6 h-6 text-violet-400" />
        <h1 className="text-2xl font-bold text-white">Rendez-vous</h1>
        {!loading && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
            {bookings.length}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          <span className="ml-3 text-white/50 text-sm">Chargement des rendez-vous…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Calendar className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white/40 text-sm">Aucun rendez-vous pour le moment</p>
        </div>
      )}

      {/* Bookings list */}
      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const status = bookingStatus(booking);
            const guest = booking.booking || {};
            const isConfirmed = status === 'confirmed';

            return (
              <div
                key={booking._id}
                className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-5 space-y-3 transition-colors hover:bg-white/[0.05]"
              >
                {/* Top row: guest info + status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-white/30 shrink-0" />
                      <span className="font-semibold text-white truncate">
                        {guest.guestName || 'Client'}
                      </span>
                    </div>
                    {guest.guestEmail && (
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{guest.guestEmail}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={status} />
                </div>

                {/* Date, duration, service */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/50">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(booking.start)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(booking.start, booking.end)}
                  </span>
                </div>

                {/* Service name */}
                {booking.title && (
                  <p className="text-sm text-violet-300/70">{booking.title}</p>
                )}

                {/* Phone */}
                {guest.guestPhone && (
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{guest.guestPhone}</span>
                  </div>
                )}

                {/* Notes */}
                {guest.guestNotes && (
                  <div className="flex items-start gap-2 text-sm text-white/35 bg-white/[0.02] rounded-lg p-3">
                    <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="italic">{guest.guestNotes}</span>
                  </div>
                )}

                {/* Actions for confirmed bookings */}
                {isConfirmed && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleComplete(booking._id)}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {actionLoading === booking._id + '-complete' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Terminer
                    </button>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {actionLoading === booking._id + '-cancel' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
