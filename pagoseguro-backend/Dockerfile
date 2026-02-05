FROM node:20-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Copiar el schema de Prisma desde la ruta correcta
COPY src/infrastructure/database/prisma ./prisma

# Instalar dependencias
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Producción
FROM node:20-alpine AS production

WORKDIR /app

# Instalar openssl para Prisma
RUN apk add --no-cache openssl

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./
COPY --from=base /app/prisma ./prisma

EXPOSE 5173

CMD ["npm", "start"]