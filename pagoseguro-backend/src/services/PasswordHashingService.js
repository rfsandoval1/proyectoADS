"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHashingService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordHashingService {
    async hash(plainPassword) {
        const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS || '12');
        return bcrypt_1.default.hash(plainPassword, rounds);
    }
    async compare(plainPassword, hashedPassword) {
        return bcrypt_1.default.compare(plainPassword, hashedPassword);
    }
}
exports.PasswordHashingService = PasswordHashingService;
