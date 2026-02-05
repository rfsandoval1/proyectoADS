"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresRefreshTokenRepository = void 0;
const RefreshToken_1 = __importDefault(require("../models/RefreshToken"));
const sequelize_1 = require("sequelize");
class PostgresRefreshTokenRepository {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
    }
    async save(token) {
        await RefreshToken_1.default.create({
            id: token.id,
            token: token.token,
            userId: token.userId,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
        });
    }
    async findByToken(token) {
        const row = await RefreshToken_1.default.findOne({ where: { token } });
        if (!row)
            return null;
        return {
            id: row.id,
            token: row.token,
            userId: row.userId,
            expiresAt: row.expiresAt,
            createdAt: row.createdAt,
        };
    }
    async deleteByUserId(userId) {
        await RefreshToken_1.default.destroy({ where: { userId } });
    }
    async deleteByToken(token) {
        await RefreshToken_1.default.destroy({ where: { token } });
    }
    async deleteExpired() {
        await RefreshToken_1.default.destroy({
            where: {
                expiresAt: { [sequelize_1.Op.lt]: new Date() },
            },
        });
    }
}
exports.PostgresRefreshTokenRepository = PostgresRefreshTokenRepository;
