import { IUserRepository } from '../lib/interfaces';
import { UserFactory } from '../factories/UserFactory';
import { User, UserRole, UserStatus } from '../models/User';
import UserModel from '../models/UserModel';

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly _sequelize?: any) {}

  async findAll(): Promise<User[]> {
    const rows = await UserModel.findAll();
    return rows.map((r: any) => UserFactory.reconstitute({
      id: r.id,
      email: r.email,
      password: r.password,
      fullName: r.fullName,
      role: r.role as UserRole,
      status: r.status as UserStatus,
      cedula: r.cedula || undefined,
      telefono: r.telefono || undefined,
      direccion: r.direccion || undefined,
      loginAttempts: r.loginAttempts ?? 0,
      lastLoginAttempt: r.lastLoginAttempt || undefined,
      blockedUntil: r.blockedUntil || undefined,
      lastLogin: r.lastLogin || undefined,
      emailVerified: r.emailVerified ?? false,
      emailVerifiedAt: r.emailVerifiedAt || undefined,
      verificationToken: r.verificationToken || undefined,
      resetToken: r.resetToken || undefined,
      resetTokenExpiry: r.resetTokenExpiry || undefined,
      createdAt: r.createdAt,
      createdBy: r.createdBy || undefined,
      updatedAt: r.updatedAt,
    }));
  }

  async save(user: User): Promise<void> {
    await UserModel.create({
      id: user.id,
      email: user.email.value,
      password: user.password.value,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      cedula: user.cedula,
      telefono: user.telefono,
      direccion: user.direccion,
      loginAttempts: user.loginAttempts,
      lastLoginAttempt: user.lastLoginAttempt,
      blockedUntil: user.blockedUntil,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      verificationToken: user.verificationToken,
      resetToken: user.resetToken,
      resetTokenExpiry: user.resetTokenExpiry,
      createdBy: user.createdBy,
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await UserModel.findByPk(id);
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await UserModel.findOne({ where: { email } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.count({ where: { email } });
    return count > 0;
  }

  async existsByCedula(cedula: string): Promise<boolean> {
    const count = await UserModel.count({ where: { cedula } });
    return count > 0;
  }

  async update(user: User): Promise<void> {
    await UserModel.update(
      {
        email: user.email.value,
        password: user.password.value,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        cedula: user.cedula,
        telefono: user.telefono,
        direccion: user.direccion,
        loginAttempts: user.loginAttempts,
        lastLoginAttempt: user.lastLoginAttempt,
        blockedUntil: user.blockedUntil,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        verificationToken: user.verificationToken,
        resetToken: user.resetToken,
        resetTokenExpiry: user.resetTokenExpiry,
        createdBy: user.createdBy,
      },
      { where: { id: user.id } }
    );
  }

  async delete(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }

  private toEntity(row: any): User {
    return UserFactory.reconstitute({
      id: row.id,
      email: row.email,
      password: row.password,
      fullName: row.fullName,
      role: row.role as UserRole,
      status: row.status as UserStatus,
      cedula: row.cedula || undefined,
      telefono: row.telefono || undefined,
      direccion: row.direccion || undefined,
      loginAttempts: row.loginAttempts ?? 0,
      lastLoginAttempt: row.lastLoginAttempt || undefined,
      blockedUntil: row.blockedUntil || undefined,
      lastLogin: row.lastLogin || undefined,
      emailVerified: row.emailVerified ?? false,
      emailVerifiedAt: row.emailVerifiedAt || undefined,
      verificationToken: row.verificationToken || undefined,
      resetToken: row.resetToken || undefined,
      resetTokenExpiry: row.resetTokenExpiry || undefined,
      createdAt: row.createdAt,
      createdBy: row.createdBy || undefined,
      updatedAt: row.updatedAt,
    });
  }
}
