import { DomainException } from "./DomainException";

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Credenciales incorrectas');
    this.name = 'InvalidCredentialsException';
  }
}
