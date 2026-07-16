const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Employee = sequelize.define('Employee', {
    employee_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    employee_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    position: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'washer',
        validate: {
            isIn: [['washer', 'ironer', 'packer', 'delivery', 'manager']]
        }
    },
    salary_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'fixed',
        validate: {
            isIn: [['fixed', 'hourly', 'daily']]
        }
    },
    salary_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    termination_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Employee;