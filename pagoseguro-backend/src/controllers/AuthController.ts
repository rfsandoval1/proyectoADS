import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthService } from '../services/AuthService';
import { 
  registerClientSchema, 
  loginSchema, 
  recoverPasswordSchema 
} from '../utils/validators/auth.validator';
import { 
  UserAlreadyExistsException, 
  InvalidCredentialsException, 
  UserNotFoundException, 
  DomainException 
} from '../utils/exceptions';
import {
  LoginRequestDTO,
  RegisterRequestDTO,
  RecoverPasswordRequestDTO,
  LoginServiceDTO,
  RegisterServiceDTO,
  RecoverPasswordServiceDTO,
  LogoutServiceDTO
} from '../dtos/auth.dto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}


  async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerClientSchema.parse(req.body) as RegisterRequestDTO;

      const dto: RegisterServiceDTO = {
        ...validatedData,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      };

      const result = await this.authService.register(dto);

      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }


  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body) as LoginRequestDTO;

      const dto: LoginServiceDTO = {
        ...validatedData,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      };

      const result = await this.authService.login(dto);

      res.cookie('refreshToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const dto: LogoutServiceDTO = {
        userId,
        refreshToken,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      };

      const result = await this.authService.logout(dto);

      res.clearCookie('refreshToken');

      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async recoverPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = recoverPasswordSchema.parse(req.body) as RecoverPasswordRequestDTO;

      const dto: RecoverPasswordServiceDTO = {
        ...validatedData,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      };

      const result = await this.authService.recoverPassword(dto);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validación de datos fallida',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof UserAlreadyExistsException) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof InvalidCredentialsException) {
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
      return;
    }

    if (error instanceof UserNotFoundException) {
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
      return;
    }

    if (error instanceof DomainException) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Error no controlado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}
