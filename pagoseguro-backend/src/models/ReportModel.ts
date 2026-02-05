import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class ReportModel extends Model {}

ReportModel.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'user_id',
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: DataTypes.TEXT,
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
    timestamps: false,
  }
);

export default ReportModel;
