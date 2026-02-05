"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAlreadyExistsException = void 0;
const DomainException_1 = require("./DomainException");
class UserAlreadyExistsException extends DomainException_1.DomainException {
    constructor(value, field = 'email') {
        const label = field === 'cedula' ? 'La cédula' : 'El email';
        super(`${label} ${value} ya está registrado`);
        this.name = 'UserAlreadyExistsException';
    }
}
exports.UserAlreadyExistsException = UserAlreadyExistsException;
