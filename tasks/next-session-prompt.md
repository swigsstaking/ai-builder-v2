# Prompt pour la prochaine session

```
Lis le fichier tasks/session-2026-04-09-handoff.md pour le contexte complet de la session précédente.

## Contexte
AI Builder est un SaaS de création de sites web via IA. Le backend tourne sur 192.168.110.59 (PM2 ai-builder-v2, port 4005), le frontend sur https://ai-builder.swigs.online. GitHub : github.com/swigsstaking/ai-builder-v2. SSH : user swigs, sudo password Labo. Login : admin@swigs.online / Admin123!.

## Objectif de cette session
Audit complet en 3 parties avec Chrome MCP :

### 1. Test création de site classique
- Créer un site normal (pas booking) depuis zéro
- Vérifier le flow complet : formulaire → progression → éditeur → preview
- Tester chaque section : hero, services, about, testimonials, FAQ, team, CTA, contact, map
- Vérifier que les changements booking n'ont pas cassé le flow site normal
- Tester l'import URL sur un site standard (pas agenda.ch)

### 2. Test migration de site
- Migrer un site existant (WordPress, Wix, etc.)
- Vérifier extraction couleurs + fonts + contenu
- Vérifier le rendu dans chaque template (Modern, Bold, Elegant, Minimal, Artistic)
- Tester le flow complet : URL → analyse → preview → mapping → création

### 3. Test page de réservation
- **Page booking SEULE** (sans site existant) : créer depuis zéro + depuis agenda.ch
- **Page booking SUR SITE EXISTANT** : ajouter une page booking à un site déjà créé via CreatePageModal
- Vérifier pour chaque template :
  - Navbar masquée (one-page) vs visible (multi-page)
  - Liens ancres fonctionnels (#booking, #services-booking, etc.)
  - Boutons "Réserver" → scroll vers widget
  - Widget Calendar iframe intégré (embed mode, couleur primary)
  - Avis Google avec noms des auteurs
  - Map avec fiche commerce Google (étoiles)
  - Placeholders image visibles dans l'éditeur, cachés en preview
  - Contraste texte lisible partout

### 4. Audit UI/UX qualité templates
- Vérifier le responsive (desktop, tablet, mobile) via viewport switcher éditeur
- Vérifier le contraste texte sur chaque section de chaque template
- Vérifier la cohérence des couleurs (primary/secondary/accent bien appliqués)
- Vérifier que les images uploadées s'affichent correctement
- Vérifier le footer de chaque template
- Lister tous les problèmes UI/UX trouvés et les corriger

## Bugs connus à vérifier/corriger
1. Calendar : 1 BookingProfile par user (limiter à l'existant pour l'instant)
2. Contraste : getContrastText importé mais pas utilisé — l'appliquer aux sections problématiques
3. Bouton Google en allemand (locale GSI pas résolu)
4. Photo silhouette manquante en preview sur Bold/Elegant/Minimal/Artistic
5. Couleurs parfois non persistées quand import depuis agenda.ch

## Fichiers clés
- backend/src/templates/styles/*.jsx — 5 templates (le coeur du rendu)
- backend/src/services/react-ssg.service.js — SSG (génère le HTML final)
- backend/src/services/edit-bridge.js — bridge éditeur ↔ preview iframe
- backend/src/controllers/pageController.js — DEFAULT_BOOKING_SECTIONS
- frontend/src/pages/BookingCreatePage.jsx — flow création booking
- frontend/src/pages/editor/* — éditeur de pages
- frontend/src/lib/aiPageBuilder.js — mapper IA → sections

## Deploy
```bash
# Backend
scp backend/src/FILE swigs@192.168.110.59:/home/swigs/ai-builder-v2-backend/src/FILE
ssh swigs@192.168.110.59 "pm2 restart ai-builder-v2"

# Frontend
cd frontend && npx vite build
scp -r dist/* swigs@192.168.110.59:/var/www/ai-builder/

# Calendar frontend
cd /Users/corentinflaction/CascadeProjects/swigs-calendar/frontend
npx vite build
scp -r dist/* swigs@192.168.110.59:/home/swigs/swigs-calendar-frontend/
```
```
