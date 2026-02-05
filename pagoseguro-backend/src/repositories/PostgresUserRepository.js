"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserRepository = void 0;
const UserFactory_1 = require("../factories/UserFactory");
const UserModel_1 = __importDefault(require("../models/UserModel"));
class PostgresUserRepository {
    constructor(_sequelize) {
        this._sequelize = _sequelize;
    }
    async findAll() {
        const rows = await UserModel_1.default.findAll();
        return rows.map((r) => UserFactory_1.UserFactory.reconstitute({
            id: r.id,
            email: r.email,
            password: r.password,
            fullName: r.fullName,
            role: r.role,
            status: r.status,
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
    async save(user) {
        await UserModel_1.default.create({
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
    async findById(id) {
        const row = await UserModel_1.default.findByPk(id);
        if (!row)
            return null;
        return this.toEntity(row);
    }
    async findByEmail(email) {
        const row = await UserModel_1.default.findOne({ where: { email } });
        if (!row)
            return null;
        return this.toEntity(row);
    }
    async existsByEmail(email) {
        const count = await UserModel_1.default.count({ where: { email } });
        return count > 0;
    }
    async existsByCedula(cedula) {
        const count = await UserModel_1.default.count({ where: { cedula } });
        return count > 0;
    }
    async update(user) {
        await UserModel_1.default.update({
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
        }, { where: { id: user.id } });
    }
    async delete(id) {
        await UserModel_1.default.destroy({ where: { id } });
    }
    toEntity(row) {
        return UserFactory_1.UserFactory.reconstitute({
            id: row.id,
            email: row.email,
            password: row.password,
            fullName: row.fullName,
            role: row.role,
            status: row.status,
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
exports.PostgresUserRepository = PostgresUserRepository;
