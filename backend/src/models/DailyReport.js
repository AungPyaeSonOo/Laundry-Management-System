const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const DailyReport = sequelize.define('DailyReport', {
    report_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    report_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
    },
    total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_income: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total_expenses: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    net_profit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total_items_processed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'daily_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = DailyReport;