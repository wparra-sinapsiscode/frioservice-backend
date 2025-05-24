import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/change-password', authenticate, AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);
router.get('/verify-token', authenticate, AuthController.verifyToken);

export default router;