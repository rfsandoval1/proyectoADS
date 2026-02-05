"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHashingService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../config/env");
class BcryptHashingService {
    async hash(value) {
        const rounds = env_1.config.bcrypt.rounds;
        return bcrypt_1.default.hash(value, rounds);
    }
    async compare(value, hashedValue) {
        return bcrypt_1.default.compare(value, hashedValue);
    }
}
exports.BcryptHashingService = BcryptHashingService;
