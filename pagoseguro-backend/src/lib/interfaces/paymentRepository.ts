import { Payment } from '../../models/Payment';

export interface IPaymentRepository {
  findRecentByClientId(clientId: string): Promise<Payment[]>;
  findRecentByUserId(userId: string): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findByCreditId(creditId: string): Promise<Payment[]>;
  findByUserId(userId: string): Promise<Payment[]>;
  findAll(): Promise<Payment[]>;
  update(payment: Payment): Promise<void>;
  delete(id: string): Promise<void>;
}
