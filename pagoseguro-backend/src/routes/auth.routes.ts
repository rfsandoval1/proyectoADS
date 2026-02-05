import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createAuthRoutes(
  authController: AuthController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/recover-password', (req, res) => authController.recoverPassword(req, res));
  router.post('/logout', authMiddleware.authenticate(), (req, res) => authController.logout(req, res));

  return router;
}
