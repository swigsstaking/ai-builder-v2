import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { PkceState, AuthCode } from '../models/OAuthState.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Environment config
const HUB_URL = process.env.HUB_URL || 'https://apps.swigs.online';
const APP_ID = process.env.APP_ID || 'ai-builder';
const APP_SECRET = process.env.APP_SECRET;

// Hash a refresh token with SHA-256
const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * GET /api/auth/login
 * Start OAuth flow with PKCE
 */
router.get('/login', async (req, res) => {
  let returnUrl = req.query.returnUrl || '/';

  // Validate returnUrl
  if (returnUrl.startsWith('http://') || returnUrl.startsWith('https://')) {
    returnUrl = '/';
  } else if (!returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
    returnUrl = '/';
  }

  // Generate PKCE values
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');

  // Store verifier in MongoDB (expires in 10 min)
  await PkceState.create({
    state,
    codeVerifier,
    returnUrl,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  // Build authorization URL
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/callback`;
  const authUrl = new URL(`${HUB_URL}/api/oauth/authorize`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', APP_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', 'profile');

  res.redirect(authUrl.toString());
});

/**
 * GET /api/auth/callback
 * OAuth callback - exchange code for tokens
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('OAuth error from Hub:', error);
      return res.redirect(`/?auth_error=${encodeURIComponent(error)}`);
    }

    // Validate state and get verifier (atomic findOneAndDelete)
    const pkceData = await PkceState.findOneAndDelete({
      state,
      expiresAt: { $gt: new Date() }
    });
    if (!pkceData) {
      return res.redirect('/?auth_error=invalid_state');
    }

    // Exchange code for tokens
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/callback`;
    const tokenResponse = await fetch(`${HUB_URL}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: APP_ID,
        code_verifier: pkceData.codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange failed:', err);
      return res.redirect('/?auth_error=token_exchange_failed');
    }

    const { access_token, id_token } = await tokenResponse.json();

    // Verify id_token with APP_SECRET
    if (!APP_SECRET) {
      console.error('APP_SECRET not configured — cannot verify id_token');
      return res.redirect('/?auth_error=config_error');
    }

    let hubUser;
    try {
      hubUser = jwt.verify(id_token, APP_SECRET);
    } catch (err) {
      console.error('id_token verification failed:', err.message);
      return res.redirect('/?auth_error=token_verification_failed');
    }

    // Validate avatar URL (only https allowed)
    let avatar = hubUser.picture || hubUser.avatar || null;
    if (avatar && !avatar.startsWith('https://')) {
      avatar = null;
    }

    // Find or create local user (migration by email for existing users)
    let user = await User.findOne({
      $or: [{ hubUserId: hubUser.sub }, { email: hubUser.email }]
    });

    if (user) {
      user.hubUserId = hubUser.sub;
      user.name = hubUser.name || user.name;
      user.avatar = avatar || user.avatar;
      user.authMethod = 'sso';
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = await User.create({
        hubUserId: hubUser.sub,
        email: hubUser.email,
        name: hubUser.name || hubUser.email.split('@')[0],
        avatar,
        authMethod: 'sso',
        lastLogin: new Date()
      });
    }

    // Generate app tokens
    const appAccessToken = generateToken(user._id);
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Store session with hashed refresh token
    await Session.create({
      userId: user._id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Generate one-time auth code (not tokens in URL)
    const authCode = crypto.randomBytes(32).toString('hex');
    await AuthCode.create({
      code: authCode,
      accessToken: appAccessToken,
      refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 1000) // 30 seconds TTL
    });

    // Redirect with auth code
    const returnUrl = new URL(pkceData.returnUrl, `${req.protocol}://${req.get('host')}`);
    returnUrl.searchParams.set('auth_code', authCode);

    res.redirect(returnUrl.toString());

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?auth_error=internal_error');
  }
});

/**
 * POST /api/auth/exchange
 * Exchange a one-time auth code for tokens
 */
router.post('/exchange', async (req, res) => {
  try {
    const { authCode } = req.body;

    if (!authCode) {
      return res.status(400).json({ error: 'Auth code requis' });
    }

    // Atomic findOneAndDelete: one-time use
    const codeData = await AuthCode.findOneAndDelete({
      code: authCode,
      expiresAt: { $gt: new Date() }
    });

    if (!codeData) {
      return res.status(401).json({ error: 'Code invalide ou expiré' });
    }

    const user = await User.findById(codeData.userId);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    res.json({
      accessToken: codeData.accessToken,
      refreshToken: codeData.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth code exchange error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'échange du code' });
  }
});

// Rate limiter for refresh endpoint
const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives. Réessayez dans une minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/auth/refresh
 * Refresh access token with token rotation
 */
router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const session = await Session.findOne({
      refreshTokenHash: tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    const user = await User.findById(session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Utilisateur invalide' });
    }

    // Token rotation: revoke old session and create new one
    session.isRevoked = true;
    await session.save();

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    await Session.create({
      userId: user._id,
      refreshTokenHash: hashRefreshToken(newRefreshToken),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const accessToken = generateToken(user._id);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Erreur de rafraîchissement' });
  }
});

/**
 * GET /api/auth/me
 * Retourne l'utilisateur connecté
 */
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      role: req.user.role,
      assignedSites: req.user.assignedSites
    }
  });
});

/**
 * POST /api/auth/logout
 * Révoque la session
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      await Session.updateOne(
        { refreshTokenHash: tokenHash },
        { isRevoked: true }
      );
    }

    res.json({ message: 'Déconnecté' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Erreur de déconnexion' });
  }
});

export default router;
