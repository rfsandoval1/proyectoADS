import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { RoleGuard, Roles } from '../common/guards/role.guard';

@Controller('manager')
@UseGuards(RoleGuard)
export class ManagerController {
  constructor(private readonly authService: AuthService) {}

  @Post('assistants')
  @Roles('gerente')
  createAssistant(
    @Body() body: { name: string; email: string; password: string },
  ) {
    return this.authService.createAssistant(body);
  }
}
