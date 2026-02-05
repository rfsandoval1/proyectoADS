"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class AuditLog extends sequelize_1.Model {
}
AuditLog.init({
    id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'user_id',
    },
    action: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    module: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    details: sequelize_1.DataTypes.JSON,
    ipAddress: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'ip_address',
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        field: 'user_agent',
    },
    status: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
    },
}, {
    sequelize: sequelize_2.default,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: false,
});
exports.default = AuditLog;
