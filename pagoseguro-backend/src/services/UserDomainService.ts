import { IUserRepository, IEmailService } from '../lib/interfaces';
import {
  UserAlreadyExistsException,
  DomainException
} from '../utils/exceptions';
import { User } from '../models/User';
import { UserStateService } from './UserStateService';

export class UserDomainService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService
  ) { }

  async listUsers(): Promise<User[]> {
    // Devuelve todos los usuarios
    // (en producción, agregar paginación y filtros)
    // Suponemos que el repositorio tiene un método findAll()
    if (typeof (this.userRepository as any).findAll === 'function') {
      return (this.userRepository as any).findAll();
    }
    throw new Error('Método findAll no implementado en el repositorio');
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) throw new Error('Usuario no encontrado');

    // Create new User object - remove readonly parameters from constructor
    const updatedUser = new User(
      existingUser.id,
      existingUser.email,
      existingUser.password,
      data.fullName || existingUser.fullName,
      existingUser.role,
      (data as any).status || existingUser.status,
      data.cedula || existingUser.cedula,
      data.telefono || existingUser.telefono,
      data.direccion || existingUser.direccion
    );

    // Set readonly properties via type assertion
    (updatedUser as any).createdAt = existingUser.createdAt;
    (updatedUser as any).createdBy = existingUser.createdBy;

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

  async createUser(user: User): Promise<User> {
    await this.userRepository.save(user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async validateNewUser(email: string, cedula: string): Promise<void> {
    if (await this.userRepository.existsByEmail(email)) {
      throw new UserAlreadyExistsException(email);
    }

    if (cedula && await this.userRepository.existsByCedula(cedula)) {
      throw new UserAlreadyExistsException(cedula, 'cedula');
    }
  }

  async verifyUserCanLogin(user: User): Promise<void> {
    if (UserStateService.isBlocked(user)) {
      throw new DomainException(
        `Cuenta bloqueada hasta ${user.blockedUntil?.toLocaleString()}`
      );
    }
  }

  async handleFailedLoginAttempt(user: User): Promise<void> {
    UserStateService.incrementLoginAttempts(user);

    if (UserStateService.isBlocked(user) && user.blockedUntil) {
      try {
        await this.emailService.sendAccountBlockedEmail(
          user.email.value,
          user.fullName,
          user.blockedUntil
        );
      } catch (error) {
        console.error('Error enviando email de bloqueo:', error);
      }
    }

    await this.userRepository.update(user);
  }

  async handleSuccessfulLogin(user: User): Promise<void> {
    UserStateService.updateLastLogin(user);
    await this.userRepository.update(user);
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    fullName: string
  ): Promise<void> {
    try {
      await this.emailService.sendVerificationEmail(email, token, fullName);
    } catch (error) {
      console.error('Error enviando email de verificación:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
    fullName: string
  ): Promise<void> {
    try {
      await this.emailService.sendPasswordResetEmail(email, resetCode, fullName);
    } catch (error) {
      console.error('Error enviando email de recuperación:', error);
      throw error;
    }
  }
}