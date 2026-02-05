import { IPaymentRepository } from '../lib/interfaces/paymentRepository';
import { Payment, PaymentStatus } from '../models/Payment';

export class PaymentService {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }

  async listPayments(): Promise<Payment[]> {
    return this.paymentRepository.findAll();
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async createPayment(data: { creditId: string; userId: string; amount: number; paymentMethod?: string }): Promise<Payment> {
    const now = new Date();
    const isPaid = !!data.paymentMethod;
    const payment = new Payment(
      crypto.randomUUID(),
      data.creditId,
      data.userId,
      data.amount,
      isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      now,
      now,
      data.paymentMethod,
      isPaid ? now : undefined
    );
    await this.paymentRepository.save(payment);
    return payment;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new Error('Pago no encontrado');
    if (data.amount !== undefined) payment.amount = data.amount;
    if (data.status !== undefined) payment.status = data.status;
    payment.updatedAt = new Date();
    await this.paymentRepository.update(payment);
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    await this.paymentRepository.delete(id);
  }

  async getRecentPaymentsByClientId(clientId: string): Promise<Payment[]> {
    return this.paymentRepository.findRecentByClientId(clientId);
  }
}
