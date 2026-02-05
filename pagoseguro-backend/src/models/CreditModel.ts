import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class CreditModel extends Model {}

CreditModel.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
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
      defaultValue: 'ACTIVE',
    },
    range: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '0-1000',
    },
    term: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 12,
    },
    interestRate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 12,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
  },
  {
    sequelize,
    modelName: 'Credit',
    tableName: 'Credit',
    timestamps: true,
  }
);

export default CreditModel;
