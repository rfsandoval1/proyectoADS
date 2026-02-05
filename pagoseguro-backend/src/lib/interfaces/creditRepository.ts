import { Credit } from '../../models/Credit';

export interface ICreditRepository {
  save(credit: Credit): Promise<void>;
  findById(id: string): Promise<Credit | null>;
  findByUserId(userId: string): Promise<Credit[]>;
  findAll(): Promise<Credit[]>;
  update(credit: Credit): Promise<void>;
  delete(id: string): Promise<void>;
}
