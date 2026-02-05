import { IAuditLogRepository, AuditLogData } from '../lib/interfaces';
import AuditLog from '../models/AuditLog';

export class PostgresAuditLogRepository implements IAuditLogRepository {
  async save(log: AuditLogData): Promise<void> {
    try {
      await AuditLog.create({
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
    } catch (error: any) {
      console.warn(`⚠️ Error guardando audit log (${log.action}):`, error.message);
    }
  }

  async findByUserId(userId: string, limit: number = 50): Promise<AuditLogData[]> {
    return this.mapLogs(
      await AuditLog.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
      })
    );
  }

  async findByAction(action: string, limit: number = 50): Promise<AuditLogData[]> {
    return this.mapLogs(
      await AuditLog.findAll({
        where: { action },
        order: [['createdAt', 'DESC']],
        limit,
      })
    );
  }

  async findRecent(limit: number = 50): Promise<AuditLogData[]> {
    return this.mapLogs(
      await AuditLog.findAll({
        order: [['createdAt', 'DESC']],
        limit,
      })
    );
  }

  private mapLogs(logs: any[]): AuditLogData[] {
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