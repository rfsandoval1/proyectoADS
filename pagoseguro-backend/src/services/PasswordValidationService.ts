import { DomainException } from '../utils/exceptions/DomainException';

export class PasswordValidationService {
  

  static validate(password: string): void {
    if (password.length < 8) {
      throw new DomainException(
        'La contraseña debe tener al menos 8 caracteres'
      );
    }
    
    if (!this.hasUpperCase(password)) {
      throw new DomainException(
        'La contraseña debe contener al menos una mayúscula'
      );
    }
    
    if (!this.hasLowerCase(password)) {
      throw new DomainException(
        'La contraseña debe contener al menos una minúscula'
      );
    }
    
    if (!this.hasNumber(password)) {
      throw new DomainException(
        'La contraseña debe contener al menos un número'
      );
    }
    
    if (!this.hasSpecialChar(password)) {
      throw new DomainException(
        'La contraseña debe contener al menos un carácter especial (@$!%*?&)'
      );
    }
  }

  private static hasUpperCase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  private static hasLowerCase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  private static hasNumber(password: string): boolean {
    return /\d/.test(password);
  }

  private static hasSpecialChar(password: string): boolean {
    return /[@$!%*?&]/.test(password);
  }
}
