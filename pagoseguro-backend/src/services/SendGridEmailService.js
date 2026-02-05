"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridEmailService = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const env_1 = require("../config/env");
class SendGridEmailService {
    constructor() {
        mail_1.default.setApiKey(env_1.config.sendgrid.apiKey);
    }
    async sendVerificationEmail(email, token, name) {
        const verificationUrl = `${env_1.config.frontend.url}/verificar-email?token=${token}`;
        const msg = {
            to: email,
            from: {
                email: env_1.config.email.from,
                name: env_1.config.email.fromName,
            },
            subject: '✅ Verifica tu cuenta - El Granito',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #166534;">Bienvenido a El Granito, ${name}</h1>
          <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #16a34a; 
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verificar mi cuenta
          </a>
          <p style="color: #666; font-size: 14px;">
            Este enlace es válido por 24 horas.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si no creaste esta cuenta, ignora este correo.
          </p>
        </div>
      `,
        };
        await mail_1.default.send(msg);
    }
    async sendPasswordResetEmail(email, code, name) {
        const msg = {
            to: email,
            from: {
                email: env_1.config.email.from,
                name: env_1.config.email.fromName,
            },
            subject: '🔒 Recuperación de contraseña - El Granito',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #166534;">Recuperación de contraseña</h1>
          <p>Hola ${name},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; 
                      border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #166534; font-size: 32px; letter-spacing: 4px; margin: 0;">
              ${code}
            </h2>
          </div>
          <p style="color: #666; font-size: 14px;">
            Este código es válido por 10 minutos.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si no solicitaste este cambio, ignora este correo.
          </p>
        </div>
      `,
        };
        await mail_1.default.send(msg);
    }
    async sendWelcomeEmail(email, name) {
        const msg = {
            to: email,
            from: {
                email: env_1.config.email.from,
                name: env_1.config.email.fromName,
            },
            subject: '🎉 ¡Bienvenido a El Granito!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #166534;">¡Cuenta activada exitosamente!</h1>
          <p>Hola ${name},</p>
          <p>Tu cuenta ha sido verificada. Ya puedes acceder a todos nuestros servicios.</p>
          <a href="${env_1.config.frontend.url}/login" 
             style="display: inline-block; padding: 12px 24px; background-color: #16a34a; 
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Iniciar sesión
          </a>
        </div>
      `,
        };
        await mail_1.default.send(msg);
    }
    async sendAccountBlockedEmail(email, name, blockedUntil) {
        const msg = {
            to: email,
            from: {
                email: env_1.config.email.from,
                name: env_1.config.email.fromName,
            },
            subject: '⚠️ Cuenta temporalmente bloqueada - El Granito',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Cuenta bloqueada por seguridad</h1>
          <p>Hola ${name},</p>
          <p>Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos de inicio de sesión fallidos.</p>
          <p><strong>Tu cuenta se desbloqueará el:</strong> ${blockedUntil.toLocaleString()}</p>
          <p style="color: #666; font-size: 14px;">
            Si no fuiste tú quien intentó acceder, te recomendamos cambiar tu contraseña.
          </p>
        </div>
      `,
        };
        await mail_1.default.send(msg);
    }
}
exports.SendGridEmailService = SendGridEmailService;
