"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
// Single source of truth for the Sequelize instance
var sequelize_1 = require("./sequelize");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(sequelize_1).default; } });
