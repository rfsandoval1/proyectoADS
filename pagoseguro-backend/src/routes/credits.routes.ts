import { Router } from 'express';
import { CreditController } from '../controllers/CreditController';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createCreditRoutes(creditController: CreditController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  router.get('/', authMiddleware.authenticate(), (req, res) => creditController.listCredits(req, res));
  // Créditos del usuario autenticado
  router.get('/my', authMiddleware.authenticate(), (req, res) => creditController.getMyCredits(req, res));
  router.post('/', authMiddleware.authenticate(), (req, res) => creditController.createCredit(req, res));
  router.put('/:id', authMiddleware.authenticate(), (req, res) => creditController.updateCredit(req, res));
  router.delete('/:id', authMiddleware.authenticate(), (req, res) => creditController.deleteCredit(req, res));

  return router;
}
