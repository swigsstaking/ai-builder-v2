import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  startAnalysis,
  getStatus,
  updateExtracted,
  triggerMapping,
  updateMapping,
  createSiteFromMigration,
  cancelMigration,
} from '../controllers/migrationController.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.post('/analyze', startAnalysis);
router.get('/:id', getStatus);
router.put('/:id/extracted', updateExtracted);
router.post('/:id/map', triggerMapping);
router.put('/:id/mapping', updateMapping);
router.post('/:id/create-site', createSiteFromMigration);
router.delete('/:id', cancelMigration);

export default router;
