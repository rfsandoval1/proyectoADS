import { Controller, Get, Query, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import type { Request } from 'express';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  showDashboard(@Req() req: Request, @Query('role') role: string) {
    // Preferir role del token (req.user) si está disponible
    const authHeader = req.headers['authorization'];
    let tokenRole: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        tokenRole = decoded.split(':')[1];
      } catch {
        tokenRole = undefined;
      }
    }

    const effectiveRole = tokenRole || role;
    return this.dashboardService.getDashboardByRole(effectiveRole);
  }
}
