import { IPaymentRepository } from '../lib/interfaces/paymentRepository';
import { Payment, PaymentStatus } from '../models/Payment';
import PaymentModel from '../models/PaymentModel';

export class PostgresPaymentRepository implements IPaymentRepository {
  constructor(private readonly _sequelize?: any) {}

  async save(payment: Payment): Promise<void> {
    await PaymentModel.create({
      id: payment.id,
      creditId: payment.creditId,
      userId: payment.userId,
      amount: payment.amount,
      status: payment.status,
      month: this.getMonthString(payment.createdAt),
      paymentMethod: payment.paymentMethod || null,
      paidDate: payment.paidDate || null,
    });
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await PaymentModel.findByPk(id);
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByCreditId(creditId: string): Promise<Payment[]> {
    const rows = await PaymentModel.findAll({ where: { creditId } });
    return rows.map((r: any) => this.toEntity(r));
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const rows = await PaymentModel.findAll({ where: { userId } });
    return rows.map((r: any) => this.toEntity(r));
  }

  async findAll(): Promise<Payment[]> {
    const rows = await PaymentModel.findAll();
    return rows.map((r: any) => this.toEntity(r));
  }

  async update(payment: Payment): Promise<void> {
    await PaymentModel.update(
      {
        amount: payment.amount,
        status: payment.status,
      },
      { where: { id: payment.id } }
    );
  }

  async delete(id: string): Promise<void> {
    await PaymentModel.destroy({ where: { id } });
  }

  async findRecentByClientId(clientId: string): Promise<Payment[]> {
    const rows = await PaymentModel.findAll({
      where: { userId: clientId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    return rows.map((r: any) => this.toEntity(r));
  }

  async findRecentByUserId(userId: string): Promise<Payment[]> {
    const rows = await PaymentModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    return rows.map((r: any) => this.toEntity(r));
  }

  private toEntity(row: any): Payment {
    return new Payment(
      row.get('id') as string,
      row.get('creditId') as string,
      row.get('userId') as string,
      Number(row.get('amount')),
      row.get('status') as PaymentStatus,
      row.get('createdAt') as Date,
      row.get('updatedAt') as Date,
      row.get('paymentMethod') as string | undefined,
      row.get('paidDate') as Date | undefined
    );
  }

  private getMonthString(date: Date): string {
    return date.toLocaleString('default', { month: 'long' });
  }
}
