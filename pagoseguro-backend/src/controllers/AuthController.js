"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_validator_1 = require("../utils/validators/auth.validator");
const exceptions_1 = require("../utils/exceptions");
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(req, res) {
        try {
            const validatedData = auth_validator_1.registerClientSchema.parse(req.body);
            const dto = {
                ...validatedData,
                ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
            };
            const result = await this.authService.register(dto);
            res.status(201).json(result);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async login(req, res) {
        try {
            const validatedData = auth_validator_1.loginSchema.parse(req.body);
            const dto = {
                ...validatedData,
                ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
            };
            const result = await this.authService.login(dto);
            res.cookie('refreshToken', result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                accessToken: result.accessToken,
                user: result.user,
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }
            const dto = {
                userId,
                refreshToken,
                ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
            };
            const result = await this.authService.logout(dto);
            res.clearCookie('refreshToken');
            res.status(200).json(result);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async recoverPassword(req, res) {
        try {
            const validatedData = auth_validator_1.recoverPasswordSchema.parse(req.body);
            const dto = {
                ...validatedData,
                ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
            };
            const result = await this.authService.recoverPassword(dto);
            res.status(200).json(result);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    handleError(error, res) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validación de datos fallida',
                errors: error.errors,
            });
            return;
        }
        if (error instanceof exceptions_1.UserAlreadyExistsException) {
            res.status(409).json({
                success: false,
                message: error.message,
            });
            return;
        }
        if (error instanceof exceptions_1.InvalidCredentialsException) {
            res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas',
            });
            return;
        }
        if (error instanceof exceptions_1.UserNotFoundException) {
            res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas',
            });
            return;
        }
        if (error instanceof exceptions_1.DomainException) {
            res.status(403).json({
                success: false,
                message: error.message,
            });
            return;
        }
        console.error('Error no controlado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
}
exports.AuthController = AuthController;
