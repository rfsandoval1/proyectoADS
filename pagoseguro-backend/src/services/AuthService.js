"use strict";
/**
 * AuthService
 * Orquesta los casos de uso de autenticación
 * Delega responsabilidades a servicios especializados
 * Aplicando Dependency Inversion Principle (DIP)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserFactory_1 = require("../factories/UserFactory");
const User_1 = require("../models/User");
const exceptions_1 = require("../utils/exceptions");
const PasswordHashingService_1 = require("./PasswordHashingService");
class AuthService {
    constructor(userRepository, refreshTokenRepository, tokenService, userDomainService, auditService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenService = tokenService;
        this.userDomainService = userDomainService;
        this.auditService = auditService;
    }
    async login(dto) {
        try {
            const user = await this.userRepository.findByEmail(dto.email);
            if (!user) {
                await this.auditService.logLoginFailure(dto.email, 'Usuario no encontrado', undefined, dto.ipAddress, dto.userAgent);
                throw new exceptions_1.UserNotFoundException();
            }
            await this.userDomainService.verifyUserCanLogin(user);
            const passwordService = new PasswordHashingService_1.PasswordHashingService();
            const isPasswordValid = await passwordService.compare(dto.password, user.password.value);
            if (!isPasswordValid) {
                await this.userDomainService.handleFailedLoginAttempt(user);
                await this.auditService.logLoginFailure(dto.email, 'Contraseña incorrecta', user.id, dto.ipAddress, dto.userAgent);
                throw new exceptions_1.InvalidCredentialsException();
            }
            await this.userDomainService.handleSuccessfulLogin(user);
            const tokens = await this.tokenService.generateTokens({
                userId: user.id,
                email: user.email.value,
                role: user.role,
            });
            await this.refreshTokenRepository.save({
                id: crypto.randomUUID(),
                token: tokens.refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
            });
            await this.auditService.logLoginSuccess(dto.email, user.id, dto.ipAddress, dto.userAgent);
            return {
                success: true,
                accessToken: tokens.accessToken,
                user: {
                    id: user.id,
                    email: user.email.value,
                    fullName: user.fullName,
                    role: user.role,
                    cedula: user.cedula,
                },
            };
        }
        catch (error) {
            if (error instanceof exceptions_1.InvalidCredentialsException ||
                error instanceof exceptions_1.UserNotFoundException ||
                error instanceof exceptions_1.DomainException) {
                throw error;
            }
            throw new exceptions_1.DomainException('Error en el proceso de autenticación');
        }
    }
    async register(dto) {
        try {
            await this.userDomainService.validateNewUser(dto.email, dto.cedula);
            const user = await UserFactory_1.UserFactory.createNew({
                email: dto.email,
                password: dto.password,
                fullName: dto.fullName,
                role: User_1.UserRole.CLIENTE,
                cedula: dto.cedula,
                telefono: dto.telefono,
                direccion: dto.direccion,
            });
            await this.userRepository.save(user);
            const verificationToken = user.verificationToken || crypto.randomUUID();
            const { UserStateService } = await Promise.resolve().then(() => __importStar(require('./UserStateService')));
            UserStateService.setVerificationToken(user, verificationToken);
            try {
                await this.userDomainService.sendVerificationEmail(dto.email, verificationToken, dto.fullName);
            }
            catch (error) {
                console.error('Error enviando email de verificación:', error);
            }
            await this.auditService.logRegistration(dto.email, user.id, 'SUCCESS', dto.ipAddress, dto.userAgent);
            return {
                success: true,
                userId: user.id,
                message: 'Cuenta creada exitosamente. Revise su correo para verificar su cuenta.',
            };
        }
        catch (error) {
            if (error instanceof exceptions_1.UserAlreadyExistsException) {
                await this.auditService.logRegistration(dto.email, '', 'FAILURE', dto.ipAddress, dto.userAgent, 'Usuario ya existe');
                throw error;
            }
            throw new exceptions_1.DomainException('Error en el proceso de registro');
        }
    }
    async logout(dto) {
        try {
            if (dto.refreshToken) {
                try {
                    await this.refreshTokenRepository.deleteByToken(dto.refreshToken);
                }
                catch (error) {
                    console.error('Error eliminando refresh token:', error);
                }
            }
            await this.auditService.logLogout(dto.userId, dto.ipAddress, dto.userAgent);
            return {
                success: true,
                message: 'Sesión cerrada exitosamente',
            };
        }
        catch (error) {
            throw new exceptions_1.DomainException('Error en el proceso de logout');
        }
    }
    async recoverPassword(dto) {
        const genericMessage = 'Si existe una cuenta asociada, recibirá un correo con instrucciones';
        try {
            const user = await this.userRepository.findByEmail(dto.email);
            if (!user) {
                await this.auditService.logPasswordRecovery(dto.email, 'FAILURE', dto.ipAddress, dto.userAgent, undefined, 'Usuario no encontrado');
                return {
                    success: true,
                    message: genericMessage,
                };
            }
            const resetCode = this.tokenService.generateResetCode();
            const resetToken = crypto.randomUUID();
            const { UserStateService } = await Promise.resolve().then(() => __importStar(require('./UserStateService')));
            UserStateService.setResetToken(user, resetToken, 60);
            await this.userRepository.update(user);
            try {
                await this.userDomainService.sendPasswordResetEmail(dto.email, resetCode, user.fullName);
            }
            catch (error) {
                console.error('Error enviando email de recuperación:', error);
                await this.auditService.logPasswordRecovery(dto.email, 'FAILURE', dto.ipAddress, dto.userAgent, user.id, 'Error enviando email');
                return {
                    success: true,
                    message: genericMessage,
                };
            }
            await this.auditService.logPasswordRecovery(dto.email, 'SUCCESS', dto.ipAddress, dto.userAgent, user.id);
            return {
                success: true,
                message: genericMessage,
            };
        }
        catch (error) {
            return {
                success: true,
                message: genericMessage,
            };
        }
    }
}
exports.AuthService = AuthService;
