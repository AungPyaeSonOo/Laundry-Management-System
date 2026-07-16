const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    history_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'laundry_orders',
            key: 'order_id'
        }
    },
    status: {
        type: DataTypes.STRING(20), // ✅ Changed from ENUM to STRING
        allowNull: false
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
    tableName: 'order_status_history',
    timestamps: true,
    createdAt: 'changed_at',
    updatedAt: false
});

module.exports = OrderStatusHistory;