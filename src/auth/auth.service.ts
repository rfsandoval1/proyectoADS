import { Injectable } from '@nestjs/common';
import { HARD_USERS } from '../data/hardcoded-users';
import { LoginDto } from './dtos/login.dto';
import { UserFactory } from './factories/user.factory';

// Simple in-memory reset tokens: email -> code
const RESET_TOKENS: Record<string, string> = {};

@Injectable()
export class AuthService {
  // Generate a trivial token for prototype: base64(email:role)
  private generateToken(email: string, role: string) {
    return Buffer.from(`${email}:${role}`).toString('base64');
  }

  // Verify token and return { email, role } or null
  verifyToken(token: string) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [email, role] = decoded.split(':');
      if (!email || !role) return null;
      return { email, role };
    } catch {
      return null;
    }
  }

  login(data: LoginDto) {
    const user = HARD_USERS.find(
      (u) => u.email === data.email && u.password === data.password,
    );

    if (!user) {
      return { ok: false, message: 'Credenciales incorrectas' };
    }

    const createdUser = UserFactory.createUser(user);
    const token = this.generateToken(createdUser.email, createdUser.role);

    // Define a frontend route for the user's dashboard based on role
    const redirectRoute = `/dashboard-${createdUser.role}.html`;

    return {
      ok: true,
      message: 'Login exitoso',
      token,
      user: {
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      redirect: redirectRoute,
    };
  }

  register(payload: { name: string; email: string; password: string }) {
    const exists = HARD_USERS.find((u) => u.email === payload.email);
    if (exists) return { ok: false, message: 'El email ya está registrado' };

    const newUser = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: 'cliente',
    } as any;
    HARD_USERS.push(newUser);
    const user = UserFactory.createUser(newUser);
    return { ok: true, message: 'Registro exitoso', user };
  }

  // Simular forgot: generar código y loguearlo (enviar por "correo")
  forgot(email: string) {
    const user = HARD_USERS.find((u) => u.email === email);
    if (!user) return { ok: false, message: 'No existe usuario con ese email' };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    RESET_TOKENS[email] = code;
    // Simular envío por correo: log en consola
    console.log(`[SIMULATED EMAIL] Reset code for ${email}: ${code}`);
    return { ok: true, message: 'Código enviado (simulado en consola)' };
  }

  reset(email: string, code: string, newPassword: string) {
    const expected = RESET_TOKENS[email];
    if (!expected || expected !== code)
      return { ok: false, message: 'Código inválido' };
    const user = HARD_USERS.find((u) => u.email === email);
    if (!user) return { ok: false, message: 'Usuario no encontrado' };
    user.password = newPassword;
    delete RESET_TOKENS[email];
    return { ok: true, message: 'Contraseña actualizada' };
  }

  logout() {
    // Stateless token — client should remove token. For prototype return ok.
    return { ok: true, message: 'Logout: elimina token en cliente' };
  }

  // Manager action: create assistant
  createAssistant(payload: { name: string; email: string; password: string }) {
    const exists = HARD_USERS.find((u) => u.email === payload.email);
    if (exists) return { ok: false, message: 'El email ya está registrado' };
    const newUser = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: 'asistente',
    } as any;
    HARD_USERS.push(newUser);
    return {
      ok: true,
      message: 'Asistente creado',
      user: UserFactory.createUser(newUser),
    };
  }
}
