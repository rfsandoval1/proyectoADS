"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class UserModel extends sequelize_1.Model {
}
UserModel.init({
    id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    fullName: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        field: 'full_name',
    },
    role: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    cedula: sequelize_1.DataTypes.TEXT,
    telefono: sequelize_1.DataTypes.TEXT,
    direccion: sequelize_1.DataTypes.TEXT,
    loginAttempts: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        field: 'login_attempts',
    },
    lastLoginAttempt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'last_login_attempt',
    },
    blockedUntil: {
        type: sequelize_1.DataTypes.DATE,
        field: 'blocked_until',
    },
    lastLogin: {
        type: sequelize_1.DataTypes.DATE,
        field: 'last_login',
    },
    emailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'email_verified',
    },
    emailVerifiedAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'email_verified_at',
    },
    verificationToken: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'verification_token',
    },
    resetToken: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'reset_token',
    },
    resetTokenExpiry: {
        type: sequelize_1.DataTypes.DATE,
        field: 'reset_token_expiry',
    },
    createdBy: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'created_by',
    },
}, {
    sequelize: sequelize_2.default,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
});
exports.default = UserModel;
