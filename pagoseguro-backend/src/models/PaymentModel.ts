import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class PaymentModel extends Model {}

PaymentModel.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    creditId: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'PENDING',
    },
    month: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'January',
    },
    paymentMethod: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidDate: {
      type: DataTypes.DATE,
      field: 'paid_date',
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payment',
    timestamps: true,
  }
);

export default PaymentModel;
