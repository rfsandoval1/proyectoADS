export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Payment {
  constructor(
    public readonly id: string,
    public readonly creditId: string,
    public readonly userId: string,
    public amount: number,
    public status: PaymentStatus,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public paymentMethod?: string,
    public paidDate?: Date
  ) {}
}
