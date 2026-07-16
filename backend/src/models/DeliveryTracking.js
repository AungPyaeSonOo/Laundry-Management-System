const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeliveryTracking = sequelize.define('DeliveryTracking', {
    delivery_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'laundry_orders',
            key: 'order_id'
        }
    },
    delivery_person_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    pickup_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivery_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20), // ✅ Changed from ENUM to STRING
        defaultValue: 'scheduled'
    },
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'delivery_tracking',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = DeliveryTracking;