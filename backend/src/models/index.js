const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Customer = require('./Customer');
const LaundryOrder = require('./LaundryOrder');
const OrderItem = require('./OrderItem');
const ClothingType = require('./ClothingType');
const Employee = require('./Employee');
const Expense = require('./Expense');
const ExpenseCategory = require('./ExpenseCategory');
const Inventory = require('./Inventory');
const InventoryTransaction = require('./InventoryTransaction');
const MachineMaintenance = require('./MachineMaintenance');
const DailyReport = require('./DailyReport');
const OrderStatusHistory = require('./OrderStatusHistory');
const DeliveryTracking = require('./DeliveryTracking');

// Try to load Payment
let Payment = null;
try {
    Payment = require('./Payment');
    console.log('✅ Payment model loaded');
} catch (error) {
    console.log('⚠️ Payment model not found, skipping...');
}

// ==================== Associations ====================

// User - Employee
User.hasOne(Employee, { 
    foreignKey: 'user_id', 
    as: 'employee'
});
Employee.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user'
});

// User - LaundryOrder
User.hasMany(LaundryOrder, { foreignKey: 'user_id', as: 'orders' });
LaundryOrder.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Customer - LaundryOrder
Customer.hasMany(LaundryOrder, { foreignKey: 'customer_id', as: 'orders' });
LaundryOrder.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// LaundryOrder - OrderItem
LaundryOrder.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(LaundryOrder, { foreignKey: 'order_id', as: 'order' });

// OrderItem - ClothingType
OrderItem.belongsTo(ClothingType, { foreignKey: 'clothing_type_id', as: 'clothing_type' });

// User - Expense
User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ExpenseCategory - Expense
ExpenseCategory.hasMany(Expense, { foreignKey: 'expense_category_id', as: 'expenses' });
Expense.belongsTo(ExpenseCategory, { foreignKey: 'expense_category_id', as: 'category' });

// MachineMaintenance - Expense
MachineMaintenance.belongsTo(Expense, {
    foreignKey: 'expense_id',
    as: 'expense'
});
Expense.hasMany(MachineMaintenance, {
    foreignKey: 'expense_id',
    as: 'maintenances'
});

// Inventory - InventoryTransaction
Inventory.hasMany(InventoryTransaction, { foreignKey: 'inventory_id', as: 'transactions' });
InventoryTransaction.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'inventory' });

// User - InventoryTransaction
User.hasMany(InventoryTransaction, { foreignKey: 'user_id', as: 'inventory_transactions' });
InventoryTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// LaundryOrder - InventoryTransaction
LaundryOrder.hasMany(InventoryTransaction, { foreignKey: 'order_id', as: 'inventory_transactions' });
InventoryTransaction.belongsTo(LaundryOrder, { foreignKey: 'order_id', as: 'order' });

// LaundryOrder - OrderStatusHistory
LaundryOrder.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'status_history' });
OrderStatusHistory.belongsTo(LaundryOrder, { foreignKey: 'order_id', as: 'order' });

// User - OrderStatusHistory
User.hasMany(OrderStatusHistory, { foreignKey: 'user_id', as: 'status_histories' });
OrderStatusHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// LaundryOrder - DeliveryTracking
LaundryOrder.hasOne(DeliveryTracking, { foreignKey: 'order_id', as: 'delivery' });
DeliveryTracking.belongsTo(LaundryOrder, { foreignKey: 'order_id', as: 'order' });

// User - DeliveryTracking
User.hasMany(DeliveryTracking, { foreignKey: 'delivery_person_id', as: 'deliveries' });
DeliveryTracking.belongsTo(User, { foreignKey: 'delivery_person_id', as: 'delivery_person' });

// Payment Associations
if (Payment) {
    LaundryOrder.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
    Payment.belongsTo(LaundryOrder, { foreignKey: 'order_id', as: 'order' });
    Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Payment.belongsTo(User, { foreignKey: 'submitted_to', as: 'submitted_to_user' });
    Payment.belongsTo(User, { foreignKey: 'verified_by', as: 'verified_by_user' });
}

module.exports = {
    sequelize,
    User,
    Customer,
    LaundryOrder,
    OrderItem,
    ClothingType,
    Employee,
    Expense,
    ExpenseCategory,
    Inventory,
    InventoryTransaction,
    MachineMaintenance,
    DailyReport,
    OrderStatusHistory,
    DeliveryTracking,
    Payment
};