"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRoutes = createUserRoutes;
const express_1 = require("express");
function createUserRoutes(userController, authMiddleware) {
    const router = (0, express_1.Router)();
    router.get('/me', authMiddleware.authenticate(), (req, res) => userController.getMe(req, res));
    router.get('/', authMiddleware.authenticate(), (req, res) => userController.listUsers(req, res));
    router.post('/register-assistant', authMiddleware.authenticate(), (req, res) => userController.registerAssistant(req, res));
    router.put('/:id', authMiddleware.authenticate(), (req, res) => userController.updateUser(req, res));
    router.delete('/:id', authMiddleware.authenticate(), (req, res) => userController.deleteUser(req, res));
    return router;
}
