"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStateService = void 0;
const User_1 = require("../models/User");
class UserStateService {
    static isBlocked(user) {
        if (user.status !== User_1.UserStatus.BLOCKED)
            return false;
        if (!user.blockedUntil)
            return false;
        if (new Date() > user.blockedUntil) {
            user.status = User_1.UserStatus.ACTIVE;
            user.blockedUntil = undefined;
            user.loginAttempts = 0;
            user.lastLoginAttempt = undefined;
            return false;
        }
        return true;
    }
    static incrementLoginAttempts(user) {
        user.loginAttempts++;
        user.lastLoginAttempt = new Date();
        if (user.loginAttempts >= 5) {
            this.blockAccount(user, 30);
        }
    }
    static resetLoginAttempts(user) {
        user.loginAttempts = 0;
        user.lastLoginAttempt = undefined;
    }
    static blockAccount(user, minutes) {
        user.status = User_1.UserStatus.BLOCKED;
        user.blockedUntil = new Date(Date.now() + minutes * 60 * 1000);
    }
    static updateLastLogin(user) {
        user.lastLogin = new Date();
        this.resetLoginAttempts(user);
    }
    static setVerificationToken(user, token) {
        user.verificationToken = token;
    }
    static verifyEmail(user) {
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        user.verificationToken = undefined;
        user.status = User_1.UserStatus.ACTIVE;
    }
    static setResetToken(user, token, expiryMinutes = 60) {
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
    }
    static isResetTokenValid(user) {
        if (!user.resetToken || !user.resetTokenExpiry)
            return false;
        return new Date() < user.resetTokenExpiry;
    }
    static clearResetToken(user) {
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
    }
    static markAsUpdated(user) {
        user.updatedAt = new Date();
    }
}
exports.UserStateService = UserStateService;
