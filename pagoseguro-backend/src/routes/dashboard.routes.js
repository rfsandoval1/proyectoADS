"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDashboardRoutes = createDashboardRoutes;
const express_1 = require("express");
function createDashboardRoutes(dashboardController, authMiddleware) {
    const router = (0, express_1.Router)();
    router.get('/manager', authMiddleware.authenticate(), (req, res) => dashboardController.getManagerMetrics(req, res));
    router.get('/assistant', authMiddleware.authenticate(), (req, res) => dashboardController.getAssistantMetrics(req, res));
    router.get('/monthly-data', authMiddleware.authenticate(), (req, res) => dashboardController.getMonthlyData(req, res));
    router.get('/credit-distribution', authMiddleware.authenticate(), (req, res) => dashboardController.getCreditDistribution(req, res));
    router.get('/tasks', authMiddleware.authenticate(), (req, res) => dashboardController.getTasks(req, res));
    router.get('/alerts', authMiddleware.authenticate(), (req, res) => dashboardController.getAlerts(req, res));
    router.get('/clients', authMiddleware.authenticate(), (req, res) => dashboardController.getClients(req, res));
    router.get('/delinquent-clients', authMiddleware.authenticate(), (req, res) => dashboardController.getDelinquentClients(req, res));
    return router;
}
