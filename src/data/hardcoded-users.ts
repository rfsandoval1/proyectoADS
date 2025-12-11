import { User } from '../common/interfaces/user.interface';

export const HARD_USERS: User[] = [
  {
    name: 'Fernando Cliente',
    email: 'cliente@test.com',
    password: 'Cliente123!',
    role: 'cliente',
  },
  {
    name: 'Zaith Asistente',
    email: 'asistente@test.com',
    password: 'Asistente123!',
    role: 'asistente',
  },
  {
    name: 'Simone Cliente',
    email: 'cliente2@test.com',
    password: 'Cliente1234!',
    role: 'cliente',
  },

  {
    name: 'Oswaldo Gerente',
    email: 'gerente@test.com',
    password: 'Gerente123!',
    role: 'gerente',
  },
];
