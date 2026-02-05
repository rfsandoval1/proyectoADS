
import { ICreditRepository } from '../lib/interfaces/creditRepository';
import { Credit, CreditStatus } from '../models/Credit';

export class CreditService {
  constructor(private readonly creditRepository: ICreditRepository) {}

  async getCreditsByUserId(userId: string): Promise<Credit[]> {
    return this.creditRepository.findByUserId(userId);
  }

  async listCredits(): Promise<Credit[]> {
    return this.creditRepository.findAll();
  }

  async getCreditById(id: string): Promise<Credit | null> {
    return this.creditRepository.findById(id);
  }

  async createCredit(data: { userId: string; amount: number; term?: number; interestRate?: number; description?: string }): Promise<Credit> {
    const credit = new Credit(
      crypto.randomUUID(),
      data.userId,
      data.amount,
      CreditStatus.ACTIVE,
      new Date(),
      new Date(),
      data.term || 12,
      data.interestRate || 12,
      data.description || ''
    );
    await this.creditRepository.save(credit);
    return credit;
  }

  async updateCredit(id: string, data: Partial<Credit>): Promise<Credit> {
    const credit = await this.creditRepository.findById(id);
    if (!credit) throw new Error('Crédito no encontrado');
    if (data.amount !== undefined) credit.amount = data.amount;
    if (data.status !== undefined) credit.status = data.status;
    credit.updatedAt = new Date();
    await this.creditRepository.update(credit);
    return credit;
  }

  async deleteCredit(id: string): Promise<void> {
    await this.creditRepository.delete(id);
  }
}
