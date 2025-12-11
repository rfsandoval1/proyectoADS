import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() data: LoginDto) {
    const result = this.authService.login(data);
    if (!result || result.ok === false) {
      throw new UnauthorizedException(result?.message || 'Credenciales inválidas');
    }
    return result;
  }

  @Post('register')
  register(@Body() body: { name: string; email: string; password: string }) {
    return this.authService.register(body);
  }

  @Post('forgot')
  forgot(@Body() body: { email: string }) {
    return this.authService.forgot(body.email);
  }

  @Post('reset')
  reset(@Body() body: { email: string; code: string; newPassword: string }) {
    return this.authService.reset(body.email, body.code, body.newPassword);
  }

  @Post('logout')
  logout(@Req() req: Request) {
    // For prototype tokens are stateless; still expose endpoint
    return this.authService.logout();
  }
}
