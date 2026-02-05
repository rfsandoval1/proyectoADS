
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export default defineConfig({
  datasource: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
    },
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
