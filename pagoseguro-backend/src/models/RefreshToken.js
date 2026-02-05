"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class RefreshToken extends sequelize_1.Model {
}
RefreshToken.init({
    id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
    },
    token: {
        type: sequelize_1.DataTypes.TEXT,
        unique: true,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        field: 'user_id',
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
    },
}, {
    sequelize: sequelize_2.default,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: false,
});
exports.default = RefreshToken;
