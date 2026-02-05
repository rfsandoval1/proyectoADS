import { PaymentVoucher, VoucherStatus, VoucherType } from '../models/PaymentVoucher';
import PaymentVoucherModel from '../models/PaymentVoucherModel';

export interface IPaymentVoucherRepository {
  save(voucher: PaymentVoucher): Promise<void>;
  findById(id: string): Promise<PaymentVoucher | null>;
  findByUserId(userId: string): Promise<PaymentVoucher[]>;
  findByCreditId(creditId: string): Promise<PaymentVoucher[]>;
  findByVoucherNumber(voucherNumber: string): Promise<PaymentVoucher | null>;
  findByImageHash(imageHash: string): Promise<PaymentVoucher | null>;
  findAll(): Promise<PaymentVoucher[]>;
  findPending(): Promise<PaymentVoucher[]>;
  update(voucher: PaymentVoucher): Promise<void>;
  delete(id: string): Promise<void>;
}

export class PostgresPaymentVoucherRepository implements IPaymentVoucherRepository {
  private mapToEntity(model: any): PaymentVoucher {
    return new PaymentVoucher(
      model.id,
      model.paymentId,
      model.userId,
      model.creditId,
      model.voucherNumber,
      model.amount,
      new Date(model.paymentDate),
      model.voucherType as VoucherType,
      model.bankName,
      model.accountNumber,
      model.payerName,
      model.beneficiaryName,
      model.imageUrl,
      model.imageHash,
      model.status as VoucherStatus,
      model.validationNotes,
      model.validatedBy,
      model.validatedAt ? new Date(model.validatedAt) : null,
      new Date(model.createdAt),
      new Date(model.updatedAt)
    );
  }

  async save(voucher: PaymentVoucher): Promise<void> {
    await PaymentVoucherModel.create({
      id: voucher.id,
      paymentId: voucher.paymentId,
      userId: voucher.userId,
      creditId: voucher.creditId,
      voucherNumber: voucher.voucherNumber,
      amount: voucher.amount,
      paymentDate: voucher.paymentDate,
      voucherType: voucher.voucherType,
      bankName: voucher.bankName,
      accountNumber: voucher.accountNumber,
      payerName: voucher.payerName,
      beneficiaryName: voucher.beneficiaryName,
      imageUrl: voucher.imageUrl,
      imageHash: voucher.imageHash,
      status: voucher.status,
      validationNotes: voucher.validationNotes,
      validatedBy: voucher.validatedBy,
      validatedAt: voucher.validatedAt,
    });
  }

  async findById(id: string): Promise<PaymentVoucher | null> {
    const model = await PaymentVoucherModel.findByPk(id);
    return model ? this.mapToEntity(model) : null;
  }

  async findByUserId(userId: string): Promise<PaymentVoucher[]> {
    const models = await PaymentVoucherModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    return models.map(m => this.mapToEntity(m));
  }

  async findByCreditId(creditId: string): Promise<PaymentVoucher[]> {
    const models = await PaymentVoucherModel.findAll({
      where: { creditId },
      order: [['createdAt', 'DESC']],
    });
    return models.map(m => this.mapToEntity(m));
  }

  async findByVoucherNumber(voucherNumber: string): Promise<PaymentVoucher | null> {
    const model = await PaymentVoucherModel.findOne({
      where: { voucherNumber },
    });
    return model ? this.mapToEntity(model) : null;
  }

  async findByImageHash(imageHash: string): Promise<PaymentVoucher | null> {
    const model = await PaymentVoucherModel.findOne({
      where: { imageHash },
    });
    return model ? this.mapToEntity(model) : null;
  }

  async findAll(): Promise<PaymentVoucher[]> {
    const models = await PaymentVoucherModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return models.map(m => this.mapToEntity(m));
  }

  async findPending(): Promise<PaymentVoucher[]> {
    const models = await PaymentVoucherModel.findAll({
      where: { status: VoucherStatus.PENDING },
      order: [['createdAt', 'ASC']],
    });
    return models.map(m => this.mapToEntity(m));
  }

  async update(voucher: PaymentVoucher): Promise<void> {
    await PaymentVoucherModel.update(
      {
        paymentId: voucher.paymentId,
        voucherNumber: voucher.voucherNumber,
        amount: voucher.amount,
        paymentDate: voucher.paymentDate,
        voucherType: voucher.voucherType,
        bankName: voucher.bankName,
        accountNumber: voucher.accountNumber,
        payerName: voucher.payerName,
        beneficiaryName: voucher.beneficiaryName,
        imageUrl: voucher.imageUrl,
        imageHash: voucher.imageHash,
        status: voucher.status,
        validationNotes: voucher.validationNotes,
        validatedBy: voucher.validatedBy,
        validatedAt: voucher.validatedAt,
        updatedAt: voucher.updatedAt,
      },
      { where: { id: voucher.id } }
    );
  }

  async delete(id: string): Promise<void> {
    await PaymentVoucherModel.destroy({ where: { id } });
  }
}
