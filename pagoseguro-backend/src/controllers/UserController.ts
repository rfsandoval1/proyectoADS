import { Request, Response } from 'express';
import { UserDomainService } from '../services/UserDomainService';

export class UserController {
  constructor(private readonly userDomainService: UserDomainService) {}

  async getMe(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const user = await this.userDomainService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email.value,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        cedula: user.cedula,
        telefono: user.telefono,
        direccion: user.direccion,
        emailVerified: user.emailVerified,
      },
    });
  }

  async listUsers(req: Request, res: Response) {
    if ((req as any).user?.role !== 'GERENTE') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    const users = await this.userDomainService.listUsers();
    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email.value,
      fullName: u.fullName,
      role: u.role,
      status: u.status,
      cedula: u.cedula,
      telefono: u.telefono,
      direccion: u.direccion,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
    }));
    res.json({ success: true, users: formatted });
  }

  async updateUser(req: Request, res: Response) {
    const userId = req.params.id;
    const currentUser = (req as any).user;
    if (currentUser.role !== 'GERENTE' && currentUser.userId !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    const updated = await this.userDomainService.updateUser(userId, req.body);
    res.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email.value,
        fullName: updated.fullName,
        role: updated.role,
        status: updated.status,
        cedula: updated.cedula,
        telefono: updated.telefono,
        direccion: updated.direccion,
      },
    });
  }

  async deleteUser(req: Request, res: Response) {
    const userId = req.params.id;
    const currentUser = (req as any).user;
    if (currentUser.role !== 'GERENTE') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    await this.userDomainService.deleteUser(userId);
    res.json({ success: true });
  }

  async registerAssistant(req: Request, res: Response) {
    const currentUser = (req as any).user;
    if (currentUser.role !== 'GERENTE') {
      return res.status(403).json({ success: false, message: 'Solo el gerente puede registrar asistentes' });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña son requeridos' });
    }
    try {
      const { UserFactory } = await import('../factories/UserFactory');
      const { UserRole, UserStatus } = await import('../models/User');
      await this.userDomainService.validateNewUser(email, '');
      const user = await UserFactory.createNew({
        email,
        password,
        fullName: name,
        role: UserRole.ASISTENTE,
        createdBy: currentUser.userId
      });
      (user as any).status = UserStatus.ACTIVE;
      (user as any).emailVerified = true;
      await this.userDomainService.createUser(user);
      res.status(201).json({
        success: true,
        message: `Asistente ${name} registrado exitosamente`,
        user: {
          id: user.id,
          email: user.email.value,
          fullName: user.fullName,
          role: user.role,
          status: user.status
        }
      });
    } catch (error: any) {
      if (error.message?.includes('ya existe') || error.message?.includes('already exists')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      console.error('Error registrando asistente:', error);
      res.status(500).json({ success: false, message: 'Error interno al registrar asistente' });
    }
  }
}
