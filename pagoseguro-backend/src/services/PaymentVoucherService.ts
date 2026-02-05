import crypto from 'crypto';
import { PaymentVoucher, VoucherStatus, VoucherType } from '../models/PaymentVoucher';
import { IPaymentVoucherRepository } from '../repositories/PostgresPaymentVoucherRepository';

export interface CreateVoucherDTO {
  userId: string;
  creditId: string;
  voucherNumber: string;
  amount: number;
  paymentDate: string;
  voucherType: VoucherType;
  bankName?: string;
  accountNumber?: string;
  payerName?: string;
  beneficiaryName?: string;
  imageBase64: string;  // Imagen en base64
}

export interface VoucherValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  duplicateVoucherId?: string;
}

export class PaymentVoucherService {
  constructor(private readonly voucherRepository: IPaymentVoucherRepository) {}

  // Generar hash de imagen para detección de duplicados
  private generateImageHash(imageBase64: string): string {
    return crypto.createHash('sha256').update(imageBase64).digest('hex');
  }

  // RF-3: Validar comprobante de pago
  async validateVoucher(data: CreateVoucherDTO): Promise<VoucherValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isDuplicate = false;
    let duplicateVoucherId: string | undefined;

    // Validar campos requeridos
    if (!data.voucherNumber || data.voucherNumber.trim() === '') {
      errors.push('El número de comprobante es requerido');
    }

    if (!data.amount || data.amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (!data.paymentDate) {
      errors.push('La fecha de pago es requerida');
    } else {
      const paymentDate = new Date(data.paymentDate);
      const now = new Date();

      // Verificar que la fecha no sea futura
      if (paymentDate > now) {
        errors.push('La fecha de pago no puede ser futura');
      }

      // Advertir si la fecha es muy antigua (más de 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (paymentDate < thirtyDaysAgo) {
        warnings.push('El comprobante tiene más de 30 días de antigüedad');
      }
    }

    if (!data.imageBase64 || data.imageBase64.trim() === '') {
      errors.push('La imagen del comprobante es requerida');
    } else {
      // Validar formato de imagen
      const validPrefixes = [
        'data:image/jpeg',
        'data:image/png',
        'data:image/jpg',
        'data:image/webp',
        'data:image/gif',
        'data:application/pdf'
      ];
      const hasValidFormat = validPrefixes.some(prefix => data.imageBase64.toLowerCase().startsWith(prefix));

      if (!hasValidFormat) {
        errors.push('Formato de imagen no válido. Use JPEG, PNG, WebP o PDF');
      }

      // Validar tamaño (máximo 5MB en base64)
      const base64Data = data.imageBase64.split(',')[1] || data.imageBase64;
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (sizeInBytes > maxSize) {
        errors.push('La imagen excede el tamaño máximo de 5MB');
      }
    }

    // RF-4: Detectar comprobantes duplicados
    if (data.voucherNumber && errors.length === 0) {
      // Verificar por número de comprobante
      const existingByNumber = await this.voucherRepository.findByVoucherNumber(data.voucherNumber);
      if (existingByNumber) {
        isDuplicate = true;
        duplicateVoucherId = existingByNumber.id;
        errors.push(`Ya existe un comprobante con el número ${data.voucherNumber}`);
      }
    }

    // Verificar por hash de imagen
    if (data.imageBase64 && errors.length === 0) {
      const imageHash = this.generateImageHash(data.imageBase64);
      const existingByHash = await this.voucherRepository.findByImageHash(imageHash);
      if (existingByHash) {
        isDuplicate = true;
        duplicateVoucherId = existingByHash.id;
        errors.push('Esta imagen ya ha sido registrada anteriormente');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      isDuplicate,
      duplicateVoucherId
    };
  }

  // RF-2: Registrar comprobante de pago
  async createVoucher(data: CreateVoucherDTO): Promise<{ voucher: PaymentVoucher; validation: VoucherValidationResult }> {
    // Primero validar
    const validation = await this.validateVoucher(data);

    if (!validation.valid) {
      throw new Error(validation.errors.join('. '));
    }

    const imageHash = this.generateImageHash(data.imageBase64);
    const now = new Date();

    const voucher = new PaymentVoucher(
      crypto.randomUUID(),
      '',  // paymentId se asignará después de validar
      data.userId,
      data.creditId,
      data.voucherNumber,
      data.amount,
      new Date(data.paymentDate),
      data.voucherType,
      data.bankName || null,
      data.accountNumber || null,
      data.payerName || null,
      data.beneficiaryName || null,
      data.imageBase64,  // En producción, guardar en storage y usar URL
      imageHash,
      VoucherStatus.PENDING,
      null,
      null,
      null,
      now,
      now
    );

    await this.voucherRepository.save(voucher);

    return { voucher, validation };
  }

  // Obtener comprobantes del usuario
  async getVouchersByUserId(userId: string): Promise<PaymentVoucher[]> {
    return this.voucherRepository.findByUserId(userId);
  }

  // Obtener comprobantes de un crédito
  async getVouchersByCreditId(creditId: string): Promise<PaymentVoucher[]> {
    return this.voucherRepository.findByCreditId(creditId);
  }

  // Obtener comprobantes pendientes (para asistentes/gerentes)
  async getPendingVouchers(): Promise<PaymentVoucher[]> {
    return this.voucherRepository.findPending();
  }

  // Obtener todos los comprobantes
  async getAllVouchers(): Promise<PaymentVoucher[]> {
    return this.voucherRepository.findAll();
  }

  // Obtener comprobante por ID
  async getVoucherById(id: string): Promise<PaymentVoucher | null> {
    return this.voucherRepository.findById(id);
  }

  // Validar comprobante (aprobar)
  async approveVoucher(voucherId: string, validatedBy: string, notes?: string): Promise<PaymentVoucher> {
    const voucher = await this.voucherRepository.findById(voucherId);
    if (!voucher) {
      throw new Error('Comprobante no encontrado');
    }

    if (voucher.status !== VoucherStatus.PENDING) {
      throw new Error('El comprobante ya fue procesado');
    }

    voucher.markAsValidated(validatedBy, notes);
    await this.voucherRepository.update(voucher);

    return voucher;
  }

  // Rechazar comprobante
  async rejectVoucher(voucherId: string, validatedBy: string, reason: string): Promise<PaymentVoucher> {
    const voucher = await this.voucherRepository.findById(voucherId);
    if (!voucher) {
      throw new Error('Comprobante no encontrado');
    }

    if (voucher.status !== VoucherStatus.PENDING) {
      throw new Error('El comprobante ya fue procesado');
    }

    if (!reason || reason.trim() === '') {
      throw new Error('Debe proporcionar una razón para el rechazo');
    }

    voucher.markAsRejected(validatedBy, reason);
    await this.voucherRepository.update(voucher);

    return voucher;
  }

  // Eliminar comprobante
  async deleteVoucher(id: string): Promise<void> {
    await this.voucherRepository.delete(id);
  }
}
