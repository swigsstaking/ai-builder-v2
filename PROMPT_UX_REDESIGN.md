# Prompt : Refonte UX/UI complète — AI Builder v2

## Ta mission

Tu es l'architecte UX/UI de l'app AI Builder v2. Ta mission est de refondre **tout le design de la partie post-connexion** (dashboard, éditeur, pages admin) pour qu'il soit cohérent avec la landing page dark et professionnel.

## Contexte

L'app est un SaaS de création/migration de sites web par IA. Elle fonctionne déjà techniquement mais le design de la partie admin est un copier-coller d'une autre app (Resamatic) avec des hacks CSS dark. C'est incohérent et pas pro.

**Ce qui est fait et bien :**
- Landing page dark (violet/bleu) avec pricing, témoignages, grid blueprint
- Login page dark cohérente
- Wizard de migration dark
- Backend complet (pipeline vision IA, SSG, déploiement)

**Ce qui est à refaire :**
- TOUT ce qui vient après le login : dashboard, création, éditeur, settings, SEO, médias, pages

## Approche

Crée des agents spécialisés pour travailler en parallèle :

1. **Agent Audit UX** — Analyse chaque page existante, identifie les problèmes de contraste, incohérences, UX broken
2. **Agent UI Designer** — Propose le nouveau design pour chaque page (composants, layout, couleurs, spacing)
3. **Agent Frontend Dev** — Implémente les changements JSX/CSS
4. **Agent QA** — Teste chaque page avec Chrome MCP après les modifications

## Palette obligatoire

```
BG:        #0f0f1a
Surface:   #1a1a2e  
Cards:     #1e1e35
Sidebar:   #151525
Inputs:    #151525
Borders:   rgba(255,255,255,0.07)
Gradient:  linear-gradient(135deg, #7c3aed, #3b82f6)
Text:      #e2e8f0 (principal) / #94a3b8 (secondaire) / #64748b (muted)
Accent:    #7c3aed (violet) / #a78bfa (text violet)
```

## Règles absolues

1. **JAMAIS de fond blanc** — tout est dark
2. **L'éditeur visuel (PageEditorPage.jsx) doit FONCTIONNER** — ne casse pas la logique PostMessage/iframe
3. **Le backend ne doit PAS être modifié**
4. **Les templates SSG ne doivent PAS être modifiés**
5. **Teste avec Chrome MCP** après chaque modification majeure
6. **Effet blueprint grid** (.blueprint-grid class) peut être utilisé sur certaines pages

## Pages à refondre (par priorité)

### 1. DashboardPage.jsx
- Grille de cartes pour les sites (avec preview thumbnail si possible)
- Vide state élégant avec CTA vers création
- Badges status (draft/published) stylés dark
- Boutons d'action cohérents

### 2. PageEditorPage.jsx (LE PLUS CRITIQUE)
- Panneau gauche : fond #151525, sections listées avec icônes, champs d'édition dark
- Barre du haut : fond dark avec viewport switcher et bouton reconstruire
- GARDER toute la logique (PostMessage, iframe, auto-save, Tiptap)
- Ne changer QUE les classes CSS / styles inline

### 3. SiteCreatePage.jsx
- Flow 3 étapes dark cohérent
- L'écran de choix (Créer / Importer) doit ressembler aux cards de la landing
- Formulaires avec inputs dark

### 4. PagesListPage.jsx
- Liste des pages en cards dark
- Boutons d'action (éditer, supprimer, nouvelle page)

### 5. SiteSettingsPage.jsx
- Formulaires settings en sections dark
- Color pickers, font selectors
- DesignStyleSelector intégré

### 6. Autres pages
- MediaLibraryPage, SeoPage, UserManagementPage, BillingPage

## Fichiers clés

```
frontend/src/index.css                 — Tokens CSS et overrides globaux
frontend/src/App.jsx                   — Routes (/ public, /dashboard privé)
frontend/src/components/Layout.jsx     — Sidebar (déjà dark)
frontend/src/pages/LandingPage.jsx     — RÉFÉRENCE du bon design
frontend/src/pages/PageEditorPage.jsx  — Éditeur (~400 lignes, le plus complexe)
frontend/src/pages/DashboardPage.jsx   — Dashboard sites
frontend/src/pages/SiteCreatePage.jsx  — Création 3 étapes
frontend/src/pages/PagesListPage.jsx   — Liste pages
```

## Comment vérifier

1. `cd frontend && npx vite build` — doit compiler sans erreur
2. Ouvrir Chrome MCP sur chaque page et prendre des screenshots
3. Vérifier que l'éditeur visuel charge l'iframe et que le PostMessage fonctionne
4. Vérifier que la création de site fonctionne (3 étapes → site créé → éditeur)
5. Vérifier que la migration fonctionne (URL → analyse → sections → création)

## Templates des sites générés

L'AI Builder v1 avait **5 templates React complets** (modern, bold, elegant, minimal, artistic) dans son frontend. Le code source est perdu mais les composants sont extractibles du bundle JS minifié sur le serveur 59 (`/home/swigs/ai-builder-dist/assets/index-Bw5X756J.js`, 487KB).

**Structure des templates AI Builder v1** (extraite du bundle) :
- 5 composants de style : un par designStyle (artistic, bold, elegant, minimal, modern)
- 4 composants de pages : Shop (`qm`), About (`fS`), Contact (`mS`), Services (`hS`)  
- Composant preview (`pS`) qui route vers le bon style
- Config par style (`Gm`) : borderRadius, buttonStyle, fontFamily
- Switch de rendu : `case"artistic":return cy; case"bold":return uy; ...`
- Chaque template recevait : `{content, pageContent, colors, siteName, designStyle, styleConfig}`

**Pour extraire les templates** : copier le bundle depuis `ssh swigs@192.168.110.59 "cat /home/swigs/ai-builder-dist/assets/index-Bw5X756J.js"` et utiliser un outil de déminification pour extraire les 5 composants de style + 4 composants de pages. Les recréer en JSX propre en s'inspirant du code déminifié.

Le système actuel utilise des templates Handlebars (SSG) hérités de Resamatic (15 sections : hero, description, services-grid, faq, testimonials, etc.).

**Ce qui est attendu :**
- Garder le système SSG Handlebars (il fonctionne avec l'éditeur visuel)
- MAIS améliorer significativement le design CSS des 15 templates de sections pour qu'ils soient plus modernes et pro
- Les 5 design styles (modern, bold, elegant, minimal, artistic) doivent produire des résultats visuellement distincts et de qualité professionnelle
- S'inspirer du niveau de qualité des sites que l'AI Builder v1 générait (design React moderne) mais avec le système Handlebars
- Les fichiers de templates sont dans `/templates/sections/*.hbs` et les styles dans `/templates/assets/styles/*.css`
- Le CSS de base est dans `/templates/assets/main.css`

**L'éditeur visuel (PageEditorPage.jsx) :**
- C'est le composant clé hérité de Resamatic
- Il utilise un iframe + PostMessage pour la preview live
- Le panneau gauche permet d'éditer les sections, le panneau droit montre la preview
- NE PAS casser la logique PostMessage — seul le STYLE doit changer

## Résultat attendu

Un design cohérent, dark, professionnel, de qualité SaaS sur TOUTES les pages. L'utilisateur ne doit jamais voir de fond blanc, de texte illisible, ou d'incohérence de style entre la landing et le dashboard. Les templates de sections Handlebars doivent produire des sites visuellement modernes et professionnels.
