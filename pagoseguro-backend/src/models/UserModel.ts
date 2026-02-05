import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class UserModel extends Model {}

UserModel.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'full_name',
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cedula: DataTypes.TEXT,
    telefono: DataTypes.TEXT,
    direccion: DataTypes.TEXT,
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'login_attempts',
    },
    lastLoginAttempt: {
      type: DataTypes.DATE,
      field: 'last_login_attempt',
    },
    blockedUntil: {
      type: DataTypes.DATE,
      field: 'blocked_until',
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login',
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'email_verified',
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      field: 'email_verified_at',
    },
    verificationToken: {
      type: DataTypes.TEXT,
      field: 'verification_token',
    },
    resetToken: {
      type: DataTypes.TEXT,
      field: 'reset_token',
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      field: 'reset_token_expiry',
    },
    createdBy: {
      type: DataTypes.TEXT,
      field: 'created_by',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default UserModel;
