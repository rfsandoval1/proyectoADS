"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
class UserController {
    constructor(userDomainService) {
        this.userDomainService = userDomainService;
    }
    async getMe(req, res) {
        const userId = req.user?.userId;
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
    async listUsers(req, res) {
        if (req.user?.role !== 'GERENTE') {
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
    async updateUser(req, res) {
        const userId = req.params.id;
        const currentUser = req.user;
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
    async deleteUser(req, res) {
        const userId = req.params.id;
        const currentUser = req.user;
        if (currentUser.role !== 'GERENTE') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }
        await this.userDomainService.deleteUser(userId);
        res.json({ success: true });
    }
    async registerAssistant(req, res) {
        const currentUser = req.user;
        if (currentUser.role !== 'GERENTE') {
            return res.status(403).json({ success: false, message: 'Solo el gerente puede registrar asistentes' });
        }
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña son requeridos' });
        }
        try {
            const { UserFactory } = await Promise.resolve().then(() => __importStar(require('../factories/UserFactory')));
            const { UserRole, UserStatus } = await Promise.resolve().then(() => __importStar(require('../models/User')));
            await this.userDomainService.validateNewUser(email, '');
            const user = await UserFactory.createNew({
                email,
                password,
                fullName: name,
                role: UserRole.ASISTENTE,
                createdBy: currentUser.userId
            });
            user.status = UserStatus.ACTIVE;
            user.emailVerified = true;
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
        }
        catch (error) {
            if (error.message?.includes('ya existe') || error.message?.includes('already exists')) {
                return res.status(409).json({ success: false, message: error.message });
            }
            console.error('Error registrando asistente:', error);
            res.status(500).json({ success: false, message: 'Error interno al registrar asistente' });
        }
    }
}
exports.UserController = UserController;
