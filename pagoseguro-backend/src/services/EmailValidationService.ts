import { DomainException } from '../utils/exceptions';


export class EmailValidationService {
  
  static validate(email: string): void {
    const normalized = email.toLowerCase().trim();
    
    if (!this.isValidFormat(normalized)) {
      throw new DomainException('Email inválido: formato no válido');
    }
    
    if (normalized.length > 100) {
      throw new DomainException('Email inválido: demasiado largo');
    }
  }

  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static normalize(email: string): string {
    return email.toLowerCase().trim();
  }
}
