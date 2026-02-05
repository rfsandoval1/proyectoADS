import { User, UserStatus } from '../models/User';

export class UserStateService {

  static isBlocked(user: User): boolean {
    if (user.status !== UserStatus.BLOCKED) return false;
    if (!user.blockedUntil) return false;

    if (new Date() > user.blockedUntil) {
      user.status = UserStatus.ACTIVE;
      user.blockedUntil = undefined;
      user.loginAttempts = 0;
      user.lastLoginAttempt = undefined;
      return false;
    }

    return true;
  }


  static incrementLoginAttempts(user: User): void {
    user.loginAttempts++;
    user.lastLoginAttempt = new Date();

    if (user.loginAttempts >= 5) {
      this.blockAccount(user, 30);
    }
  }

  static resetLoginAttempts(user: User): void {
    user.loginAttempts = 0;
    user.lastLoginAttempt = undefined;
  }

  static blockAccount(user: User, minutes: number): void {
    user.status = UserStatus.BLOCKED;
    user.blockedUntil = new Date(Date.now() + minutes * 60 * 1000);
  }

  static updateLastLogin(user: User): void {
    user.lastLogin = new Date();
    this.resetLoginAttempts(user);
  }

  static setVerificationToken(user: User, token: string): void {
    user.verificationToken = token;
  }


  static verifyEmail(user: User): void {
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.verificationToken = undefined;
    user.status = UserStatus.ACTIVE;
  }


  static setResetToken(user: User, token: string, expiryMinutes: number = 60): void {
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  }


  static isResetTokenValid(user: User): boolean {
    if (!user.resetToken || !user.resetTokenExpiry) return false;
    return new Date() < user.resetTokenExpiry;
  }


  static clearResetToken(user: User): void {
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
  }


  static markAsUpdated(user: User): void {
    user.updatedAt = new Date();
  }
}
