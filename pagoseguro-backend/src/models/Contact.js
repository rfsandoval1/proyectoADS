"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class Contact extends sequelize_1.Model {
        static associate(models) {
            // Define relationships here
            Contact.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }
    Contact.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['active', 'inactive']], // Only allow specific values
            },
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at',
        },
    }, {
        sequelize,
        modelName: 'Contact',
        tableName: 'contacts',
        timestamps: true, // Enable timestamps
    });
    return Contact;
};
