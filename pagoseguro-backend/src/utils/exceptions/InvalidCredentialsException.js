"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsException = void 0;
const DomainException_1 = require("./DomainException");
class InvalidCredentialsException extends DomainException_1.DomainException {
    constructor() {
        super('Credenciales incorrectas');
        this.name = 'InvalidCredentialsException';
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
