import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

const HUB_URL = process.env.HUB_URL || 'https://apps.swigs.online';
const APP_ID = process.env.APP_ID || 'ai-builder';
const APP_SECRET = process.env.APP_SECRET;

// Hash a refresh token with SHA-256
const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Find-or-create local user from Hub user data
 * Handles migration of existing users by email
 */
async function findOrCreateUser(hubUser) {
  const hubUserId = hubUser.id;
  const email = hubUser.email;

  let user = await User.findOne({
    $or: [{ hubUserId }, { email }]
  });

  if (user) {
    user.hubUserId = hubUserId;
    user.name = hubUser.name || user.name;
    if (hubUser.avatar && hubUser.avatar.startsWith('https://')) {
      user.avatar = hubUser.avatar;
    }
    user.authMethod = 'sso';
    user.lastLogin = new Date();
    await user.save();
  } else {
    user = await User.create({
      hubUserId,
      email,
      name: hubUser.name || email.split('@')[0],
      avatar: hubUser.avatar?.startsWith('https://') ? hubUser.avatar : null,
      authMethod: 'sso',
      lastLogin: new Date()
    });
  }

  return user;
}

/**
 * Create session and return tokens + user
 */
async function createSessionAndRespond(user, req, res) {
  const accessToken = generateToken(user._id);
  const refreshToken = crypto.randomBytes(64).toString('hex');

  await Session.create({
    userId: user._id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role
    }
  });
}

/**
 * POST /api/auth/login
 * Proxy email/password login to Hub
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const hubRes = await fetch(`${HUB_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const hubData = await hubRes.json();

    if (!hubRes.ok) {
      return res.status(hubRes.status).json({
        error: hubData.error || 'Identifiants incorrects',
        code: hubData.code
      });
    }

    const user = await findOrCreateUser(hubData.user);
    await createSessionAndRespond(user, req, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur de connexion' });
  }
});

/**
 * POST /api/auth/register
 * Proxy registration to Hub
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email et nom requis' });
    }

    const hubRes = await fetch(`${HUB_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });

    const hubData = await hubRes.json();

    if (!hubRes.ok) {
      return res.status(hubRes.status).json({
        error: hubData.error || 'Erreur lors de la création du compte'
      });
    }

    // If Hub returned tokens (password registration), create local user
    if (hubData.accessToken && hubData.user) {
      const user = await findOrCreateUser(hubData.user);
      return await createSessionAndRespond(user, req, res);
    }

    // Magic link registration (no password) — Hub sends email
    res.status(201).json({
      message: hubData.message || 'Compte créé. Vérifiez votre email.',
      user: hubData.user
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

/**
 * POST /api/auth/google
 * Proxy Google OAuth to Hub
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'ID token requis' });
    }

    const hubRes = await fetch(`${HUB_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const hubData = await hubRes.json();

    if (!hubRes.ok) {
      return res.status(hubRes.status).json({
        error: hubData.error || 'Erreur de connexion Google'
      });
    }

    const user = await findOrCreateUser(hubData.user);
    await createSessionAndRespond(user, req, res);

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Erreur de connexion Google' });
  }
});

/**
 * POST /api/auth/magic-link
 * Request magic link via Hub
 */
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const hubRes = await fetch(`${HUB_URL}/api/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        app: APP_ID,
        redirect: `https://ai-builder.swigs.online`
      })
    });

    const hubData = await hubRes.json();

    if (!hubRes.ok) {
      return res.status(hubRes.status).json({
        error: hubData.error || 'Erreur d\'envoi du magic link'
      });
    }

    res.json({ message: 'Si un compte existe, un lien de connexion a été envoyé.' });

  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Erreur d\'envoi du magic link' });
  }
});

/**
 * POST /api/auth/sso-callback
 * Verify SSO token from Hub (for magic link returns)
 */
router.post('/sso-callback', async (req, res) => {
  try {
    const { ssoToken } = req.body;
    if (!ssoToken) {
      return res.status(400).json({ error: 'SSO token requis' });
    }

    if (!APP_SECRET) {
      return res.status(500).json({ error: 'Configuration serveur incomplète' });
    }

    const hubRes = await fetch(`${HUB_URL}/api/auth/sso-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Secret': APP_SECRET
      },
      body: JSON.stringify({ ssoToken, appId: APP_ID })
    });

    const hubData = await hubRes.json();

    if (!hubRes.ok) {
      return res.status(hubRes.status).json({
        error: hubData.error || 'SSO token invalide'
      });
    }

    const hubUser = hubData.user;
    const user = await findOrCreateUser({
      id: hubUser.hubId || hubUser.id,
      email: hubUser.email,
      name: hubUser.name,
      avatar: hubUser.avatar
    });

    await createSessionAndRespond(user, req, res);

  } catch (error) {
    console.error('SSO callback error:', error);
    res.status(500).json({ error: 'Erreur de vérification SSO' });
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

    // Token rotation
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
