"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailValidationService = void 0;
const exceptions_1 = require("../utils/exceptions");
class EmailValidationService {
    static validate(email) {
        const normalized = email.toLowerCase().trim();
        if (!this.isValidFormat(normalized)) {
            throw new exceptions_1.DomainException('Email inválido: formato no válido');
        }
        if (normalized.length > 100) {
            throw new exceptions_1.DomainException('Email inválido: demasiado largo');
        }
    }
    static isValidFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static normalize(email) {
        return email.toLowerCase().trim();
    }
}
exports.EmailValidationService = EmailValidationService;
