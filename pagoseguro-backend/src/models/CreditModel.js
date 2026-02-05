"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class CreditModel extends sequelize_1.Model {
}
CreditModel.init({
    id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'ACTIVE',
    },
    range: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: '0-1000',
    },
    term: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 12,
    },
    interestRate: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 12,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
    },
}, {
    sequelize: sequelize_2.default,
    modelName: 'Credit',
    tableName: 'Credit',
    timestamps: true,
});
exports.default = CreditModel;
