import { Router } from 'express';
import { list, getOne, create, update, remove, duplicate, fetchGoogleReviews } from '../controllers/siteController.js';
import { requireAuth, requireAdmin, requireSiteAccess } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', list);
router.post('/', create); // Any authenticated user can create a site
router.get('/:id', requireSiteAccess, getOne);
router.put('/:id', requireSiteAccess, update);
router.delete('/:id', requireSiteAccess, remove); // Owner can delete their own site
router.post('/:id/duplicate', requireSiteAccess, duplicate);
router.post('/:id/fetch-reviews', requireSiteAccess, fetchGoogleReviews);

export default router;
