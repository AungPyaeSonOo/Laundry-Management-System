const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MachineMaintenance = sequelize.define('MachineMaintenance', {
    maintenance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    machine_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    maintenance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    maintenance_type: {
        type: DataTypes.STRING(20), // ✅ Changed from ENUM to STRING
        allowNull: false
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    performed_by: {
        type: DataTypes.STRING(100)
    },
    next_maintenance_date: {
        type: DataTypes.DATEONLY
    },
    expense_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'expenses',
            key: 'expense_id'
        }
    }
}, {
    tableName: 'machine_maintenance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = MachineMaintenance;