import { IAuditLogRepository, AuditStatus } from '../lib/interfaces';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  status: AuditStatus;
  details: Record<string, unknown>;
  error?: string;
  ipAddress: string;
  userAgent: string;
}

export class AuditService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async log(entry: AuditLogEntry): Promise<void> {
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

  async logLoginSuccess(
    email: string,
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'user.login',
      status: 'SUCCESS',
      details: { email },
      ipAddress,
      userAgent,
    });
  }

  async logLoginFailure(
    email: string,
    reason: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
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

  async logRegistration(
    email: string,
    userId: string,
    status: AuditStatus,
    ipAddress: string,
    userAgent: string,
    error?: string
  ): Promise<void> {
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

  async logLogout(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'user.logout',
      status: 'SUCCESS',
      details: { userId },
      ipAddress,
      userAgent,
    });
  }


  async logPasswordRecovery(
    email: string,
    status: AuditStatus,
    ipAddress: string,
    userAgent: string,
    userId?: string,
    error?: string
  ): Promise<void> {
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
