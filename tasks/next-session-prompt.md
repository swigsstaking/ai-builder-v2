# Prompt pour la prochaine session

```
Lis les fichiers tasks/session-2026-04-08-sso.md et tasks/session-2026-04-08-booking-brief.md pour le contexte complet.

## Mission : Implémenter la page de réservation (booking) + intégration Calendar

### Contexte
AI Builder est un SaaS de création de sites web via IA. L'auth SSO Hub est en place — les users ont un hubUserId qui les lie à toutes les apps SWIGS (Calendar, Workflow, etc.).

Backend : 192.168.110.59 (PM2 ai-builder-v2, port 4005)
Frontend : https://ai-builder.swigs.online
GitHub : github.com/swigsstaking/ai-builder-v2
SSH : user swigs, sudo password Labo
Login : admin@swigs.online / Admin123!
Calendar API : même serveur, port 3008 (calendar.swigs.online)

### Ce qui est déjà fait
- SSO Hub intégré (login/register/google/magic-link proxiés vers le Hub)
- JWT aligné { userId }, refresh token avec rotation, sessions en DB
- Users ont hubUserId pour le cross-service
- 5 templates (Modern, Bold, Elegant, Minimal, Artistic) fonctionnels
- Création de sites avec IA (homepage + contact)
- Migration de sites existants via OCR (deepseek-ocr + qwen3.5)

### Architecture décidée

Calendar = moteur backend (disponibilités, widget iframe, emails)
AI Builder = interface unique pour le praticien

Le praticien ne quitte JAMAIS AI Builder. Les API Calendar sont appelées en proxy via le backend AI Builder.

### Ce qu'il faut implémenter

#### Phase A : Template page booking

1. Nouveau type de page "booking" dans le modèle Page (ajouter à l'enum type)
2. Sections du template booking :
   - hero-practitioner : photo portrait, nom, titre/spécialité, accroche
   - services-booking : prestations avec durée + prix (données éditoriales)
   - about : bio, parcours, diplômes
   - booking-widget : iframe calendar.swigs.online/book/{slug} (champ de config : calendarSlug)
   - testimonials : avis clients (optionnel)
   - contact : coordonnées, carte Google Maps, horaires
3. Renderers dans les 5 templates (frontend + backend = 10 fichiers)
4. Sections par défaut dans pageController pour type "booking"

#### Phase B : Flow de création "Page de réservation"

1. 3ème option sur le dashboard /dashboard/new : "Page de réservation"
2. Flow simplifié : nom + spécialité + (URL optionnelle) + (description optionnelle)
3. Crée un Site one-pager avec 1 Page type "booking"
4. L'IA génère le contenu adapté au métier du praticien
5. Si URL fournie : utilise le pipeline OCR existant pour extraire nom, bio, prestations

#### Phase C : Proxy API Calendar

Le backend AI Builder expose des routes /api/calendar/* qui proxient vers calendar.swigs.online :

1. Routes proxy :
   - GET/POST/PUT/DELETE /api/calendar/services → /api/services
   - GET/POST/PUT /api/calendar/booking-profile → /api/booking-profile
   - PATCH /api/calendar/preferences → /api/auth/preferences
   - GET /api/calendar/bookings → /api/bookings
   - PATCH /api/calendar/bookings/:id/cancel → /api/bookings/:id/cancel
   - PATCH /api/calendar/bookings/:id/complete → /api/bookings/:id/complete

2. Auth : Le proxy utilise le hubUserId de l'utilisateur connecté pour s'authentifier auprès de Calendar. Calendar et AI Builder partagent la même auth Hub, donc :
   - Option 1 : AI Builder génère un JWT signé avec un service secret partagé contenant le hubUserId → Calendar le vérifie
   - Option 2 : AI Builder forward le même JWT (si même JWT_SECRET) → vérifier si les JWT_SECRET sont identiques
   - À vérifier : grep JWT_SECRET dans les .env de ai-builder et calendar sur le serveur

3. Création automatique du BookingProfile : quand le praticien crée sa première page booking, AI Builder appelle POST /api/booking-profile avec { slug, businessName }

#### Phase D : Onglet "Réservations" dans la sidebar

Quand un site a une page de type "booking", un onglet apparaît dans la sidebar :
- Prestations : CRUD (nom, durée, prix, buffer, description) — appelle proxy /api/calendar/services
- Horaires : config par jour (lun-dim, heures début/fin) — appelle proxy /api/calendar/preferences
- Rendez-vous : liste RDV à venir avec actions annuler/terminer — appelle proxy /api/calendar/bookings

3 nouvelles pages frontend :
- frontend/src/pages/BookingServicesPage.jsx
- frontend/src/pages/BookingSchedulePage.jsx
- frontend/src/pages/BookingAppointmentsPage.jsx

Ajout dans la sidebar conditionnelle (Layout.jsx) + routes dans App.jsx.

#### Phase E : Page booking ajoutée à un site existant

Dans le modal "Ajouter des pages" (CreatePageModal.jsx), ajouter le type "Réservation" dans le dropdown. Quand sélectionné, crée la page avec les sections booking par défaut et propose de configurer le slug calendar.

### Ordre de priorité
Phase A (template) → Phase B (flow création) → Phase C (proxy) → Phase D (onglet) → Phase E (ajout à existant)

Les phases A et B sont indépendantes de Calendar. Les phases C-D-E nécessitent le proxy.

### Fichiers clés à modifier

Backend :
- backend/src/models/Page.js — ajouter "booking" au type enum
- backend/src/controllers/pageController.js — DEFAULT_BOOKING_SECTIONS
- backend/src/services/ai.service.js — generateBookingPageContent()
- backend/src/routes/calendar.js — NOUVEAU : proxy routes vers Calendar
- backend/server.js — monter les routes /api/calendar

Frontend :
- frontend/src/templates/styles/*.jsx (10 fichiers) — renderers booking sections
- frontend/src/pages/SiteCreatePage.jsx — 3ème option "Page de réservation"
- frontend/src/pages/BookingCreatePage.jsx — NOUVEAU : flow création one-pager
- frontend/src/pages/BookingServicesPage.jsx — NOUVEAU : CRUD prestations
- frontend/src/pages/BookingSchedulePage.jsx — NOUVEAU : config horaires
- frontend/src/pages/BookingAppointmentsPage.jsx — NOUVEAU : liste RDV
- frontend/src/components/Layout.jsx — onglet conditionnel dans sidebar
- frontend/src/App.jsx — nouvelles routes
- frontend/src/services/api.js — calendarApi

### API Calendar existantes (sur port 3008)
| Endpoint | Auth | Description |
|----------|------|-------------|
| GET /api/services | JWT | Liste prestations |
| POST /api/services | JWT | Créer prestation |
| PUT /api/services/:id | JWT | Modifier prestation |
| DELETE /api/services/:id | JWT | Supprimer prestation |
| GET /api/booking-profile | JWT | Profil de réservation |
| POST /api/booking-profile | JWT | Créer profil (slug + businessName) |
| PUT /api/booking-profile | JWT | Modifier profil |
| PATCH /api/auth/preferences | JWT | Horaires de travail (workingDays) |
| GET /api/bookings | JWT | RDV à venir |
| PATCH /api/bookings/:id/cancel | JWT | Annuler RDV |
| PATCH /api/bookings/:id/complete | JWT | Terminer RDV |
| GET /api/widget/:slug | Public | Profil public + services |

### Points d'attention
- Le backend est en PROD — ne rien casser
- Deploy via scp + pm2 restart ai-builder-v2
- Les templates backend sont utilisés pour le SSG build — chaque nouveau renderer doit exister dans frontend ET backend
- Le proxy Calendar doit gérer les erreurs gracieusement (Calendar down, user pas de profil, etc.)
- Tester avec Chrome MCP sur https://ai-builder.swigs.online
```
