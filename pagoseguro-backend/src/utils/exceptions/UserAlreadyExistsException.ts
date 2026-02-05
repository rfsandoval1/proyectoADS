import { DomainException } from "./DomainException";

export class UserAlreadyExistsException extends DomainException {
  constructor(value: string, field: string = 'email') {
    const label = field === 'cedula' ? 'La cédula' : 'El email';
    super(`${label} ${value} ya está registrado`);
    this.name = 'UserAlreadyExistsException';
  }
}
