import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'node:path';

@Controller()
export class AppController {
  @Get('/')
  root(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'frontend', 'index.html'));
  }

  @Get('/login')
  loginPage(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'frontend', 'login.html'));
  }

  @Get('/dashboard-ui')
  dashboardPage(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'frontend', 'dashboard.html'));
  }
}

