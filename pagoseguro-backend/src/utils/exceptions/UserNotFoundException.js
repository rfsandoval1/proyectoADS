"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundException = void 0;
const DomainException_1 = require("./DomainException");
class UserNotFoundException extends DomainException_1.DomainException {
    constructor() {
        super('Usuario no encontrado');
        this.name = 'UserNotFoundException';
    }
}
exports.UserNotFoundException = UserNotFoundException;
