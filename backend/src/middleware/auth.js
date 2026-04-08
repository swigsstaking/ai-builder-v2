import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware d'authentification OBLIGATOIRE
 * Bloque si pas de token valide
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Utilisateur invalide' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
};

/**
 * Middleware d'authentification OPTIONNELLE
 * Continue même sans token, mais attache user si présent
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    req.user = user?.isActive ? user : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Génère un JWT pour l'application
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const requireAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

export const requireSiteAccess = async (req, res, next) => {
  if (req.user.role === 'superadmin') return next();
  const siteId = req.params.siteId || req.params.id;
  if (!siteId) return res.status(403).json({ error: 'Access denied' });

  // Check ownership via assignedSites
  if (req.user.assignedSites.some(id => id.toString() === siteId)) return next();

  // Check ownership via owner field
  const Site = (await import('../models/Site.js')).default;
  const site = await Site.findById(siteId).select('owner').lean();
  if (site && site.owner?.toString() === req.user._id.toString()) return next();

  return res.status(403).json({ error: 'Access denied' });
};
