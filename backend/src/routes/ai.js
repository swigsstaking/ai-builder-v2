import { Router } from 'express';
import { generatePage, generateContact, generateCityPage, generateBookingPage, generateSeo, optimizeSeo, rewrite, generateAlt } from '../controllers/aiController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
// AI generation is available to all authenticated users (SaaS multi-tenant)

router.post('/generate-page', generatePage);
router.post('/generate-contact', generateContact);
router.post('/generate-city-page', generateCityPage);
router.post('/generate-booking-page', generateBookingPage);
router.post('/generate-seo', generateSeo);
router.post('/optimize-seo', optimizeSeo);
router.post('/rewrite', rewrite);
router.post('/generate-alt', generateAlt);

export default router;
