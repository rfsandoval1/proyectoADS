import { User } from '../../models/User';

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'WARNING';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByCedula(cedula: string): Promise<boolean>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}

export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IRefreshTokenRepository {
  save(token: RefreshTokenData): Promise<void>;
  findByToken(token: string): Promise<RefreshTokenData | null>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export interface IAuditLogRepository {
  save(log: AuditLogData): Promise<void>;
  findByUserId(userId: string, limit?: number): Promise<AuditLogData[]>;
  findByAction(action: string, limit?: number): Promise<AuditLogData[]>;
  findRecent(limit?: number): Promise<AuditLogData[]>;
}

export interface AuditLogData {
  id?: string;
  userId?: string;
  action: string;
  module?: string;
  status: AuditStatus;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt?: Date;
}
