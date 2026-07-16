const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

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
    // ✅ LATITUDE (တောင်လတ္တီတွဒ်)
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    // ✅ LONGITUDE (လောင်ဂျီတွဒ်)
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
        type: DataTypes.ENUM('scheduled', 'picked_up', 'in_transit', 'delivered', 'failed'),
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