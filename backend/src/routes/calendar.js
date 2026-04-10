import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const CALENDAR_API = process.env.CALENDAR_API_URL || 'http://localhost:3008';
const SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || '';

/**
 * Proxy a request to the Calendar API.
 * Authenticates via X-Internal-Secret + X-Hub-User-Id headers.
 */
async function proxyToCalendar(req, res, { method, path, body }) {
  const hubUserId = req.user.hubUserId;
  if (!hubUserId) {
    return res.status(400).json({ error: 'Votre compte n\'est pas lié au Hub SWIGS. Reconnectez-vous via SSO.' });
  }

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': SERVICE_SECRET,
        'X-Hub-User-Id': hubUserId,
        'X-Hub-User-Email': req.user.email || '',
        'X-Hub-User-Name': req.user.name || '',
      },
    };
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${CALENDAR_API}${path}`, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error(`[Calendar Proxy] ${method} ${path} failed:`, err.message);
    res.status(502).json({ error: 'Le service Calendar est indisponible' });
  }
}

// ─── Services CRUD ───
router.get('/services', (req, res) =>
  proxyToCalendar(req, res, { method: 'GET', path: '/api/services' }));

router.post('/services', (req, res) =>
  proxyToCalendar(req, res, { method: 'POST', path: '/api/services', body: req.body }));

router.put('/services/:id', (req, res) =>
  proxyToCalendar(req, res, { method: 'PUT', path: `/api/services/${req.params.id}`, body: req.body }));

router.delete('/services/:id', (req, res) =>
  proxyToCalendar(req, res, { method: 'DELETE', path: `/api/services/${req.params.id}` }));

router.patch('/services/reorder', (req, res) =>
  proxyToCalendar(req, res, { method: 'PATCH', path: '/api/services/reorder', body: req.body }));

// ─── Booking Profile ───
router.get('/booking-profile', (req, res) => {
  const siteId = req.query.siteId || '';
  const qs = siteId ? `?siteId=${siteId}` : '';
  proxyToCalendar(req, res, { method: 'GET', path: `/api/booking-profile${qs}` });
});

router.post('/booking-profile', (req, res) =>
  proxyToCalendar(req, res, { method: 'POST', path: '/api/booking-profile', body: req.body }));

router.put('/booking-profile', (req, res) => {
  const siteId = req.query.siteId || '';
  const qs = siteId ? `?siteId=${siteId}` : '';
  proxyToCalendar(req, res, { method: 'PUT', path: `/api/booking-profile${qs}`, body: req.body });
});

router.get('/booking-profile/check-slug/:slug', (req, res) =>
  proxyToCalendar(req, res, { method: 'GET', path: `/api/booking-profile/check-slug/${req.params.slug}` }));

// ─── User Preferences (working hours) ───
router.patch('/preferences', (req, res) =>
  proxyToCalendar(req, res, { method: 'PATCH', path: '/api/auth/preferences', body: req.body }));

// ─── Bookings ───
router.get('/bookings', (req, res) =>
  proxyToCalendar(req, res, { method: 'GET', path: '/api/bookings' }));

router.patch('/bookings/:eventId/cancel', (req, res) =>
  proxyToCalendar(req, res, { method: 'PATCH', path: `/api/bookings/${req.params.eventId}/cancel` }));

router.patch('/bookings/:eventId/complete', (req, res) =>
  proxyToCalendar(req, res, { method: 'PATCH', path: `/api/bookings/${req.params.eventId}/complete` }));

export default router;
