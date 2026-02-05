"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidationService = void 0;
const DomainException_1 = require("../utils/exceptions/DomainException");
class PasswordValidationService {
    static validate(password) {
        if (password.length < 8) {
            throw new DomainException_1.DomainException('La contraseña debe tener al menos 8 caracteres');
        }
        if (!this.hasUpperCase(password)) {
            throw new DomainException_1.DomainException('La contraseña debe contener al menos una mayúscula');
        }
        if (!this.hasLowerCase(password)) {
            throw new DomainException_1.DomainException('La contraseña debe contener al menos una minúscula');
        }
        if (!this.hasNumber(password)) {
            throw new DomainException_1.DomainException('La contraseña debe contener al menos un número');
        }
        if (!this.hasSpecialChar(password)) {
            throw new DomainException_1.DomainException('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
        }
    }
    static hasUpperCase(password) {
        return /[A-Z]/.test(password);
    }
    static hasLowerCase(password) {
        return /[a-z]/.test(password);
    }
    static hasNumber(password) {
        return /\d/.test(password);
    }
    static hasSpecialChar(password) {
        return /[@$!%*?&]/.test(password);
    }
}
exports.PasswordValidationService = PasswordValidationService;
