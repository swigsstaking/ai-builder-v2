# Session 2026-04-09 — Handoff complet

## Résumé de la session

Session massive de développement du module booking d'AI Builder. 25+ commits, déploiements continus sur prod. Travail sur : bugs critiques, audit UX, extraction couleurs/fonts, import agenda.ch, intégration Calendar iframe, templates 5 styles.

---

## Ce qui a été fait

### Phase 1 — Bugs critiques booking (commits a09b499, 57a0e36)
1. **Templates backend déployés** — scp des 5 templates JSX + pm2 restart
2. **Fix changement de style** — prop `selected` → `value` dans BookingCreatePage
3. **Navbar booking-aware** — ancres `<a href="#section">` pour one-pager, CTA "Prendre rendez-vous"
4. **Pause midi** — breakStart/breakEnd dans Calendar schema + UI BookingSchedulePage
5. **Témoignages → Google Reviews** — switch de `testimonials` vers `google-reviews` dans DEFAULT_BOOKING_SECTIONS
6. **Alignement horaires** — CSS grid pour aligner toggle/label/inputs
7. **Crash template éditeur** — `style.colors` → font indicator dans EditorTopBar

### Phase 2 — Audit + fixes (commits f5699fb, 2bc8adf)
8. **Placeholder photo hero** — SVG silhouette dans les 5 templates
9. **Contraste spécialité** — `accent` → `rgba(255,255,255,0.85)` dans le hero
10. **Champ Google Maps** — ajouté dans BookingCreatePage + auto-import avis Google
11. **Bouton Google locale** — `?hl=fr` dans GoogleOAuthProvider scriptSrc
12. **Auto-création BookingProfile** — via Calendar API + slug injection
13. **Push services IA → Calendar** — services poussés comme prestations réelles
14. **Iframe Calendar** — dans le widget booking avec URL `/book/{slug}`

### Phase 3 — Sync + polish (commit 42c60c9)
15. **Sync prestations** — CRUD dans onglet Réservations → met à jour section page
16. **Note Google dans hero** — étoiles ⭐ + nombre d'avis dans hero-practitioner (5 templates)
17. **Adresse exacte Google Maps** — formattedAddress + displayName depuis Places API
18. **Auto-enable avis Google** — section activée automatiquement quand reviews importés

### Couleurs + Fonts
19. **Système couleurs complet** — 3 modes (Thèmes/Logo/Custom) portés de SiteCreatePage
20. **Extraction couleurs CSS** — via Puppeteer `page.evaluate()` directement dans le navigateur
21. **Filtrage couleurs parasites** — noir/blanc/gris/bleu navigateur exclus, poids 5x sur boutons CTA
22. **Body background exclu** — séparation couleurs de marque vs fond de page
23. **Extraction fonts** — body + heading fonts + Google Fonts URLs via Puppeteer
24. **Suggestion designStyle** — mapping auto (serif→elegant, Montserrat→bold, Raleway→artistic, etc.)

### Import agenda.ch
25. **Parser dédié** — `agenda-ch-parser.service.js` avec JSON-LD + DOM scraping
26. **Extraction prestations** — 7 services trouvés pour Centre Mêta'Cap (nom + durée + description)
27. **Coordonnées GPS** — Google Maps URL générée depuis lat/long du JSON-LD
28. **Ville** — champ `city` ajouté au schéma Migration + extractedContent

### Intégration Calendar iframe
29. **Mode embed** — `?embed=1` cache header/footer/fond du widget Calendar
30. **Couleur custom** — `&primary=#hex` injecte la couleur du site dans le widget
31. **Body transparent** — en mode embed le body Calendar est transparent
32. **Container sans bordure** — max-w-2xl, pas de bg/shadow/border
33. **Déployé** sur swigs-calendar frontend (Calendar séparé)

### Templates — corrections appliquées aux 5 styles
34. **Navbar masquée** — sur one-page booking (juste bouton flottant CTA)
35. **Liens SSG** — tous les `<span onClick>` convertis en `<a href="#section">`
36. **Boutons Réserver** — `<a href="#booking">` fonctionnels
37. **Avis Google** — fallback `author || name` et `quote || text`
38. **Map iframe** — `q=BUSINESS_NAME+CITY` pour afficher fiche commerce Google avec étoiles
39. **Booking widget** — badge "Réservation en ligne", titre H2, sous-titre, container avec ombre
40. **Placeholders image** — zone dashed + icône pour about (imageMediaId) et hero (photoMediaId)
41. **Visibilité éditeur** — placeholders cachés en preview, visibles dans l'éditeur via CSS `is-editor`
42. **getContrastText** — importé dans les 5 templates (prêt à appliquer)

### Calendar Profile
43. **Fallback profile existant** — si createBookingProfile échoue, récupère l'existant via GET
44. **Fix activeColors** — `selectedPalette.primary` → `activeColors.primary`

---

## État actuel des fichiers modifiés

