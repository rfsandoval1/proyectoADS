import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';

// Decorador para definir roles permitidos en un endpoint
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Primero revisa el header Authorization (Bearer <token>)
    const auth = req.headers['authorization'];
    let rol: string | undefined;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const decodificado = Buffer.from(token, 'base64').toString('utf8');
        const partes = decodificado.split(':');
        rol = partes[1];
      } catch {
        rol = undefined;
      }
    }

    // Alternativa: revisar el header x-user-role (para pruebas rápidas)
    if (!rol) {
      rol = (req.headers['x-user-role'] as string) || undefined;
    }

    const rolesRequeridos = this.obtenerRoles(context);
    if (!rolesRequeridos || rolesRequeridos.length === 0) return true;
    if (!rol) throw new ForbiddenException('No se proporcionó un rol');
    return rolesRequeridos.includes(rol);
  }

  private obtenerRoles(context: ExecutionContext): string[] {
    const rolesHandler = (Reflect as any).getMetadata(
      'roles',
      context.getHandler(),
    );
    const rolesClase = (Reflect as any).getMetadata(
      'roles',
      context.getClass(),
    );
    return rolesHandler || rolesClase || [];
  }
}
