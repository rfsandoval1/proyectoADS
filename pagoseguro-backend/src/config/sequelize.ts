import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pagoseguro_db', {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;