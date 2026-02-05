import { ICreditRepository } from '../lib/interfaces/creditRepository';
import { Credit, CreditStatus } from '../models/Credit';
import CreditModel from '../models/CreditModel';

export class PostgresCreditRepository implements ICreditRepository {
  constructor(private readonly _sequelize?: any) {}

  async save(credit: Credit): Promise<void> {
    await CreditModel.create({
      id: credit.id,
      userId: credit.userId,
      amount: credit.amount,
      status: credit.status,
      range: this.calculateRange(credit.amount),
    });
  }

  async findById(id: string): Promise<Credit | null> {
    const data = await CreditModel.findByPk(id);
    if (!data) return null;
    return new Credit(
      data.get('id') as string,
      data.get('userId') as string,
      Number(data.get('amount')),
      data.get('status') as CreditStatus,
      data.get('createdAt') as Date,
      data.get('updatedAt') as Date
    );
  }

  async findByUserId(userId: string): Promise<Credit[]> {
    const credits = await CreditModel.findAll({ where: { userId } });
    return credits.map((c: any) => new Credit(
      c.get('id'),
      c.get('userId'),
      Number(c.get('amount')),
      c.get('status') as CreditStatus,
      c.get('createdAt'),
      c.get('updatedAt')
    ));
  }

  async findAll(): Promise<Credit[]> {
    const credits = await CreditModel.findAll();
    return credits.map((c: any) => new Credit(
      c.get('id'),
      c.get('userId'),
      Number(c.get('amount')),
      c.get('status') as CreditStatus,
      c.get('createdAt'),
      c.get('updatedAt')
    ));
  }

  async update(credit: Credit): Promise<void> {
    await CreditModel.update(
      {
        amount: credit.amount,
        status: credit.status,
        range: this.calculateRange(credit.amount),
      },
      { where: { id: credit.id } }
    );
  }

  async delete(id: string): Promise<void> {
    await CreditModel.destroy({ where: { id } });
  }

  private calculateRange(amount: number): string {
    if (amount < 1000) return '0-1000';
    if (amount < 5000) return '1000-5000';
    if (amount < 10000) return '5000-10000';
    if (amount < 50000) return '10000-50000';
    return '50000+';
  }
}
