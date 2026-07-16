const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
    expense_category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'expense_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ExpenseCategory;