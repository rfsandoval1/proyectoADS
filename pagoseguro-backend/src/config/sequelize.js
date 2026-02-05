"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pagoseguro_db', {
    dialect: 'postgres',
    logging: false,
});
exports.default = sequelize;
