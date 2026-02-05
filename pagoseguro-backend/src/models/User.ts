import { Email } from './Email';
import { Password } from './Password';

export enum UserRole {
  CLIENTE = 'CLIENTE',
  ASISTENTE = 'ASISTENTE',
  GERENTE = 'GERENTE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  BLOCKED = 'BLOCKED',
}

export class User {
  constructor(
    public readonly id: string,
    public email: Email,
    public password: Password,
    public fullName: string,
    public role: UserRole,
    public status: UserStatus,
    public cedula?: string,
    public telefono?: string,
    public direccion?: string,
    public loginAttempts: number = 0,
    public lastLoginAttempt?: Date,
    public blockedUntil?: Date,
    public lastLogin?: Date,
    public emailVerified: boolean = false,
    public emailVerifiedAt?: Date,
    public verificationToken?: string,
    public resetToken?: string,
    public resetTokenExpiry?: Date,
    public createdAt: Date = new Date(),
    public createdBy?: string,
    public updatedAt: Date = new Date()
  ) {}
}

export default User;
