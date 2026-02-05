import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class PaymentVoucherModel extends Model {}

PaymentVoucherModel.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    paymentId: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payment_id',
    },
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'user_id',
    },
    creditId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'credit_id',
    },
    voucherNumber: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'voucher_number',
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'payment_date',
    },
    voucherType: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'transfer',
      field: 'voucher_type',
    },
    bankName: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'bank_name',
    },
    accountNumber: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'account_number',
    },
    payerName: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payer_name',
    },
    beneficiaryName: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'beneficiary_name',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'image_url',
    },
    imageHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'image_hash',
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pending',
    },
    validationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'validation_notes',
    },
    validatedBy: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'validated_by',
    },
    validatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'validated_at',
    },
  },
  {
    sequelize,
    modelName: 'PaymentVoucher',
    tableName: 'PaymentVoucher',
    timestamps: true,
  }
);

export default PaymentVoucherModel;
