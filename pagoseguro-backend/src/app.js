"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("express-async-errors");
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
function createApp(authRouter, userRouter, creditRouter, paymentRouter, dashboardRouter) {
    const app = (0, express_1.default)();
    // Middleware de seguridad
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: env_1.config.nodeEnv === 'production' ? undefined : false,
    }));
    // CORS
    app.use((0, cors_1.default)({
        origin: [
            'http://localhost:4000',
            'http://localhost:8080'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    // Parsers
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, cookie_parser_1.default)());
    // Logger de requests
    app.use(logger_middleware_1.requestLogger);
    // Health check
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            service: 'PagoSeguroAGROTAC API',
            timestamp: new Date().toISOString(),
            environment: env_1.config.nodeEnv,
        });
    });
    // Rutas API
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/users', userRouter);
    app.use('/api/v1/credits', creditRouter);
    app.use('/api/v1/payments', paymentRouter);
    app.use('/api/v1/dashboard', dashboardRouter);
    // Ruta 404
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado',
            path: req.originalUrl,
        });
    });
    // Manejo de errores (debe ir al final)
    app.use(error_middleware_1.errorHandler);
    return app;
}
