import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createUserRoutes(userController: UserController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  router.get('/me', authMiddleware.authenticate(), (req, res) => userController.getMe(req, res));
  router.get('/', authMiddleware.authenticate(), (req, res) => userController.listUsers(req, res));
  router.post('/register-assistant', authMiddleware.authenticate(), (req, res) => userController.registerAssistant(req, res));
  router.put('/:id', authMiddleware.authenticate(), (req, res) => userController.updateUser(req, res));
  router.delete('/:id', authMiddleware.authenticate(), (req, res) => userController.deleteUser(req, res));

  return router;
}
