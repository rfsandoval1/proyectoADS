import { Router } from 'express';
import { PaymentVoucherController } from '../controllers/PaymentVoucherController';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createVoucherRoutes(
  voucherController: PaymentVoucherController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  // Rutas para clientes
  router.post('/', authMiddleware.authenticate(), (req, res) =>
    voucherController.createVoucher(req, res)
  );

  router.post('/validate', authMiddleware.authenticate(), (req, res) =>
    voucherController.validateVoucher(req, res)
  );

  router.get('/my', authMiddleware.authenticate(), (req, res) =>
    voucherController.getMyVouchers(req, res)
  );

  router.get('/credit/:creditId', authMiddleware.authenticate(), (req, res) =>
    voucherController.getVouchersByCreditId(req, res)
  );

  // Rutas para asistentes y gerentes
  router.get('/pending', authMiddleware.authenticate(), (req, res) =>
    voucherController.getPendingVouchers(req, res)
  );

  router.get('/', authMiddleware.authenticate(), (req, res) =>
    voucherController.getAllVouchers(req, res)
  );

  router.get('/:id', authMiddleware.authenticate(), (req, res) =>
    voucherController.getVoucherById(req, res)
  );

  router.post('/:id/approve', authMiddleware.authenticate(), (req, res) =>
    voucherController.approveVoucher(req, res)
  );

  router.post('/:id/reject', authMiddleware.authenticate(), (req, res) =>
    voucherController.rejectVoucher(req, res)
  );

  router.delete('/:id', authMiddleware.authenticate(), (req, res) =>
    voucherController.deleteVoucher(req, res)
  );

  return router;
}
