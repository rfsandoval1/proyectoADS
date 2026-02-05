import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
  class Contact extends Model {
    static associate(models: any) {
      // Define relationships here
      Contact.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Contact.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['active', 'inactive']], // Only allow specific values
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'Contact',
      tableName: 'contacts',
      timestamps: true, // Enable timestamps
    }
  );

  return Contact;
};