"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class Report extends sequelize_1.Model {
    }
    Report.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            field: 'user_id',
        },
        title: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.Sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
        },
    }, {
        sequelize,
        modelName: 'Report',
        tableName: 'reports',
        timestamps: false,
    });
    return Report;
};
