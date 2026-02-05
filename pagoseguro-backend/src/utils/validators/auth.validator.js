"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverPasswordSchema = exports.loginSchema = exports.registerClientSchema = void 0;
const zod_1 = require("zod");
exports.registerClientSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').toLowerCase(),
    password: zod_1.z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/\d/, 'Debe contener al menos un número')
        .regex(/[@$!%*?&]/, 'Debe contener al menos un carácter especial (@$!%*?&)'),
    fullName: zod_1.z.string().min(3, 'Nombre completo requerido').max(100),
    cedula: zod_1.z.string().length(10, 'Cédula debe tener 10 dígitos').regex(/^\d+$/, 'Solo números'),
    telefono: zod_1.z.string().min(10, 'Teléfono inválido').max(15),
    direccion: zod_1.z.string().min(10, 'Dirección debe tener al menos 10 caracteres').max(250),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').toLowerCase(),
    password: zod_1.z.string().min(1, 'Contraseña requerida'),
});
exports.recoverPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').toLowerCase(),
});
