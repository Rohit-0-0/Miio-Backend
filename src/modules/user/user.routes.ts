import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth, requireAdmin } from '@/shared/middleware/auth';

const router = Router();

// Protect all user routes
router.use(requireAuth);

// Current User Routes
router.get('/me', userController.getMe);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.updatePassword);

// Admin Only Routes
router.use(requireAdmin);
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.updateUserStatus);
router.delete('/:id', userController.deleteUser);

export default router;
