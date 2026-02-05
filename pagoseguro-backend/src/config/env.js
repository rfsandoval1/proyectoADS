"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number.parseInt(process.env.PORT || '4000'),
    host: process.env.HOST || 'localhost',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
    database: {
        url: process.env.DATABASE_URL || '',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
        accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
        refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
    },
    bcrypt: {
        rounds: Number.parseInt(process.env.BCRYPT_ROUNDS || '12'),
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:4000 ',
        credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY || '',
    },
    email: {
        from: process.env.EMAIL_FROM || '',
        fromName: process.env.EMAIL_FROM_NAME || 'El Granito AGROTAC',
    },
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:4000',
    },
    databaseUrl: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/database_name',
};
