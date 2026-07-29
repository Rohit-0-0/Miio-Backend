import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@/shared/validation';
import { requireAuth } from '@/shared/middleware/auth';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  verifyEmailSchema 
} from './auth.validation';

const router = Router();
const controller = new AuthController();

router.get('/me', requireAuth, controller.me.bind(controller));
router.post('/register', validate(registerSchema), controller.register.bind(controller));
router.post('/login', validate(loginSchema), controller.login.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword.bind(controller));
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword.bind(controller));
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail.bind(controller));

export const authRoutes = router;
