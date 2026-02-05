import bcrypt from 'bcrypt';

export class PasswordHashingService {

  async hash(plainPassword: string): Promise<string> {
    const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcrypt.hash(plainPassword, rounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
