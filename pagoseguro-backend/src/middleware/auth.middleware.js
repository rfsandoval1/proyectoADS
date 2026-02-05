"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
class AuthMiddleware {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    authenticate() {
        return async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader?.startsWith('Bearer ')) {
                    res.status(401).json({
                        success: false,
                        message: 'Token no proporcionado',
                    });
                    return;
                }
                const token = authHeader.substring(7);
                const payload = await this.tokenService.verifyAccessToken(token);
                req.user = payload;
                next();
            }
            catch (e) {
                const error = e;
                console.error('Auth error:', error.message);
                res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado',
                });
            }
        };
    }
    authorize(allowedRoles) {
        return (req, res, next) => {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'No autenticado',
                });
                return;
            }
            if (!allowedRoles.includes(user.role)) {
                res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para acceder a este recurso',
                });
                return;
            }
            next();
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
