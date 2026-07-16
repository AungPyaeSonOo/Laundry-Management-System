const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

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
        type: DataTypes.ENUM('pending', 'collected', 'washing', 'ironing', 'ready', 'delivered', 'payment_pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    payment_status: {
        type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
        defaultValue: 'unpaid'
    },
    // ✅ Payment Fields for Delivery Collection
    payment_method: {
        type: DataTypes.ENUM('cash', 'kpay', 'wave_pay', 'bank_transfer'),
        allowNull: true
    },
    payment_reference: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    payment_collected_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Delivery person who collected payment'
    },
    payment_collected_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    payment_verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Admin/Manager/Accountant who verified payment'
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