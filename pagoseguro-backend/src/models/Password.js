"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
class Password {
    constructor(value, isHashed = false) {
        this.value = value;
        this.isHashed = isHashed;
    }
}
exports.Password = Password;
