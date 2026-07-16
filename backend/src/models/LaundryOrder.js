const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LaundryOrder = sequelize.define('LaundryOrder', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'customer_id'
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
    order_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    pickup_date: {
        type: DataTypes.DATEONLY
    },
    delivery_date: {
        type: DataTypes.DATEONLY
    },
    total_weight: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    paid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(20), // ✅ Changed from ENUM to STRING
        defaultValue: 'pending'
    },
    payment_status: {
        type: DataTypes.STRING(20), // ✅ Changed from ENUM to STRING
        defaultValue: 'unpaid'
    },
    payment_method: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    payment_reference: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    payment_collected_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    payment_collected_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    payment_verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    payment_verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    payment_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'laundry_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = LaundryOrder;