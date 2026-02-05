"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeServer = initializeServer;
const DashboardService_1 = require("./services/DashboardService");
const DashboardController_1 = require("./controllers/DashboardController");
const dashboard_routes_1 = require("./routes/dashboard.routes");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = require("./app");
const PostgresUserRepository_1 = require("./repositories/PostgresUserRepository");
const PostgresCreditRepository_1 = require("./repositories/PostgresCreditRepository");
const PostgresPaymentRepository_1 = require("./repositories/PostgresPaymentRepository");
const PostgresRefreshTokenRepository_1 = require("./repositories/PostgresRefreshTokenRepository");
const PostgresAuditLogRepository_1 = require("./repositories/PostgresAuditLogRepository");
const JWTTokenService_1 = require("./services/JWTTokenService");
const SendGridEmailService_1 = require("./services/SendGridEmailService");
const AuthService_1 = require("./services/AuthService");
const UserDomainService_1 = require("./services/UserDomainService");
const AuditService_1 = require("./services/AuditService");
const AuthController_1 = require("./controllers/AuthController");
const UserController_1 = require("./controllers/UserController");
const CreditController_1 = require("./controllers/CreditController");
const PaymentController_1 = require("./controllers/PaymentController");
const auth_middleware_1 = require("./middleware/auth.middleware");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const credits_routes_1 = require("./routes/credits.routes");
const payments_routes_1 = require("./routes/payments.routes");
const sequelize_1 = __importDefault(require("./config/sequelize"));
async function initializeServer() {
    try {
        await sequelize_1.default.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida con Sequelize');
    }
    catch (error) {
        console.error('Error al conectar a PostgreSQL:', error);
        throw error;
    }
    // Sync all models — alter: true adds new columns to existing tables
    await sequelize_1.default.sync({ alter: true });
    console.log('✅ Tablas sincronizadas');
    const userRepository = new PostgresUserRepository_1.PostgresUserRepository(sequelize_1.default);
    const creditRepository = new PostgresCreditRepository_1.PostgresCreditRepository(sequelize_1.default);
    const paymentRepository = new PostgresPaymentRepository_1.PostgresPaymentRepository(sequelize_1.default);
    const refreshTokenRepository = new PostgresRefreshTokenRepository_1.PostgresRefreshTokenRepository(sequelize_1.default);
    const auditLogRepository = new PostgresAuditLogRepository_1.PostgresAuditLogRepository();
    const tokenService = new JWTTokenService_1.JWTTokenService();
    const emailService = new SendGridEmailService_1.SendGridEmailService();
    const auditService = new AuditService_1.AuditService(auditLogRepository);
    const userDomainService = new UserDomainService_1.UserDomainService(userRepository, emailService);
    const authService = new AuthService_1.AuthService(userRepository, refreshTokenRepository, tokenService, userDomainService, auditService);
    const authController = new AuthController_1.AuthController(authService);
    const userController = new UserController_1.UserController(userDomainService);
    const { CreditService } = await Promise.resolve().then(() => __importStar(require('./services/CreditService')));
    const { PaymentService } = await Promise.resolve().then(() => __importStar(require('./services/PaymentService')));
    const creditService = new CreditService(creditRepository);
    const paymentService = new PaymentService(paymentRepository);
    const creditController = new CreditController_1.CreditController(creditService);
    const paymentController = new PaymentController_1.PaymentController(paymentService);
    const authMiddleware = new auth_middleware_1.AuthMiddleware(tokenService);
    const authRouter = (0, auth_routes_1.createAuthRoutes)(authController, authMiddleware);
    const userRouter = (0, user_routes_1.createUserRoutes)(userController, authMiddleware);
    const creditRouter = (0, credits_routes_1.createCreditRoutes)(creditController, authMiddleware);
    const paymentRouter = (0, payments_routes_1.createPaymentRoutes)(paymentController, authMiddleware);
    const dashboardService = new DashboardService_1.DashboardService(sequelize_1.default);
    const dashboardController = new DashboardController_1.DashboardController(dashboardService);
    const dashboardRouter = (0, dashboard_routes_1.createDashboardRoutes)(dashboardController, authMiddleware);
    const app = (0, app_1.createApp)(authRouter, userRouter, creditRouter, paymentRouter, dashboardRouter);
    process.on('SIGINT', async () => {
        console.log('Shutting down gracefully...');
        process.exit(0);
    });
    return app;
}
