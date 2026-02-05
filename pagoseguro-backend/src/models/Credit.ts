export enum CreditStatus {
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export class Credit {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public amount: number,
    public status: CreditStatus,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public term: number = 12,
    public interestRate: number = 12,
    public description: string = ''
  ) {}
}

export default Credit;
