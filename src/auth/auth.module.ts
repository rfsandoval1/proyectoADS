import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ManagerController } from '../manager/manager.controller';
import { RoleGuard } from '../common/guards/role.guard';

@Module({
  controllers: [AuthController, ManagerController],
  providers: [AuthService, RoleGuard],
})
export class AuthModule {}
