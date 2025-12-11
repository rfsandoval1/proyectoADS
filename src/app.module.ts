import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, DashboardModule],
  controllers: [AppController],
})
export class AppModule {}
