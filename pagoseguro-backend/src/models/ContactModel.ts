import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

class ContactModel extends Model {}

ContactModel.init(
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
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    timestamps: false,
  }
);

export default ContactModel;
