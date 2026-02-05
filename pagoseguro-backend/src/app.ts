import express, { Express, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import { config } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

export function createApp(
  authRouter: Router,
  userRouter: Router,
  creditRouter: Router,
  paymentRouter: Router,
  dashboardRouter: Router,
  voucherRouter: Router
): Express {
  const app = express();

  // Middleware de seguridad
  app.use(helmet({
    contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
  }));

  // CORS
  app.use(cors({
    origin: [
      'http://localhost:4000',
      'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logger de requests
  app.use(requestLogger);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'PagoSeguroAGROTAC API',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });


  // Rutas API
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/credits', creditRouter);
  app.use('/api/v1/payments', paymentRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/vouchers', voucherRouter);

  // Ruta 404
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
      path: req.originalUrl,
    });
  });

  // Manejo de errores (debe ir al final)
  app.use(errorHandler);

  return app;
}