### Backend (déployé sur 192.168.110.59)
- `backend/server.js` — routes calendar montées
- `backend/src/controllers/aiController.js` — handler generateBookingPage
- `backend/src/controllers/pageController.js` — DEFAULT_BOOKING_SECTIONS (google-reviews visible:true)
- `backend/src/controllers/siteController.js` — fetchGoogleReviews mapping author/quote + adresse
- `backend/src/models/Page.js` — type "booking", sections booking, calendarSlug
- `backend/src/models/Site.js` — changements booking
- `backend/src/models/Migration.js` — googleMapsUrl, fonts, designStyle, city dans contactInfo
- `backend/src/routes/ai.js` — route generate-booking-page
- `backend/src/routes/calendar.js` — proxy Calendar API
- `backend/src/services/ai.service.js` — generateBookingPageContent() avec googleReviews
- `backend/src/services/migration.service.js` — agenda.ch shortcut, CSS colors injection, fonts
- `backend/src/services/screenshot.service.js` — extraction couleurs CSS + fonts + Google Maps URL
- `backend/src/services/vision.service.js` — prompt couleurs amélioré
- `backend/src/services/google-reviews.service.js` — formattedAddress + displayName
- `backend/src/services/agenda-ch-parser.service.js` — NOUVEAU : parser dédié agenda.ch
- `backend/src/services/react-ssg.service.js` — siteProps (isOnePage, googleMaps, address, city) + CSS placeholders
- `backend/src/services/edit-bridge.js` — inchangé (bridge existant suffit)
- `backend/src/templates/styles/*.jsx` — 5 templates avec toutes les corrections booking

### Frontend (déployé sur /var/www/ai-builder/)
- `frontend/src/App.jsx` — routes booking
- `frontend/src/components/CreatePageModal.jsx` — type booking
- `frontend/src/components/Layout.jsx` — onglet Réservations
- `frontend/src/components/DesignStyleSelector.jsx` — inchangé
- `frontend/src/lib/aiPageBuilder.js` — mapBookingAiContentToSections avec google-reviews normalisé
- `frontend/src/main.jsx` — GoogleOAuthProvider scriptSrc ?hl=fr
- `frontend/src/pages/BookingCreatePage.jsx` — flow complet : import URL, couleurs 3 modes, logo, Google Maps, Calendar setup
- `frontend/src/pages/BookingServicesPage.jsx` — sync services → page
- `frontend/src/pages/BookingSchedulePage.jsx` — pause midi
- `frontend/src/pages/BookingAppointmentsPage.jsx` — liste RDV
- `frontend/src/pages/editor/EditorTopBar.jsx` — fix template switcher crash
- `frontend/src/pages/editor/PropertiesPanel.jsx` — champs image booking
- `frontend/src/services/api.js` — calendarApi + bookingApi
- `frontend/src/templates/styles/*.jsx` — 5 templates synced

### Calendar (déployé sur calendar.swigs.online)
- `swigs-calendar/frontend/src/pages/BookingWidget.jsx` — mode embed (?embed=1&primary=#hex)
- `swigs-calendar/backend/src/models/User.js` — breakStart/breakEnd dans workingDays

### Nginx
- `/etc/nginx/sites-available/swigs-calendar` — X-Frame-Options remplacé par CSP frame-ancestors

---

## Ce qui reste à faire

### Priorité 1 — Bugs connus
1. **Calendar : 1 BookingProfile par user** — actuellement l'API Calendar n'autorise qu'un seul profil par utilisateur. Chaque site devrait avoir son propre profil. Le frontend fallback vers l'existant pour l'instant.
2. **Couleurs pas toujours appliquées** — quand le site est créé depuis agenda.ch, les couleurs détectées du site externe sont bien extraites mais pas toujours persistées dans le site AI Builder (vérifier le flow siteData.design).
3. **Contraste** — `getContrastText` est importé mais pas encore utilisé dans les sections avec fond custom. Appliquer aux sections CTA, services-booking cards (prix/durée), hero tagline, etc.
4. **Bouton Google toujours en allemand** — le `scriptSrc` avec `?hl=fr` ne fonctionne pas (Google GSI ignore les query params dans le script URL). Chercher une autre solution (meta tag `lang`, Google Identity locale param).

### Priorité 2 — Templates qualité
5. **Placeholders image** — portés sur les 5 templates mais les 4 non-Modern n'ont pas le double-rendu silhouette/editor pour la photo hero (juste caché en preview). Ajouter la silhouette pour Bold/Elegant/Minimal/Artistic.
6. **Section About** — tester le grid 2 colonnes sur les 5 templates. S'assurer que l'image s'affiche bien quand uploadée.
7. **Contraste iframe booking** — vérifier que les couleurs du site (primary) passent bien dans l'iframe Calendar sur tous les templates.

### Priorité 3 — Features à compléter
8. **Sync bidirectionnelle prestations** — actuellement unidirectionnel (onglet Réservations → page). Il faudrait aussi que la modification d'une prestation dans l'éditeur de page mette à jour le Calendar.
9. **Logo dans le hero** — le logo uploadé lors de la création n'est pas affiché dans le template. Il pourrait remplacer l'initiale dans la navbar et le footer.
10. **Favicon** — le favicon n'est pas généré automatiquement depuis le logo.
11. **Multi-langue** — les textes IA sont parfois en anglais (businessType, services). S'assurer que tout est en français.

### Priorité 4 — Prochaine session (audit complet)
12. **Test création de site classique** — vérifier que les changements booking n'ont pas cassé le flow normal
13. **Test migration de site** — importer un site existant et vérifier le rendu
14. **Test création page réservation seule** — créer une page booking sans site existant
15. **Test page réservation sur site existant** — ajouter une page booking à un site déjà créé
16. **Audit UI/UX complet** — parcourir chaque section de chaque template, vérifier responsive, contraste, alignement
17. **Test avec Chrome MCP** — vérification visuelle section par section

---

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

# Calendar frontend (séparé)
cd /Users/corentinflaction/CascadeProjects/swigs-calendar/frontend
npx vite build
scp -r dist/* swigs@192.168.110.59:/home/swigs/swigs-calendar-frontend/
```

## Login test
- URL: https://ai-builder.swigs.online
- Admin: admin@swigs.online / Admin123!

## Commits GitHub (session complète)
- a09b499 → 4cf0274 (25+ commits sur main)
- Dernier commit: `4cf0274` — Hide image placeholders in preview, show only in editor
