const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Expense = sequelize.define('Expense', {
    expense_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    expense_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'expense_categories',
            key: 'expense_category_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reference_no: {
        type: DataTypes.STRING(50)
    },
    receipt_image: {
        type: DataTypes.STRING(255)
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'expenses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Expense;