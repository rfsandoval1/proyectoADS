export {
  IPasswordHasher,
  TokenPayload,
  Tokens,
  ITokenService,
  IEmailService,
  IUserDomainService,
} from './domain-services';


export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IHashingService {
  hash(value: string): Promise<string>;
  compare(value: string, hashedValue: string): Promise<boolean>;
}
