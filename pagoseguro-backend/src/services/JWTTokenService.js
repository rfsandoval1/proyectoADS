"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTTokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
class JWTTokenService {
    async generateTokens(payload) {
        const secret = env_1.config.jwt.secret;
        if (!secret) {
            throw new Error('JWT secret no está configurado');
        }
        const secretBuffer = Buffer.from(secret);
        const accessToken = jsonwebtoken_1.default.sign(payload, secretBuffer, {
            expiresIn: env_1.config.jwt.accessTokenExpiration,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, secretBuffer, {
            expiresIn: env_1.config.jwt.refreshTokenExpiration,
        });
        return { accessToken, refreshToken };
    }
    verifyToken(token) {
        const secret = env_1.config.jwt.secret;
        if (!secret) {
            throw new Error('JWT secret no está configurado');
        }
        const secretBuffer = Buffer.from(secret);
        return jsonwebtoken_1.default.verify(token, secretBuffer);
    }
    async verifyAccessToken(token) {
        return this.verifyToken(token);
    }
    async verifyRefreshToken(token) {
        return this.verifyToken(token);
    }
    generateResetCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
exports.JWTTokenService = JWTTokenService;
