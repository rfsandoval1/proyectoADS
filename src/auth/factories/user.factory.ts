import { User } from '../../common/interfaces/user.interface';

export class UserFactory {
  static createUser(raw: User): User {
    return {
      ...raw,
      createdAt: new Date(),
      status: 'active',
    } as any;
  }
}
