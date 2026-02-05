"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = void 0;
const User_1 = require("../models/User");
const Email_1 = require("../models/Email");
const Password_1 = require("../models/Password");
const EmailValidationService_1 = require("../services/EmailValidationService");
const PasswordValidationService_1 = require("../services/PasswordValidationService");
const PasswordHashingService_1 = require("../services/PasswordHashingService");
class UserFactory {
    static async createNew(props) {
        EmailValidationService_1.EmailValidationService.validate(props.email);
        const normalizedEmail = EmailValidationService_1.EmailValidationService.normalize(props.email);
        PasswordValidationService_1.PasswordValidationService.validate(props.password);
        const hasher = new PasswordHashingService_1.PasswordHashingService();
        const hashedPassword = await hasher.hash(props.password);
        return new User_1.User(crypto.randomUUID(), new Email_1.Email(normalizedEmail), new Password_1.Password(hashedPassword, true), props.fullName, props.role, User_1.UserStatus.PENDING_VERIFICATION, props.cedula, props.telefono, props.direccion, 0, undefined, undefined, undefined, false, undefined, undefined, undefined, undefined, new Date(), props.createdBy);
    }
    static reconstitute(props) {
        return new User_1.User(props.id, new Email_1.Email(props.email), new Password_1.Password(props.password, true), props.fullName, props.role, props.status, props.cedula, props.telefono, props.direccion, props.loginAttempts, props.lastLoginAttempt, props.blockedUntil, props.lastLogin, props.emailVerified, props.emailVerifiedAt, props.verificationToken, props.resetToken, props.resetTokenExpiry, props.createdAt, props.createdBy, props.updatedAt);
    }
}
exports.UserFactory = UserFactory;
