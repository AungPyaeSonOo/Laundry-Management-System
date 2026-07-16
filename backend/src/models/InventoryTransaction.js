const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
    transaction_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    inventory_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'inventory',
            key: 'inventory_id'
        }
    },
    transaction_type: {
        type: DataTypes.ENUM('in', 'out', 'adjustment'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    order_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'laundry_orders',
            key: 'order_id'
        }
    },
    expense_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'expenses',
            key: 'expense_id'
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
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'inventory_transactions',
    timestamps: true,
    createdAt: 'transaction_date',
    updatedAt: false
});

module.exports = InventoryTransaction;