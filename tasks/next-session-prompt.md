# Prompt pour la prochaine session

```
Lis le fichier tasks/session-2026-04-08-sso.md pour le contexte complet.

## Mission : Migrer l'auth AI Builder vers le SSO Hub SWIGS

### Contexte
AI Builder est un SaaS de création de sites web via IA. Le backend tourne sur 192.168.110.59 (PM2 ai-builder-v2, port 4005), le frontend sur https://ai-builder.swigs.online. Le code source est sur GitHub : github.com/swigsstaking/ai-builder-v2. SSH: user swigs, sudo password Labo. Login app: admin@swigs.online / Admin123!.

L'auth actuelle est locale (email/password + Google OAuth). Il faut migrer vers le SSO Hub SWIGS (apps.swigs.online, port 3006) pour que les JWT fonctionnent cross-service avec swigs-calendar (port 3008) et les autres apps SWIGS.

### Ce qui est déjà fait
- Google OAuth fonctionne (bouton sur login + register)
- Inscription publique fonctionne (route /register)
- Le guide SSO est lu et compris (voir SSO_INTEGRATION_PROMPT.md dans /CascadeProjects/swigs-workflow/)

### Ce qu'il faut faire (dans l'ordre)

#### 1. Enregistrer AI Builder dans le Hub (config)
- Fichier : /home/swigs/swigs-hub/backend/src/config/apps.js (sur le serveur .59 via SSH)
- Ajouter l'entrée 'ai-builder' dans registeredApps (voir les entrées existantes comme modèle)
- Générer un APP_SECRET : openssl rand -hex 32
- Ajouter APP_SECRET_AI_BUILDER=xxx dans /home/swigs/swigs-hub/backend/.env
- pm2 restart swigs-hub

#### 2. Configurer AI Builder .env
- Ajouter au .env du serveur (/home/swigs/ai-builder-v2-backend/.env) :
  HUB_URL=https://apps.swigs.online
  APP_ID=ai-builder
  APP_SECRET=<même valeur que APP_SECRET_AI_BUILDER>

#### 3. Backend : Créer les modèles OAuthState et Session
- Copier le pattern de Calendar (/home/swigs/swigs-calendar/backend/src/models/)
  - OAuthState.js : PkceState (state, codeVerifier, returnUrl, expiresAt) + AuthCode (code, accessToken, refreshToken, userId, expiresAt)
  - Session.js : userId, refreshTokenHash, userAgent, ipAddress, expiresAt, isRevoked

#### 4. Backend : Modifier le modèle User
- Ajouter : hubUserId (String, unique, sparse)
- Garder : googleId, avatar, authMethod, password (pour backward compat pendant migration)

#### 5. Backend : Réécrire les routes auth
- Copier le pattern exact de Calendar (/home/swigs/swigs-calendar/backend/src/routes/auth.js)
- Routes à implémenter :
  - GET /api/auth/login → PKCE flow (génère state+verifier, redirige vers Hub)
  - GET /api/auth/callback → échange code contre tokens, find-or-create user, redirige avec auth_code
  - POST /api/auth/exchange → échange auth_code one-time contre accessToken + refreshToken
  - POST /api/auth/refresh → rotation de refresh token
  - GET /api/auth/me → infos user connecté
  - POST /api/auth/logout → révoque session
- IMPORTANT : le JWT Calendar utilise { userId }, AI Builder actuel utilise { id }. Aligner sur { userId } pour compatibilité cross-service.

#### 6. Backend : Modifier le middleware auth
- requireAuth doit chercher decoded.userId (pas decoded.id)
- generateToken doit signer avec { userId } (pas { id })

#### 7. Frontend : Adapter le login
- Supprimer le formulaire email/password local (remplacé par le SSO)
- Garder Google OAuth (le Hub le gère aussi)
- Le bouton "Se connecter" redirige vers /api/auth/login (qui lance le flow PKCE)
- Le retour du callback ajoute ?auth_code=xxx à l'URL
- Le frontend détecte le auth_code dans l'URL et appelle POST /api/auth/exchange
- Stocker accessToken + refreshToken dans localStorage
- L'auth store gère le refresh automatique

#### 8. Frontend : Auth store refactoring
- Remplacer le login local par loginWithHub() → window.location = /api/auth/login
- Ajouter exchangeAuthCode(code) → POST /api/auth/exchange
- Ajouter refreshAccessToken() → POST /api/auth/refresh
- Le token stocké dans localStorage change de aibuilder_token à aibuilder_access_token + aibuilder_refresh_token

### Fichiers de référence (à lire sur le serveur .59 via SSH)
- Calendar auth routes : /home/swigs/swigs-calendar/backend/src/routes/auth.js (467 lignes, implémentation complète PKCE)
- Calendar OAuthState model : /home/swigs/swigs-calendar/backend/src/models/OAuthState.js
- Calendar Session model : /home/swigs/swigs-calendar/backend/src/models/Session.js
- Calendar auth middleware : /home/swigs/swigs-calendar/backend/src/middleware/auth.js
- Hub apps registry : /home/swigs/swigs-hub/backend/src/config/apps.js
- Hub .env : /home/swigs/swigs-hub/backend/.env
- Guide SSO complet : /Users/corentinflaction/CascadeProjects/swigs-workflow/SSO_INTEGRATION_PROMPT.md

### Fichiers AI Builder à modifier
Backend :
- backend/src/models/User.js — ajouter hubUserId
- backend/src/models/OAuthState.js — nouveau (PkceState + AuthCode)
- backend/src/models/Session.js — nouveau
- backend/src/routes/auth.js — réécrire (PKCE flow)
- backend/src/controllers/authController.js — adapter ou supprimer
- backend/src/middleware/auth.js — aligner sur { userId }

Frontend :
- frontend/src/stores/authStore.js — refactoring complet (Hub SSO)
- frontend/src/pages/LoginPage.jsx — redirection Hub
- frontend/src/pages/RegisterPage.jsx — redirection Hub
- frontend/src/services/api.js — adapter intercepteur token
- frontend/src/App.jsx — détecter auth_code dans URL

### Points d'attention
- Le backend est en PROD — ne pas casser les users existants
- Les users existants seront migrés automatiquement par email matching au callback SSO
- Deploy via scp + pm2 restart ai-builder-v2
- Tester avec Chrome MCP sur https://ai-builder.swigs.online/login
- Le Hub est aussi sur .59 — attention aux restarts (pm2 restart swigs-hub)
```
