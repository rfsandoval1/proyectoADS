import { DashboardService } from './services/DashboardService';
import { DashboardController } from './controllers/DashboardController';
import { createDashboardRoutes } from './routes/dashboard.routes';
import dotenv from 'dotenv';
dotenv.config();
import { createApp } from './app';

import { PostgresUserRepository } from './repositories/PostgresUserRepository';
import { PostgresCreditRepository } from './repositories/PostgresCreditRepository';
import { PostgresPaymentRepository } from './repositories/PostgresPaymentRepository';
import { PostgresRefreshTokenRepository } from './repositories/PostgresRefreshTokenRepository';
import { PostgresAuditLogRepository } from './repositories/PostgresAuditLogRepository';
import { PostgresPaymentVoucherRepository } from './repositories/PostgresPaymentVoucherRepository';

import { JWTTokenService } from './services/JWTTokenService';
import { SendGridEmailService } from './services/SendGridEmailService';

import { AuthService } from './services/AuthService';
import { UserDomainService } from './services/UserDomainService';
import { AuditService } from './services/AuditService';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { CreditController } from './controllers/CreditController';
import { PaymentController } from './controllers/PaymentController';
import { AuthMiddleware } from './middleware/auth.middleware';
import { createAuthRoutes } from './routes/auth.routes';
import { createUserRoutes } from './routes/user.routes';
import { createCreditRoutes } from './routes/credits.routes';
import { createPaymentRoutes } from './routes/payments.routes';
import { createVoucherRoutes } from './routes/vouchers.routes';
import { PaymentVoucherService } from './services/PaymentVoucherService';
import { PaymentVoucherController } from './controllers/PaymentVoucherController';
import sequelize from './config/sequelize';
import { config } from './config/env';

export async function initializeServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida con Sequelize');
  } catch (error: unknown) {
    console.error('Error al conectar a PostgreSQL:', error);
    throw error;
  }

  // Sync all models — alter: true adds new columns to existing tables
  await sequelize.sync({ alter: true });
  console.log('✅ Tablas sincronizadas');

  const userRepository = new PostgresUserRepository(sequelize);
  const creditRepository = new PostgresCreditRepository(sequelize);
  const paymentRepository = new PostgresPaymentRepository(sequelize);
  const refreshTokenRepository = new PostgresRefreshTokenRepository(sequelize);
  const auditLogRepository = new PostgresAuditLogRepository();
  const voucherRepository = new PostgresPaymentVoucherRepository();

  const tokenService = new JWTTokenService();
  const emailService = new SendGridEmailService();

  const auditService = new AuditService(auditLogRepository);
  const userDomainService = new UserDomainService(userRepository, emailService);

  const authService = new AuthService(
    userRepository,
    refreshTokenRepository,
    tokenService,
    userDomainService,
    auditService
  );

  const authController = new AuthController(authService);
  const userController = new UserController(userDomainService);
  const { CreditService } = await import('./services/CreditService');
  const { PaymentService } = await import('./services/PaymentService');
  const creditService = new CreditService(creditRepository);
  const paymentService = new PaymentService(paymentRepository);
  const creditController = new CreditController(creditService);
  const paymentController = new PaymentController(paymentService);
  const voucherService = new PaymentVoucherService(voucherRepository);
  const voucherController = new PaymentVoucherController(voucherService);
  const authMiddleware = new AuthMiddleware(tokenService);

  const authRouter = createAuthRoutes(authController, authMiddleware);
  const userRouter = createUserRoutes(userController, authMiddleware);
  const creditRouter = createCreditRoutes(creditController, authMiddleware);
  const paymentRouter = createPaymentRoutes(paymentController, authMiddleware);
  const voucherRouter = createVoucherRoutes(voucherController, authMiddleware);

  const dashboardService = new DashboardService(sequelize);
  const dashboardController = new DashboardController(dashboardService);
  const dashboardRouter = createDashboardRoutes(dashboardController, authMiddleware);
  const app = createApp(authRouter, userRouter, creditRouter, paymentRouter, dashboardRouter, voucherRouter);

  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
  });

  return app;
}
