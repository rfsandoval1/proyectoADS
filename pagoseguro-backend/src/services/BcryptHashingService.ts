import bcrypt from 'bcrypt';
import { IHashingService } from '../lib/interfaces';
import { config } from '../config/env';

export class BcryptHashingService implements IHashingService {
  async hash(value: string): Promise<string> {
    const rounds = config.bcrypt.rounds;
    return bcrypt.hash(value, rounds);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue);
  }
}
