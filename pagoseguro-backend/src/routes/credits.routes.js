"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreditRoutes = createCreditRoutes;
const express_1 = require("express");
function createCreditRoutes(creditController, authMiddleware) {
    const router = (0, express_1.Router)();
    router.get('/', authMiddleware.authenticate(), (req, res) => creditController.listCredits(req, res));
    // Créditos del usuario autenticado
    router.get('/my', authMiddleware.authenticate(), (req, res) => creditController.getMyCredits(req, res));
    router.post('/', authMiddleware.authenticate(), (req, res) => creditController.createCredit(req, res));
    router.put('/:id', authMiddleware.authenticate(), (req, res) => creditController.updateCredit(req, res));
    router.delete('/:id', authMiddleware.authenticate(), (req, res) => creditController.deleteCredit(req, res));
    return router;
}
