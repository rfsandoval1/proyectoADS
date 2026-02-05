import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createDashboardRoutes(dashboardController: DashboardController, authMiddleware: AuthMiddleware): Router {
  const router = Router();
  router.get('/manager', authMiddleware.authenticate(), (req, res) => dashboardController.getManagerMetrics(req, res));
  router.get('/assistant', authMiddleware.authenticate(), (req, res) => dashboardController.getAssistantMetrics(req, res));
  router.get('/monthly-data', authMiddleware.authenticate(), (req, res) => dashboardController.getMonthlyData(req, res));
  router.get('/credit-distribution', authMiddleware.authenticate(), (req, res) => dashboardController.getCreditDistribution(req, res));
  router.get('/tasks', authMiddleware.authenticate(), (req, res) => dashboardController.getTasks(req, res));
  router.get('/alerts', authMiddleware.authenticate(), (req, res) => dashboardController.getAlerts(req, res));
  router.get('/clients', authMiddleware.authenticate(), (req, res) => dashboardController.getClients(req, res));
  router.get('/delinquent-clients', authMiddleware.authenticate(), (req, res) => dashboardController.getDelinquentClients(req, res));
  router.get('/audit-logs', authMiddleware.authenticate(), (req, res) => dashboardController.getAuditLogs(req, res));
  router.get('/payments-report', authMiddleware.authenticate(), (req, res) => dashboardController.getPaymentsReport(req, res));
  return router;
}
