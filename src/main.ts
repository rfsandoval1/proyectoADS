import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS para peticiones desde el frontend estático (desarrollo)
  app.enableCors();

  // Servir carpeta frontend como estática
  app.useStaticAssets(join(__dirname, '..', 'frontend'));

  // Rutas amables para UI (aliases)
  // `/dashboard-ui` -> devuelve el dashboard estático
  const server = app.getHttpAdapter().getInstance();
  server.get('/dashboard-ui', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'dashboard.html'));
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

bootstrap();
