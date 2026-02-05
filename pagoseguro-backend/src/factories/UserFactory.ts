import { User, UserRole, UserStatus } from '../models/User';
import { Email } from '../models/Email';
import { Password } from '../models/Password';
import { EmailValidationService } from '../services/EmailValidationService';
import { PasswordValidationService } from '../services/PasswordValidationService';
import { PasswordHashingService } from '../services/PasswordHashingService';


export class UserFactory {

  static async createNew(props: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    cedula?: string;
    telefono?: string;
    direccion?: string;
    createdBy?: string;
  }): Promise<User> {
    EmailValidationService.validate(props.email);
    const normalizedEmail = EmailValidationService.normalize(props.email);
    
    PasswordValidationService.validate(props.password);
    
    const hasher = new PasswordHashingService();
    const hashedPassword = await hasher.hash(props.password);

    return new User(
      crypto.randomUUID(),
      new Email(normalizedEmail),
      new Password(hashedPassword, true),
      props.fullName,
      props.role,
      UserStatus.PENDING_VERIFICATION,
      props.cedula,
      props.telefono,
      props.direccion,
      0,
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      new Date(),
      props.createdBy
    );
  }

  static reconstitute(props: {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    cedula?: string;
    telefono?: string;
    direccion?: string;
    loginAttempts: number;
    lastLoginAttempt?: Date;
    blockedUntil?: Date;
    lastLogin?: Date;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    verificationToken?: string;
    resetToken?: string;
    resetTokenExpiry?: Date;
    createdAt: Date;
    createdBy?: string;
    updatedAt: Date;
  }): User {
    return new User(
      props.id,
      new Email(props.email),
      new Password(props.password, true),
      props.fullName,
      props.role,
      props.status,
      props.cedula,
      props.telefono,
      props.direccion,
      props.loginAttempts,
      props.lastLoginAttempt,
      props.blockedUntil,
      props.lastLogin,
      props.emailVerified,
      props.emailVerifiedAt,
      props.verificationToken,
      props.resetToken,
      props.resetTokenExpiry,
      props.createdAt,
      props.createdBy,
      props.updatedAt
    );
  }
}
