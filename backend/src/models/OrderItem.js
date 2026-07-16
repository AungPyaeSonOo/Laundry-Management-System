const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    item_id: {
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
    clothing_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clothing_types',
            key: 'clothing_type_id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = OrderItem;