"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDomainService = void 0;
const exceptions_1 = require("../utils/exceptions");
const User_1 = require("../models/User");
const UserStateService_1 = require("./UserStateService");
class UserDomainService {
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    async listUsers() {
        // Devuelve todos los usuarios
        // (en producción, agregar paginación y filtros)
        // Suponemos que el repositorio tiene un método findAll()
        if (typeof this.userRepository.findAll === 'function') {
            return this.userRepository.findAll();
        }
        throw new Error('Método findAll no implementado en el repositorio');
    }
    async getUserById(id) {
        return this.userRepository.findById(id);
    }
    async updateUser(id, data) {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser)
            throw new Error('Usuario no encontrado');
        // Create new User object - remove readonly parameters from constructor
        const updatedUser = new User_1.User(existingUser.id, existingUser.email, existingUser.password, data.fullName || existingUser.fullName, existingUser.role, data.status || existingUser.status, data.cedula || existingUser.cedula, data.telefono || existingUser.telefono, data.direccion || existingUser.direccion);
        // Set readonly properties via type assertion
        updatedUser.createdAt = existingUser.createdAt;
        updatedUser.createdBy = existingUser.createdBy;
        // Copy mutable properties
        updatedUser.loginAttempts = existingUser.loginAttempts;
        updatedUser.lastLoginAttempt = existingUser.lastLoginAttempt;
        updatedUser.blockedUntil = existingUser.blockedUntil;
        updatedUser.lastLogin = existingUser.lastLogin;
        updatedUser.emailVerified = existingUser.emailVerified;
        updatedUser.emailVerifiedAt = existingUser.emailVerifiedAt;
        updatedUser.verificationToken = existingUser.verificationToken;
        updatedUser.resetToken = existingUser.resetToken;
        updatedUser.resetTokenExpiry = existingUser.resetTokenExpiry;
        updatedUser.updatedAt = new Date();
        await this.userRepository.update(updatedUser);
        return updatedUser;
    }
    async createUser(user) {
        await this.userRepository.save(user);
        return user;
    }
    async deleteUser(id) {
        await this.userRepository.delete(id);
    }
    async validateNewUser(email, cedula) {
        if (await this.userRepository.existsByEmail(email)) {
            throw new exceptions_1.UserAlreadyExistsException(email);
        }
        if (cedula && await this.userRepository.existsByCedula(cedula)) {
            throw new exceptions_1.UserAlreadyExistsException(cedula, 'cedula');
        }
    }
    async verifyUserCanLogin(user) {
        if (UserStateService_1.UserStateService.isBlocked(user)) {
            throw new exceptions_1.DomainException(`Cuenta bloqueada hasta ${user.blockedUntil?.toLocaleString()}`);
        }
    }
    async handleFailedLoginAttempt(user) {
        UserStateService_1.UserStateService.incrementLoginAttempts(user);
        if (UserStateService_1.UserStateService.isBlocked(user) && user.blockedUntil) {
            try {
                await this.emailService.sendAccountBlockedEmail(user.email.value, user.fullName, user.blockedUntil);
            }
            catch (error) {
                console.error('Error enviando email de bloqueo:', error);
            }
        }
        await this.userRepository.update(user);
    }
    async handleSuccessfulLogin(user) {
        UserStateService_1.UserStateService.updateLastLogin(user);
        await this.userRepository.update(user);
    }
    async sendVerificationEmail(email, token, fullName) {
        try {
            await this.emailService.sendVerificationEmail(email, token, fullName);
        }
        catch (error) {
            console.error('Error enviando email de verificación:', error);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, resetCode, fullName) {
        try {
            await this.emailService.sendPasswordResetEmail(email, resetCode, fullName);
        }
        catch (error) {
            console.error('Error enviando email de recuperación:', error);
            throw error;
        }
    }
}
exports.UserDomainService = UserDomainService;
