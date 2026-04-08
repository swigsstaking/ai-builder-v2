import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser, resetPassword } from '../controllers/userController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.use(requireSuperAdmin);

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetPassword);

export default router;
