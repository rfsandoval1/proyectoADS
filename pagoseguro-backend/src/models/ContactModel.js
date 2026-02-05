"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class ContactModel extends sequelize_1.Model {
}
ContactModel.init({
    id: {
        type: sequelize_1.DataTypes.TEXT,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        field: 'user_id',
    },
    status: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'pending',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        field: 'created_at',
    },
}, {
    sequelize: sequelize_2.default,
    modelName: 'Contact',
    tableName: 'contacts',
    timestamps: false,
});
exports.default = ContactModel;
