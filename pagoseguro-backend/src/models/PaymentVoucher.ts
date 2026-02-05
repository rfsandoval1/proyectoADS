// Modelo de dominio para Comprobante de Pago

export enum VoucherStatus {
  PENDING = 'pending',      // Pendiente de validación
  VALIDATED = 'validated',  // Validado correctamente
  REJECTED = 'rejected',    // Rechazado
  DUPLICATE = 'duplicate'   // Detectado como duplicado
}

export enum VoucherType {
  TRANSFER = 'transfer',    // Transferencia bancaria
  DEPOSIT = 'deposit',      // Depósito
  CASH = 'cash',            // Efectivo
  CHECK = 'check',          // Cheque
  OTHER = 'other'           // Otro
}

export class PaymentVoucher {
  constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly creditId: string,
    public voucherNumber: string,           // Número de comprobante (para detectar duplicados)
    public amount: number,                   // Monto del comprobante
    public paymentDate: Date,                // Fecha de pago según comprobante
    public voucherType: VoucherType,         // Tipo de comprobante
    public bankName: string | null,          // Nombre del banco
    public accountNumber: string | null,     // Número de cuenta (parcial)
    public payerName: string | null,         // Nombre del pagador
    public beneficiaryName: string | null,   // Nombre del beneficiario
    public imageUrl: string,                 // URL/ruta de la imagen
    public imageHash: string,                // Hash de la imagen (para detectar duplicados)
    public status: VoucherStatus,
    public validationNotes: string | null,   // Notas de validación
    public validatedBy: string | null,       // ID del usuario que validó
    public validatedAt: Date | null,         // Fecha de validación
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // Validar datos básicos del comprobante
  validateBasicData(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.voucherNumber || this.voucherNumber.trim() === '') {
      errors.push('El número de comprobante es requerido');
    }

    if (!this.amount || this.amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (!this.paymentDate) {
      errors.push('La fecha de pago es requerida');
    }

    if (!this.imageUrl || this.imageUrl.trim() === '') {
      errors.push('La imagen del comprobante es requerida');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Marcar como validado
  markAsValidated(validatedBy: string, notes?: string): void {
    this.status = VoucherStatus.VALIDATED;
    this.validatedBy = validatedBy;
    this.validatedAt = new Date();
    this.validationNotes = notes || null;
    this.updatedAt = new Date();
  }

  // Marcar como rechazado
  markAsRejected(validatedBy: string, reason: string): void {
    this.status = VoucherStatus.REJECTED;
    this.validatedBy = validatedBy;
    this.validatedAt = new Date();
    this.validationNotes = reason;
    this.updatedAt = new Date();
  }

  // Marcar como duplicado
  markAsDuplicate(originalVoucherId: string): void {
    this.status = VoucherStatus.DUPLICATE;
    this.validationNotes = `Duplicado del comprobante: ${originalVoucherId}`;
    this.updatedAt = new Date();
  }
}
