import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../config/sequelize';

class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.TEXT,
      field: 'user_id',
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    module: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    details: DataTypes.JSON,
    ipAddress: {
      type: DataTypes.TEXT,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent',
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: false,
  }
);

export default AuditLog;
