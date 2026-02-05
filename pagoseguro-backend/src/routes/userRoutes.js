import { Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/User';
import { userController } from '../controllers/userController';

const router = Router();

// Rutas para la gestión de usuarios
router.get('/list', userController.listUsers);
// Otras rutas de usuario...

export default router;