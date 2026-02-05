/**
 * AuthService
 * Orquesta los casos de uso de autenticación
 * Delega responsabilidades a servicios especializados
 * Aplicando Dependency Inversion Principle (DIP)
 */

import {
  IUserRepository,
  IRefreshTokenRepository,
  ITokenService
} from '../lib/interfaces';
import { UserFactory } from '../factories/UserFactory';
import { UserRole } from '../models/User';
import { 
  InvalidCredentialsException, 
  UserNotFoundException,
  UserAlreadyExistsException,
  DomainException 
} from '../utils/exceptions';

import { UserDomainService } from './UserDomainService';
import { AuditService } from './AuditService';
import { PasswordHashingService } from './PasswordHashingService';

import {
  LoginServiceDTO,
  RegisterServiceDTO,
  RecoverPasswordServiceDTO,
  LogoutServiceDTO,
  LoginResponseDTO,
  RegisterResponseDTO,
  RecoverPasswordResponseDTO,
  LogoutResponseDTO
} from '../dtos/auth.dto';

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly userDomainService: UserDomainService,
    private readonly auditService: AuditService
  ) {}


  async login(dto: LoginServiceDTO): Promise<LoginResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(dto.email);
      if (!user) {
        await this.auditService.logLoginFailure(
          dto.email,
          'Usuario no encontrado',
          undefined,
          dto.ipAddress,
          dto.userAgent
        );
        throw new UserNotFoundException();
      }

      await this.userDomainService.verifyUserCanLogin(user);

      const passwordService = new PasswordHashingService();
      const isPasswordValid = await passwordService.compare(dto.password, user.password.value);
      if (!isPasswordValid) {
        await this.userDomainService.handleFailedLoginAttempt(user);
        
        await this.auditService.logLoginFailure(
          dto.email,
          'Contraseña incorrecta',
          user.id,
          dto.ipAddress,
          dto.userAgent
        );
        throw new InvalidCredentialsException();
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

      await this.auditService.logLoginSuccess(
        dto.email,
        user.id,
        dto.ipAddress,
        dto.userAgent
      );

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
    } catch (error) {
      if (error instanceof InvalidCredentialsException ||
          error instanceof UserNotFoundException ||
          error instanceof DomainException) {
        throw error;
      }
      throw new DomainException('Error en el proceso de autenticación');
    }
  }

  async register(dto: RegisterServiceDTO): Promise<RegisterResponseDTO> {
    try {
      await this.userDomainService.validateNewUser(dto.email, dto.cedula);

      const user = await UserFactory.createNew({
        email: dto.email,
        password: dto.password,
        fullName: dto.fullName,
        role: UserRole.CLIENTE,
        cedula: dto.cedula,
        telefono: dto.telefono,
        direccion: dto.direccion,
      });

      await this.userRepository.save(user);

      const verificationToken = user.verificationToken || crypto.randomUUID();
      const { UserStateService } = await import('./UserStateService');
      UserStateService.setVerificationToken(user, verificationToken);
      
      try {
        await this.userDomainService.sendVerificationEmail(
          dto.email,
          verificationToken,
          dto.fullName
        );
      } catch (error) {
        console.error('Error enviando email de verificación:', error);
      }

      await this.auditService.logRegistration(
        dto.email,
        user.id,
        'SUCCESS',
        dto.ipAddress,
        dto.userAgent
      );

      return {
        success: true,
        userId: user.id,
        message: 'Cuenta creada exitosamente. Revise su correo para verificar su cuenta.',
      };
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        await this.auditService.logRegistration(
          dto.email,
          '',
          'FAILURE',
          dto.ipAddress,
          dto.userAgent,
          'Usuario ya existe'
        );
        throw error;
      }
      throw new DomainException('Error en el proceso de registro');
    }
  }

  async logout(dto: LogoutServiceDTO): Promise<LogoutResponseDTO> {
    try {
      if (dto.refreshToken) {
        try {
          await this.refreshTokenRepository.deleteByToken(dto.refreshToken);
        } catch (error) {
          console.error('Error eliminando refresh token:', error);
        }
      }

      await this.auditService.logLogout(
        dto.userId,
        dto.ipAddress,
        dto.userAgent
      );

      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
      };
    } catch (error) {
      throw new DomainException('Error en el proceso de logout');
    }
  }


  async recoverPassword(dto: RecoverPasswordServiceDTO): Promise<RecoverPasswordResponseDTO> {
    const genericMessage = 'Si existe una cuenta asociada, recibirá un correo con instrucciones';
    
    try {
      const user = await this.userRepository.findByEmail(dto.email);
      
      if (!user) {
        await this.auditService.logPasswordRecovery(
          dto.email,
          'FAILURE',
          dto.ipAddress,
          dto.userAgent,
          undefined,
          'Usuario no encontrado'
        );
        return {
          success: true,
          message: genericMessage,
        };
      }

      const resetCode = this.tokenService.generateResetCode();
      const resetToken = crypto.randomUUID();
      const { UserStateService } = await import('./UserStateService');
      UserStateService.setResetToken(user, resetToken, 60);

      await this.userRepository.update(user);

      try {
        await this.userDomainService.sendPasswordResetEmail(
          dto.email,
          resetCode,
          user.fullName
        );
      } catch (error) {
        console.error('Error enviando email de recuperación:', error);
        await this.auditService.logPasswordRecovery(
          dto.email,
          'FAILURE',
          dto.ipAddress,
          dto.userAgent,
          user.id,
          'Error enviando email'
        );
        return {
          success: true,
          message: genericMessage,
        };
      }

      await this.auditService.logPasswordRecovery(
        dto.email,
        'SUCCESS',
        dto.ipAddress,
        dto.userAgent,
        user.id
      );

      return {
        success: true,
        message: genericMessage,
      };
    } catch (error) {
      return {
        success: true,
        message: genericMessage,
      };
    }
  }
}
