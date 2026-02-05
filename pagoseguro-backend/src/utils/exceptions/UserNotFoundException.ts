import { DomainException } from "./DomainException";

export class UserNotFoundException extends DomainException {
  constructor() {
    super('Usuario no encontrado');
    this.name = 'UserNotFoundException';
  }
}
