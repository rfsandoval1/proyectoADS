"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAuditLogRepository = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class PostgresAuditLogRepository {
    async save(log) {
        try {
            await AuditLog_1.default.create({
                id: log.id || crypto.randomUUID(),
                userId: log.userId || null,
                action: log.action,
                module: log.module || 'GENERAL',
                details: log.details || {},
                ipAddress: log.ipAddress || '0.0.0.0',
                userAgent: log.userAgent || 'Unknown',
                status: log.status,
                createdAt: log.createdAt || new Date(),
            });
        }
        catch (error) {
            console.warn(`⚠️ Error guardando audit log (${log.action}):`, error.message);
        }
    }
    async findByUserId(userId, limit = 50) {
        return this.mapLogs(await AuditLog_1.default.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
        }));
    }
    async findByAction(action, limit = 50) {
        return this.mapLogs(await AuditLog_1.default.findAll({
            where: { action },
            order: [['createdAt', 'DESC']],
            limit,
        }));
    }
    async findRecent(limit = 50) {
        return this.mapLogs(await AuditLog_1.default.findAll({
            order: [['createdAt', 'DESC']],
            limit,
        }));
    }
    mapLogs(logs) {
        return logs.map(log => ({
            id: log.id,
            userId: log.userId,
            action: log.action,
            module: log.module,
            details: log.details,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            status: log.status,
            createdAt: log.createdAt,
        }));
    }
}
exports.PostgresAuditLogRepository = PostgresAuditLogRepository;
