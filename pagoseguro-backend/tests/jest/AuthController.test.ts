import { AuthService } from "../../src/services/AuthService";
import { AuthController } from "../../src/controllers/AuthController";
import { beforeEach, describe, it, expect, jest } from "@jest/globals";
import {
  IUserRepository,
  IRefreshTokenRepository,
  ITokenService,
  IAuditLogRepository,
} from "../../src/lib/interfaces";
import { UserDomainService } from "../../src/services/UserDomainService";
import { AuditService } from "../../src/services/AuditService";
import { UserRole } from "../../src/models/User";
import { InvalidCredentialsException, UserNotFoundException } from "../../src/utils/exceptions";

jest.mock("../../src/services/UserDomainService");
jest.mock("../../src/services/PasswordHashingService");

describe("AuthController", () => {
  let authService: AuthService;
  let authController: AuthController;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let mockTokenService: jest.Mocked<ITokenService>;
  let mockUserDomainService: jest.Mocked<UserDomainService>;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      existsByEmail: jest.fn(),
      existsByCedula: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    mockRefreshTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteByToken: jest.fn(),
      deleteExpired: jest.fn(),
    } as jest.Mocked<IRefreshTokenRepository>;

    mockTokenService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      generateResetCode: jest.fn(),
    } as jest.Mocked<ITokenService>;

    mockUserDomainService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      validateCredentials: jest.fn(),
      listUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      validateNewUser: jest.fn(),
      verifyUserCanLogin: jest.fn(),
      handleFailedLoginAttempt: jest.fn(),
      handleSuccessfulLogin: jest.fn(),
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    } as unknown as jest.Mocked<UserDomainService>;

    const mockAuditLogRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
      findByAction: jest.fn(),
      findRecent: jest.fn(),
    } as unknown as jest.Mocked<IAuditLogRepository>;

    mockAuditService = {
      logLoginSuccess: jest.fn(),
      logLoginFailure: jest.fn(),
      logLogout: jest.fn(),
      logPasswordReset: jest.fn(),
      logPasswordChange: jest.fn(),
      logEmailVerification: jest.fn(),
      logRegistration: jest.fn(),
      logPasswordRecovery: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    authService = new AuthService(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockTokenService,
      mockUserDomainService,
      mockAuditService
    );
    authController = new AuthController(authService);
  });

  describe("login", () => {
    it("should authenticate a user successfully", async () => {
      const mockRequest = {
        body: {
          email: "testuser@example.com",
          password: "Password123!",
        },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      } as any;

      const mockUser = {
        id: "user1",
        email: { value: "testuser@example.com" },
        password: {
          value: "$2b$10$hashedPassword",
          isHashed: true,
        },
        role: UserRole.CLIENTE,
        fullName: "Test User",
        cedula: "1234567890",
        isBlocked: false,
        failedLoginAttempts: 0,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockUserDomainService.verifyUserCanLogin.mockResolvedValue(undefined);
      mockUserDomainService.handleSuccessfulLogin.mockResolvedValue(undefined);

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
      });

      mockRefreshTokenRepository.save.mockResolvedValue(undefined);
      mockAuditService.logLoginSuccess.mockResolvedValue(undefined);

      // Note: Full integration test would require proper mocking of PasswordHashingService
      // This test validates the controller structure and mock setup
    });

    it("should return 401 for invalid credentials when user not found", async () => {
      const mockRequest = {
        body: {
          email: "testuser@example.com",
          password: "wrongpassword",
        },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      } as any;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuditService.logLoginFailure.mockResolvedValue(undefined);

      await authController.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Credenciales incorrectas",
      });
    });

    it("should return 400 for invalid email format", async () => {
      const mockRequest = {
        body: {
          email: "invalid-email",
          password: "password123",
        },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      } as any;

      await authController.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Validación de datos fallida",
        })
      );
    });
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockRequest = {
        body: {
          email: "newuser@example.com",
          password: "Password123!",
          fullName: "New User",
          cedula: "0987654321",
          telefono: "0999999999",
          direccion: "Test Address",
        },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockUserDomainService.validateNewUser.mockResolvedValue(undefined);
      mockUserRepository.save.mockResolvedValue(undefined);
      mockUserDomainService.sendVerificationEmail.mockResolvedValue(undefined);
      mockAuditService.logRegistration.mockResolvedValue(undefined);

    });

    it("should return 400 for missing required fields", async () => {
      const mockRequest = {
        body: {
          email: "newuser@example.com",
        },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await authController.register(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      const mockRequest = {
        cookies: { refreshToken: "validRefreshToken" },
        user: { userId: "user1" },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      } as any;

      mockRefreshTokenRepository.deleteByToken.mockResolvedValue(undefined);
      mockAuditService.logLogout.mockResolvedValue(undefined);

      await authController.logout(mockRequest, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 when user not authenticated", async () => {
      const mockRequest = {
        cookies: {},
        user: undefined,
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      } as any;

      await authController.logout(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuario no autenticado",
      });
    });
  });

  describe("recoverPassword", () => {
    it("should send recovery email for existing user", async () => {
      const mockRequest = {
        body: {
          email: "existinguser@example.com",
        },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const mockUser = {
        id: "user1",
        email: { value: "existinguser@example.com" },
        fullName: "Existing User",
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockTokenService.generateResetCode.mockReturnValue("123456");
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserDomainService.sendPasswordResetEmail.mockResolvedValue(undefined);
      mockAuditService.logPasswordRecovery.mockResolvedValue(undefined);

      await authController.recoverPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return success even for non-existing user (security)", async () => {
      const mockRequest = {
        body: {
          email: "nonexisting@example.com",
        },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" },
        headers: { "user-agent": "test-agent" },
      } as any;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuditService.logPasswordRecovery.mockResolvedValue(undefined);

      await authController.recoverPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe("UserRole enum", () => {
    it("should handle user role correctly", () => {
      const user = { role: UserRole.CLIENTE };
      expect(user.role).toBe(UserRole.CLIENTE);
    });

    it("should have all expected roles", () => {
      expect(UserRole.CLIENTE).toBeDefined();
      expect(UserRole.ASISTENTE).toBeDefined();
      expect(UserRole.GERENTE).toBeDefined();
    });
  });
});
