"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = require("express");
function createAuthRoutes(authController, authMiddleware) {
    const router = (0, express_1.Router)();
    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));
    router.post('/recover-password', (req, res) => authController.recoverPassword(req, res));
    router.post('/logout', authMiddleware.authenticate(), (req, res) => authController.logout(req, res));
    return router;
}
