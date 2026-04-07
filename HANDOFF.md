# AI Builder v2 — Document de relais

## Résumé du projet

App SaaS publique pour créer ou migrer des sites web via l'IA. Fusionne deux apps existantes :
- **AI Builder v1** (ai-builder.swigs.online) : pipeline vision IA pour migration de sites
- **Resamatic** : éditeur visuel live (iframe + PostMessage), SSG Handlebars

**Répertoire** : `/Users/corentinflaction/Documents/swigs/ai-builder/`

---

## Ce qui a été complété (backend — solide)

### Phase 1 : Foundation ✅
- Monorepo `backend/` + `frontend/` + `templates/`
- Backend copié de Resamatic, renommé "ai-builder"
- MongoDB sur serveur 59 (tunnel SSH port 27018 en dev local)
- Frontend React 18 + Vite + Tailwind CSS 4 + Zustand

### Phase 2 : Pipeline vision IA ✅
- `screenshot.service.js` — Puppeteer capture (copié d'AI Builder v1)
- `scraper.service.js` — Cheerio text fallback (copié d'AI Builder v1)
- `vision.service.js` — **NOUVEAU** : qwen3-vl:8b (Ollama) + Claude Vision fallback + JSON repair
- `migration.service.js` — **NOUVEAU** : orchestration pipeline complet
- `Migration.js` model — tracking status/progress
- `migrationController.js` — 7 endpoints REST (analyze, status, map, create-site, etc.)
- **Testé E2E** avec Wikipedia : screenshot → Claude Vision → extraction OK

### Phase 3 : Content Mapper ✅
- `content-mapper.service.js` — mappe l'extraction vision → 11 types sections Resamatic
- Modes : `faithful` (contenu tel quel) / `modernize` (IA réécrit)
- `suggestDesignStyle()` recommande un style selon le business type
- **Testé** avec données réelles

### Phase 4 : Design Styles ✅
- 5 CSS dans `templates/assets/styles/` (modern, bold, elegant, minimal, artistic)
- Classe `style-{{designStyle}}` sur le `<body>` dans `base.hbs`
- `ssg.service.js` modifié pour charger le CSS du style au build
- `DesignStyleSelector.jsx` composant frontend
- Champ `designStyle` + `sourceUrl` ajoutés au modèle Site
- Presets fonts/couleurs par style appliqués à la création

### Phase 5-6 : Frontend (à refaire) ⚠️
- `MigrationWizardPage.jsx` — wizard 6 étapes (fonctionne techniquement)
- `migrationStore.js` — Zustand store
- `migrationApi` dans `api.js` — 7 endpoints
- `LandingPage.jsx` — landing dark
- `LoginPage.jsx` — login dark
- Routes restructurées (`/` public, `/dashboard` privé)
- Layout sidebar dark
- **PROBLÈME** : le design n'est PAS fidèle à AI Builder v1

---

## Ce qui reste à faire

### PRIORITÉ 1 : Refaire le design frontend

Le design actuel utilise la mauvaise palette de couleurs. Voici la **vraie palette** d'AI Builder v1 extraite du CSS :

```
Body background :  #020617  (slate-950, quasi noir)
Primary :          #0ea5e9  (sky-500, bleu cyan)
Gradient text :    #38bdf8 → #a855f7 → #ec4899  (sky → purple → pink)
Gradient button :  #0ea5e9 → #0284c7  (sky-500 → sky-700)
Glass cards :      border #ffffff1a, bg #ffffff0d
Hover glass :      border #ffffff33, bg #ffffff1a
Selection :        #0ea5e94d
Font :             Inter
```

Notre design actuel utilise `#0f0f1a` fond et `#7c3aed` (violet) comme accent — **tout faux**. Il faut remplacer par les vraies couleurs ci-dessus.

**Fichiers à modifier :**
- `frontend/src/index.css` — tokens CSS (changer toute la palette)
- `frontend/src/pages/LandingPage.jsx` — couleurs, gradients, structure
- `frontend/src/pages/LoginPage.jsx` — couleurs
- `frontend/src/pages/MigrationWizardPage.jsx` — couleurs
- `frontend/src/components/Layout.jsx` — sidebar colors
- Les overrides CSS globaux dans `index.css` (`.bg-white`, etc.)

**Structure de la landing AI Builder v1 à reproduire :**
1. Header : logo "AI Builder" + nav (Accueil, Contact) + bouton "Commencer"
2. Hero : badge "Propulsé par Claude" + H1 gradient + sous-titre + **input domaine** avec bouton "Vérifier"
3. Trust badges : SSL Gratuit, Hébergement Suisse, Support 24/7
4. Comment ça marche : 3 étapes (01/02/03)
5. Features : 6 cards (IA, 5 min, Domaine, Design, Hébergement, Support)
6. **Pricing** : 3 plans (Création 299 CHF, Business 499 CHF, E-commerce 799 CHF) — NON IMPLÉMENTÉ
7. **Témoignages** : 3 citations — NON IMPLÉMENTÉ
8. CTA : "Prêt à créer votre site ?"
9. Footer

**Style glass** des cards AI Builder v1 :
```css
.glass {
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
}
.glass:hover {
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1);
}
```

### PRIORITÉ 2 : Tester et corriger les flows

Problèmes connus :
- Le wizard de migration ne fonctionne pas sans auth (le backend requiert un token JWT). Il faut soit :
  - Rendre les routes migration publiques (ajouter des routes sans `requireAuth`)
  - Soit demander un login/signup avant de lancer l'analyse
- Les liens internes ont été corrigés (`/sites/` → `/dashboard/sites/`) mais il peut rester des cas edge
- La création "from scratch" fonctionne (testé via Chrome MCP) mais l'éditeur visuel doit être vérifié en profondeur

### PRIORITÉ 3 : Fonctionnalités manquantes vs AI Builder v1

- **Input domaine sur la landing** (comme AI Builder v1 : un seul champ "monsite.ch" → Vérifier)
- **Page pricing** (3 plans avec prix)
- **Page contact** publique
- **Inscription/signup** pour les nouveaux utilisateurs (actuellement seul le seed admin existe)
- **Flow sans login** pour la migration : analyser → voir le résultat → signup pour sauvegarder

---

## Infrastructure

| Composant | Localisation | Notes |
|-----------|-------------|-------|
| Backend (dev) | `localhost:3005` | Node.js + Express |
| Frontend (dev) | `localhost:5173` | Vite dev server |
| MongoDB | `192.168.110.59:27017` | DB `ai-builder`, tunnel SSH port 27018 local |
| Serveur IA | `192.168.110.103:11434` | Ollama |
| qwen3-vl:8b | Installé sur .103 | Vision model pour migration |
| qwen3.5:9b-optimized | Déjà sur .103 | Génération contenu texte |
| qwen3.5:27b | Déjà sur .103 | Fallback qualité |
| Backend (prod) | Prévu sur `192.168.110.59` | À déployer |
| AI Builder v1 | `ai-builder.swigs.online` | Référence design (serveur 59) |

**Pour lancer le dev :**
```bash
# 1. Tunnel SSH MongoDB
ssh -f -N -L 27018:localhost:27017 swigs@192.168.110.59

# 2. Backend
cd /Users/corentinflaction/Documents/swigs/ai-builder/backend
node server.js

# 3. Frontend
cd /Users/corentinflaction/Documents/swigs/ai-builder/frontend
npx vite --port 5173
```

**Admin seed :** `admin@swigs.ch` / `AiBuilder2026!`

---

## Apps sources (NE PAS MODIFIER)

- **AI Builder v1 backend** : `/Users/corentinflaction/CascadeProjects/ai-builder-backend/`
- **Resamatic** : `/Users/corentinflaction/Documents/swigs/resamatic/`
- **AI Builder v1 frontend** : code source PERDU, seulement le build minifié sur serveur 59 (`/home/swigs/ai-builder-dist/`)
- **AI Builder v1 CSS extracté** : voir palette ci-dessus

---

## Fichiers clés du projet

### Backend (tout fonctionne)
```
backend/server.js                              — Express app, routes, MongoDB
backend/src/services/vision.service.js         — qwen3-vl + Claude Vision fallback
backend/src/services/migration.service.js      — Orchestration pipeline complet
backend/src/services/content-mapper.service.js — Vision → sections Resamatic
backend/src/services/screenshot.service.js     — Puppeteer capture
backend/src/services/scraper.service.js        — Cheerio text fallback
backend/src/services/ai.service.js             — Génération contenu (Resamatic)
backend/src/services/ssg.service.js            — Handlebars SSG + design styles
backend/src/controllers/migrationController.js — 7 endpoints migration
backend/src/models/Migration.js                — Model migration
backend/src/models/Site.js                     — + designStyle, sourceUrl
```

### Frontend (design à refaire)
```
frontend/src/pages/LandingPage.jsx             — À REFAIRE avec palette AI Builder v1
frontend/src/pages/LoginPage.jsx               — À REFAIRE couleurs
frontend/src/pages/MigrationWizardPage.jsx     — À REFAIRE couleurs
frontend/src/pages/PageEditorPage.jsx          — Éditeur visuel (de Resamatic, garder tel quel)
frontend/src/pages/DashboardPage.jsx           — Dashboard sites
frontend/src/pages/SiteCreatePage.jsx          — Création from scratch
frontend/src/components/Layout.jsx             — Sidebar dashboard
frontend/src/components/DesignStyleSelector.jsx — Choix style
frontend/src/stores/migrationStore.js          — Zustand migration
frontend/src/index.css                         — Tokens CSS (À REFAIRE)
frontend/src/App.jsx                           — Routes (/ public, /dashboard privé)
```

### Templates SSG
```
templates/sections/                            — 15 templates Handlebars
templates/assets/styles/                       — 5 CSS design styles
templates/layouts/base.hbs                     — Layout avec class style-{{designStyle}}
```

---

## Par où commencer la prochaine session

1. **Ouvrir le site de référence** : `https://ai-builder.swigs.online/` dans Chrome
2. **Remplacer la palette** dans `index.css` : fond `#020617`, accent `#0ea5e9`, gradients sky→purple→pink
3. **Refaire `LandingPage.jsx`** pixel-perfect depuis le site de référence (utiliser Chrome MCP pour comparer)
4. **Propager les couleurs** dans LoginPage, MigrationWizard, Layout, et les overrides CSS
5. **Ajouter les sections manquantes** : pricing (3 plans), témoignages
6. **Tester chaque flow** avec Chrome MCP après chaque changement
7. **Ne pas toucher au backend** — il fonctionne

---

## Décisions techniques confirmées

- **Output sites** : SSG Handlebars uniquement (pas React+Vite)
- **Templates** : 1 template .hbs par section + classes CSS conditionnelles par style
- **Migration** : choix utilisateur "fidèle" / "moderniser"
- **Public SaaS** dès le départ, migration accessible sans login
- **Pas de Stripe** pour l'instant
- **Vision IA** : qwen3-vl:8b (Ollama local) → Claude Vision (API) → scraping texte
- **Contenu IA** : qwen3.5:9b (Ollama local) → Claude Haiku (API)
