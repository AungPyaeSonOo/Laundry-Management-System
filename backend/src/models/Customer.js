const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
    customer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    loyalty_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Customer;