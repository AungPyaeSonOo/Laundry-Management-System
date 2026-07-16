const { body, param, query } = require('express-validator');

// ==================== Auth Validations ====================
const registerValidation = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscore'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase, one lowercase and one number'),
    
    body('full_name')
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 100 }).withMessage('Full name must be less than 100 characters'),
    
    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format'),
    
    body('role')
        .optional()
        .isIn(['admin', 'accountant', 'employee', 'delivery']).withMessage('Invalid role')
];

const loginValidation = [
    body('username')
        .notEmpty().withMessage('Username is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

// ==================== Customer Validations ====================
const createCustomerValidation = [
    body('name')
        .notEmpty().withMessage('Customer name is required')
        .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format'),
    
    body('email')
        .optional()
        .isEmail().withMessage('Valid email is required'),
    
    body('address')
        .optional()
        .isLength({ max: 500 }).withMessage('Address must be less than 500 characters')
];

const updateCustomerValidation = [
    param('id')
        .isInt().withMessage('Invalid customer ID'),
    
    body('name')
        .optional()
        .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
    
    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format'),
    
    body('email')
        .optional()
        .isEmail().withMessage('Valid email is required'),
    
    body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be boolean')
];

// ==================== Order Validations ====================
const createOrderValidation = [
    body('customer_id')
        .notEmpty().withMessage('Customer ID is required')
        .isInt().withMessage('Customer ID must be an integer'),
    
    body('items')
        .notEmpty().withMessage('Items are required')
        .isArray({ min: 1 }).withMessage('At least one item is required'),
    
    body('items.*.clothing_type_id')
        .notEmpty().withMessage('Clothing type ID is required')
        .isInt().withMessage('Clothing type ID must be an integer'),
    
    body('items.*.quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    
    body('items.*.unit_price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
    
    body('items.*.notes')
        .optional()
        .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
    
    body('pickup_date')
        .optional()
        .isDate().withMessage('Invalid pickup date'),
    
    body('delivery_date')
        .optional()
        .isDate().withMessage('Invalid delivery date'),
    
    body('discount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Discount must be a positive number'),
    
    body('notes')
        .optional()
        .isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
];

const updateOrderStatusValidation = [
    param('id')
        .isInt().withMessage('Invalid order ID'),
    
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['pending', 'collected', 'washing', 'ironing', 'ready', 'delivered', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
    
    body('notes')
        .optional()
        .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const updatePaymentValidation = [
    param('id')
        .isInt().withMessage('Invalid order ID'),
    
    body('paid_amount')
        .notEmpty().withMessage('Paid amount is required')
        .isFloat({ min: 0 }).withMessage('Paid amount must be a positive number')
];

// ==================== Employee Validations ====================
const createEmployeeValidation = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('full_name')
        .notEmpty().withMessage('Full name is required'),
    
    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format'),
    
    body('position')
        .notEmpty().withMessage('Position is required')
        .isIn(['washer', 'ironer', 'packer', 'delivery', 'manager']).withMessage('Invalid position'),
    
    body('salary_type')
        .optional()
        .isIn(['fixed', 'hourly', 'daily']).withMessage('Invalid salary type'),
    
    body('salary_amount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Salary amount must be a positive number'),
    
    body('hire_date')
        .optional()
        .isDate().withMessage('Invalid hire date')
];

// ==================== Expense Validations ====================
const createExpenseValidation = [
    body('expense_category_id')
        .notEmpty().withMessage('Expense category ID is required')
        .isInt().withMessage('Expense category ID must be an integer'),
    
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    
    body('expense_date')
        .optional()
        .isDate().withMessage('Invalid expense date'),
    
    body('reference_no')
        .optional()
        .isLength({ max: 50 }).withMessage('Reference number must be less than 50 characters'),
    
    body('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
];

// ==================== Inventory Validations ====================
const createInventoryValidation = [
    body('item_name')
        .notEmpty().withMessage('Item name is required')
        .isLength({ max: 100 }).withMessage('Item name must be less than 100 characters'),
    
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['detergent', 'fabric_softener', 'bleach', 'stain_remover', 'packaging', 'spare_part', 'other'])
        .withMessage('Invalid category'),
    
    body('quantity')
        .optional()
        .isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    
    body('unit')
        .notEmpty().withMessage('Unit is required')
        .isLength({ max: 20 }).withMessage('Unit must be less than 20 characters'),
    
    body('unit_price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
    
    body('reorder_level')
        .optional()
        .isFloat({ min: 0 }).withMessage('Reorder level must be a positive number'),
    
    body('expiry_date')
        .optional()
        .isDate().withMessage('Invalid expiry date'),
    
    body('supplier')
        .optional()
        .isLength({ max: 100 }).withMessage('Supplier must be less than 100 characters')
];

const adjustInventoryValidation = [
    param('id')
        .isInt().withMessage('Invalid inventory ID'),
    
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    
    body('adjustment_type')
        .notEmpty().withMessage('Adjustment type is required')
        .isIn(['add', 'subtract']).withMessage('Invalid adjustment type'),
    
    body('notes')
        .optional()
        .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// ==================== Report Validations ====================
const reportQueryValidation = [
    query('start_date')
        .optional()
        .isDate().withMessage('Invalid start date'),
    
    query('end_date')
        .optional()
        .isDate().withMessage('Invalid end date'),
    
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ==================== Common Validations ====================
const idParamValidation = [
    param('id')
        .isInt().withMessage('Invalid ID format')
];

const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Export all validations
module.exports = {
    // Auth
    registerValidation,
    loginValidation,
    
    // Customer
    createCustomerValidation,
    updateCustomerValidation,
    
    // Order
    createOrderValidation,
    updateOrderStatusValidation,
    updatePaymentValidation,
    
    // Employee
    createEmployeeValidation,
    
    // Expense
    createExpenseValidation,
    
    // Inventory
    createInventoryValidation,
    adjustInventoryValidation,
    
    // Report
    reportQueryValidation,
    
    // Common
    idParamValidation,
    paginationValidation
};