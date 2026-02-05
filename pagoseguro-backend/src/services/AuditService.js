"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
class AuditService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(entry) {
        await this.auditLogRepository.save({
            userId: entry.userId,
            action: entry.action,
            module: 'AUTH',
            details: entry.details,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            status: entry.status,
        });
    }
    async logLoginSuccess(email, userId, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'user.login',
            status: 'SUCCESS',
            details: { email },
            ipAddress,
            userAgent,
        });
    }
    async logLoginFailure(email, reason, userId, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'user.login',
            status: 'FAILURE',
            details: { email },
            error: reason,
            ipAddress: ipAddress || '127.0.0.1',
            userAgent: userAgent || 'unknown',
        });
    }
    async logRegistration(email, userId, status, ipAddress, userAgent, error) {
        await this.log({
            userId,
            action: 'user.register',
            status,
            details: { email },
            error,
            ipAddress,
            userAgent,
        });
    }
    async logLogout(userId, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'user.logout',
            status: 'SUCCESS',
            details: { userId },
            ipAddress,
            userAgent,
        });
    }
    async logPasswordRecovery(email, status, ipAddress, userAgent, userId, error) {
        await this.log({
            userId,
            action: 'user.password_recovery',
            status,
            details: { email },
            error,
            ipAddress,
            userAgent,
        });
    }
}
exports.AuditService = AuditService;
