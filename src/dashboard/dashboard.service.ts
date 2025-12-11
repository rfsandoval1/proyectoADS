import { Injectable } from '@nestjs/common';
import { ClientStrategy } from '../auth/strategies/client.strategy';
import { AssistantStrategy } from '../auth/strategies/assistant.strategy';
import { ManagerStrategy } from '../auth/strategies/manager.strategy';

@Injectable()
export class DashboardService {
  getDashboardByRole(role: string) {
    let strategy: any;

    switch (role) {
      case 'cliente':
        strategy = new ClientStrategy();
        break;
      case 'asistente':
        strategy = new AssistantStrategy();
        break;
      case 'gerente':
        strategy = new ManagerStrategy();
        break;
      default:
        return { error: 'Rol no válido' };
    }

    return strategy.getDashboardData();
  }
}
