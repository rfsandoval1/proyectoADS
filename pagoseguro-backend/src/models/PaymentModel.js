"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class PaymentModel extends sequelize_1.Model {
}
PaymentModel.init({
    id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
    },
    creditId: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
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
        defaultValue: 'PENDING',
    },
    month: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'January',
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    paidDate: {
        type: sequelize_1.DataTypes.DATE,
        field: 'paid_date',
    },
}, {
    sequelize: sequelize_2.default,
    modelName: 'Payment',
    tableName: 'Payment',
    timestamps: true,
});
exports.default = PaymentModel;
