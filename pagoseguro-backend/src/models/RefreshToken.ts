import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../config/sequelize';

class RefreshToken extends Model {}

RefreshToken.init(
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'user_id',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: false,
  }
);

export default RefreshToken;
