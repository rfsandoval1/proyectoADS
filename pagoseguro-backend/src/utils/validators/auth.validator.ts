import { z } from 'zod';

export const registerClientSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/\d/, 'Debe contener al menos un número')
    .regex(/[@$!%*?&]/, 'Debe contener al menos un carácter especial (@$!%*?&)'),
  fullName: z.string().min(3, 'Nombre completo requerido').max(100),
  cedula: z.string().length(10, 'Cédula debe tener 10 dígitos').regex(/^\d+$/, 'Solo números'),
  telefono: z.string().min(10, 'Teléfono inválido').max(15),
  direccion: z.string().min(10, 'Dirección debe tener al menos 10 caracteres').max(250),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const recoverPasswordSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
});
