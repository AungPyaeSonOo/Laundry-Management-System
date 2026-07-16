const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
    inventory_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('detergent', 'fabric_softener', 'bleach', 'stain_remover', 'packaging', 'spare_part', 'other'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    reorder_level: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    expiry_date: {
        type: DataTypes.DATEONLY
    },
    supplier: {
        type: DataTypes.STRING(100)
    },
    notes: {
        type: DataTypes.TEXT
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Inventory;