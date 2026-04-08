# Session 2026-04-08 — Préparation SSO Hub

## Ce qui a été fait cette session

### 1. Revert multi-pages
- Toutes les modifications multi-pages (Phase 1-3) ont été annulées
- Le code est revenu à l'état original (homepage + contact uniquement)
- Poussé sur GitHub : github.com/swigsstaking/ai-builder-v2

### 2. Bug fixes qualité
- **Fix services vides** : `mapAiContentToSections` écrasait les services AI avec `otherPages` quand la liste était vide
- **Fix HTML brut dans body** : `dangerouslySetInnerHTML` pour les champs body contenant du HTML (`<p>`, `<strong>`)
- **Fix bullet points vides** : `point.value || point.text` (les données utilisent `value`, le rendu cherchait `text`)

### 3. Déploiement production
- Frontend build déployé sur /var/www/ai-builder/ (serveur .59)
- Nginx configuré : proxy API port 4005, SSL, client_max_body_size 50m
- https://ai-builder.swigs.online/ opérationnel

### 4. Google OAuth + inscription publique
- Bouton Google Sign-In sur login + register (via @react-oauth/google)
- Page /register publique (formulaire + Google)
- Backend : POST /api/auth/google (vérification ID token, find-or-create user)
- Modèle User étendu : googleId, avatar, authMethod

### 5. Audit qualité des sites
- 4 sites créés + 1 migration testés
- Templates Modern, Bold, Elegant vérifiés
- Contenu IA de bonne qualité (services, about, FAQ, témoignages)

### 6. Recherche SSO Hub
- Lu le guide SSO complet (SSO_INTEGRATION_PROMPT.md)
- Lu l'implémentation Calendar (routes auth, modèles, middleware)
- Lu le Hub apps.js (registry des apps)
- Identifié toutes les différences à résoudre (JWT payload { id } vs { userId })
- Préparé le prompt complet pour la prochaine session

## Architecture SSO cible

```
User → AI Builder /login → bouton "Se connecter"
       → redirect /api/auth/login (PKCE)
       → redirect Hub /api/oauth/authorize
       → Hub login (Magic Link / email+pwd / Google)
       → redirect AI Builder /api/auth/callback
       → échange code → tokens
       → find-or-create user (hubUserId)
       → redirect frontend avec auth_code
       → frontend POST /api/auth/exchange
       → accessToken + refreshToken stockés
       → dashboard
```

## État du code actuel
- Git : 3 commits sur main (initial + services fix + template HTML fix + Google OAuth)
- Backend : port 4005, PM2 ai-builder-v2, MongoDB swigs-cms sur .73
- Frontend : build Vite, déployé /var/www/ai-builder/
- Auth : JWT local { id: userId } + Google OAuth
- Users existants : ~12 users dans la DB, pas de hubUserId

## Serveurs
| Serveur | IP | Port | Usage |
|---------|-----|------|-------|
| AI Builder backend | 192.168.110.59 | 4005 | PM2 ai-builder-v2 |
| Hub SWIGS | 192.168.110.59 | 3006 | PM2 swigs-hub |
| Calendar | 192.168.110.59 | 3008 | PM2 swigs-calendar |
| Ollama | 192.168.110.103 | 11434 | GPU, OCR |
| MongoDB | 192.168.110.73 | 27017 | DB partagée |
| Frontend prod | 192.168.110.59 | 443 | Nginx → /var/www/ai-builder |
