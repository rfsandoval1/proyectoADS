"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CLIENTE"] = "CLIENTE";
    UserRole["ASISTENTE"] = "ASISTENTE";
    UserRole["GERENTE"] = "GERENTE";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
    UserStatus["BLOCKED"] = "BLOCKED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
class User {
    constructor(id, email, password, fullName, role, status, cedula, telefono, direccion, loginAttempts = 0, lastLoginAttempt, blockedUntil, lastLogin, emailVerified = false, emailVerifiedAt, verificationToken, resetToken, resetTokenExpiry, createdAt = new Date(), createdBy, updatedAt = new Date()) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.status = status;
        this.cedula = cedula;
        this.telefono = telefono;
        this.direccion = direccion;
        this.loginAttempts = loginAttempts;
        this.lastLoginAttempt = lastLoginAttempt;
        this.blockedUntil = blockedUntil;
        this.lastLogin = lastLogin;
        this.emailVerified = emailVerified;
        this.emailVerifiedAt = emailVerifiedAt;
        this.verificationToken = verificationToken;
        this.resetToken = resetToken;
        this.resetTokenExpiry = resetTokenExpiry;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.updatedAt = updatedAt;
    }
}
exports.User = User;
exports.default = User;
