# PagoSeguroAGROTAC - Backend

Sistema de gestión de pagos y créditos para El Granito de AGROTAC.

## 🏗️ Arquitectura

Este proyecto implementa **Arquitectura Hexagonal (Ports & Adapters)** con:

- **Domain Layer**: Entidades, Value Objects, Interfaces
- **Application Layer**: Casos de Uso, DTOs, Validadores
- **Infrastructure Layer**: Adaptadores (HTTP, DB, Servicios Externos)

## 🚀 Stack Tecnológico

- **Runtime**: Node.js 20 LTS
- **Lenguaje**: TypeScript 5.3
- **Framework HTTP**: Express.js 4.18
- **ORM**: Prisma 5.22
- **Base de Datos**: PostgreSQL 15
- **Autenticación**: JWT + bcrypt
- **Validación**: Zod
- **Testing**: Jest + Supertest
- **Logs**: Winston

## 📋 Prerequisitos

- Node.js >= 20.0.0
- PostgreSQL >= 15
- Docker & Docker Compose (opcional)

## ⚙️ Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd pagoseguro-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Levantar base de datos con Docker
npm run docker:up

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Sembrar datos iniciales
npm run prisma:seed
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Modo desarrollo con hot-reload

# Build
npm run build            # Compilar TypeScript
npm start                # Ejecutar versión compilada

# Testing
npm test                 # Tests en modo watch
npm run test:unit        # Solo tests unitarios
npm run test:integration # Tests de integración
npm run test:e2e         # Tests end-to-end
npm run test:coverage    # Cobertura de tests

# Linting
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
npm run format           # Formatear con Prettier

# Base de Datos
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:seed      # Sembrar datos

# Docker
npm run docker:up        # Levantar contenedores
npm run docker:down      # Detener contenedores
npm run docker:logs      # Ver logs
```

## 📁 Estructura del Proyecto

```
src/
├── domain/              # Lógica de negocio pura
├── application/         # Casos de uso
├── infrastructure/      # Adaptadores
└── shared/              # Código compartido
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (rounds=12)
- Autenticación JWT con refresh tokens
- Rate limiting habilitado
- Headers de seguridad con Helmet
- Validación estricta con Zod
- SQL injection prevention con Prisma

## 📚 Documentación API

La documentación Swagger está disponible en: `http://localhost:3000/api/docs`

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Con cobertura
npm run test:coverage
```

## 📝 Licencia

MIT - Grupo 3 AGROTAC
