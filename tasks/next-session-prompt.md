# Prompt pour la prochaine session

```
Lis le fichier tasks/session-2026-04-08-handoff.md pour le contexte complet de la session précédente.

## Contexte
AI Builder est un SaaS de création de sites web via IA. Le backend tourne sur 192.168.110.59 (PM2 ai-builder-v2, port 4005), le frontend sur https://ai-builder.swigs.online. GitHub : github.com/swigsstaking/ai-builder-v2. SSH : user swigs, sudo password Labo. Login : admin@swigs.online / Admin123!.

## État actuel — Ce qui est fait
- SSO Hub intégré (login/register/google/magic-link proxiés vers le Hub)
- Google OAuth fonctionnel
- JWT aligné { userId }, refresh token avec rotation
- 5 templates (Modern, Bold, Elegant, Minimal, Artistic)
- Création de sites avec IA (homepage + contact)
- Migration de sites via OCR
- Fix services vides + fix HTML body/bullet points
- **Page booking (Phases A+B+E) implémentées localement** mais avec des bugs critiques

## BUGS CRITIQUES À CORRIGER

### Bug 1 : Templates backend non déployés (CAUSE RACINE)
Les 5 templates backend SSG n'ont PAS été déployés sur le serveur après l'ajout des renderers booking. Résultat : les sections hero-practitioner, services-booking et booking-widget sont dans l'éditeur mais PAS rendues dans le HTML final.

**Fix immédiat :**
```bash
cd /Users/corentinflaction/Documents/swigs/ai-builder
scp backend/src/templates/styles/*.jsx swigs@192.168.110.59:/home/swigs/ai-builder-v2-backend/src/templates/styles/
ssh swigs@192.168.110.59 "pm2 restart ai-builder-v2"
```
Puis rebuilder les sites booking existants pour régénérer le HTML.

### Bug 2 : Changement de style plante
Quand on change le design style dans le flow de création booking, ça plante. À investiguer dans BookingCreatePage.jsx — probablement un state mal géré lors du changement de style.

### Bug 3 : Pas de pause midi dans les horaires
L'onglet Réservations > Horaires ne permet pas de configurer une pause déjeuner (ex: fermé 12h-14h). L'API Calendar supporte-t-elle une pause ? Vérifier le format `workingDays` dans Calendar et adapter le frontend BookingSchedulePage.jsx.

### Bug 4 : Navigation one-pager
Pour un site booking (one-pager), la navbar montre "Accueil / À propos / Contact" comme des pages séparées. Pour un one-pager, ces liens devraient être des ancres (#about, #contact, #booking). Le bouton CTA devrait être "Prendre rendez-vous" au lieu de "Nous contacter".

## AMÉLIORATIONS QUALITÉ

### 5. Témoignages masqués par défaut
Les témoignages sont hidden sur une page booking. Pour un praticien, les avis sont essentiels. Rendre visible par défaut avec des témoignages IA générés.

### 6. Pas de photo praticien
Le hero-practitioner supporte un champ photoMediaId mais aucune photo n'est assignée par défaut. La page est 100% texte. Ajouter un placeholder visuel quand pas de photo.

### 7. CTA "Prendre rendez-vous" manquant dans la nav
Le bouton principal de la navbar pour un site booking devrait être "Prendre rendez-vous" (ancre #booking).

## Fichiers modifiés (non commités, non pushés)

Tous ces fichiers ont des changements locaux pas encore sur GitHub :

Backend :
- backend/server.js — routes calendar montées
- backend/src/controllers/aiController.js — handler generateBookingPage
- backend/src/controllers/pageController.js — DEFAULT_BOOKING_SECTIONS
- backend/src/controllers/siteController.js — changements booking
- backend/src/models/Page.js — type "booking", sections booking, calendarSlug
- backend/src/models/Site.js — changements booking
- backend/src/routes/ai.js — route generate-booking-page
- backend/src/routes/calendar.js — NOUVEAU : proxy Calendar
- backend/src/routes/sites.js — changements
- backend/src/routes/users.js — changements
- backend/src/services/ai.service.js — generateBookingPageContent()
- backend/src/templates/styles/*.jsx — renderers booking (5 fichiers)

Frontend :
- frontend/src/App.jsx — routes booking
- frontend/src/components/CreatePageModal.jsx — type booking dans dropdown
- frontend/src/components/Layout.jsx — onglet Réservations conditionnel
- frontend/src/lib/aiPageBuilder.js — mapBookingAiContentToSections
- frontend/src/pages/BookingCreatePage.jsx — NOUVEAU : flow création
- frontend/src/pages/BookingServicesPage.jsx — NOUVEAU : CRUD prestations
- frontend/src/pages/BookingSchedulePage.jsx — NOUVEAU : config horaires
- frontend/src/pages/BookingAppointmentsPage.jsx — NOUVEAU : liste RDV
- frontend/src/pages/DashboardPage.jsx — changements
- frontend/src/pages/PagesListPage.jsx — changements
- frontend/src/pages/SiteCreatePage.jsx — 3ème carte booking
- frontend/src/pages/editor/PropertiesPanel.jsx — propriétés booking
- frontend/src/services/api.js — calendarApi + bookingApi
- frontend/src/templates/styles/*.jsx — renderers booking (5 fichiers)

## Ordre des corrections

1. **Déployer les templates backend** (fix immédiat, 1 commande scp)
2. **Tester le rendu** — rebuilder un site booking et vérifier hero + services + widget
3. **Fix changement de style** — investiguer BookingCreatePage.jsx
4. **Fix navigation one-pager** — adapter le template pour les sites booking
5. **Pause midi** — vérifier l'API Calendar workingDays, adapter BookingSchedulePage
6. **Témoignages visible par défaut** — modifier DEFAULT_BOOKING_SECTIONS
7. **Commit + push** tout sur GitHub
8. **Audit final** — créer un site booking de test et vérifier chaque section

## Serveurs
| Serveur | IP | Port | PM2 |
|---------|-----|------|-----|
| AI Builder backend | 192.168.110.59 | 4005 | ai-builder-v2 |
| Hub SWIGS | 192.168.110.59 | 3006 | swigs-hub |
| Calendar | 192.168.110.59 | 3008 | swigs-calendar |
| Ollama | 192.168.110.103 | 11434 | — |
| MongoDB | 192.168.110.73 | 27017 | — |
| Frontend prod | 192.168.110.59 | 443 | nginx |

## Deploy
```bash
# Backend
scp backend/src/FILE swigs@192.168.110.59:/home/swigs/ai-builder-v2-backend/src/FILE
ssh swigs@192.168.110.59 "pm2 restart ai-builder-v2"

# Frontend
cd frontend && npx vite build
scp -r dist/* swigs@192.168.110.59:/var/www/ai-builder/

# Templates backend (SSG)
scp backend/src/templates/styles/*.jsx swigs@192.168.110.59:/home/swigs/ai-builder-v2-backend/src/templates/styles/
```
```
