import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createPaymentRoutes(paymentController: PaymentController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  router.get('/', authMiddleware.authenticate(), (req, res) => paymentController.listPayments(req, res));
  router.get('/my', authMiddleware.authenticate(), (req, res) => paymentController.getMyPayments(req, res));
  router.get('/my-pending', authMiddleware.authenticate(), (req, res) => paymentController.getMyPendingPayments(req, res));
  router.post('/', authMiddleware.authenticate(), (req, res) => paymentController.createPayment(req, res));
  router.put('/:id', authMiddleware.authenticate(), (req, res) => paymentController.updatePayment(req, res));
  router.delete('/:id', authMiddleware.authenticate(), (req, res) => paymentController.deletePayment(req, res));
  router.get('/:clientId/recent', authMiddleware.authenticate(), (req, res) => paymentController.getRecentPayments(req, res));

  return router;
}
