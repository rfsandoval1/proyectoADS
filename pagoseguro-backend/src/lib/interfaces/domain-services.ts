/**
 * Interfaces de servicios de dominio
 * Estas abstracciones separan las responsabilidades según SOLID
 */

/* ==================================
   PASSWORD HASHING SERVICE
================================== */
export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

/* ==================================
   TOKEN SERVICE
================================== */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokens(payload: TokenPayload): Promise<Tokens>;
  verifyAccessToken(token: string): Promise<TokenPayload | null>;
  verifyRefreshToken(token: string): Promise<TokenPayload | null>;
  generateResetCode(): string;
}

/* ==================================
   EMAIL SERVICE
================================== */
export interface IEmailService {
  sendVerificationEmail(email: string, token: string, fullName: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetCode: string, fullName: string): Promise<void>;
  sendAccountBlockedEmail(email: string, fullName: string, blockedUntil: Date): Promise<void>;
}

/* ==================================
   USER DOMAIN SERVICE
================================== */
export interface IUserDomainService {
  validateNewUser(email: string, cedula: string): Promise<void>;
  handleFailedLoginAttempt(userId: string): Promise<void>;
  verifyUserCanLogin(userId: string): Promise<void>;
}
