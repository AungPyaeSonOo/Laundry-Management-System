const { Expense, ExpenseCategory, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const { 
            category_id, 
            start_date, 
            end_date, 
            status,
            page = 1, 
            limit = 10 
        } = req.query;
        
        const offset = (page - 1) * limit;
        const where = {};

        if (category_id) where.expense_category_id = category_id;
        if (status) where.status = status;
        if (start_date && end_date) {
            where.expense_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        const { count, rows } = await Expense.findAndCountAll({
            where,
            include: [
                { 
                    model: ExpenseCategory,
                    as: 'category'  // ✅ models/index.js မှာ သတ်မှတ်ထားတဲ့ as
                },
                { 
                    model: User,
                    as: 'user',  // ✅ models/index.js မှာ သတ်မှတ်ထားတဲ့ as
                    attributes: { exclude: ['password_hash'] } 
                }
            ],
            order: [['expense_date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalAmount = rows.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

        return successResponse(res, {
            expenses: rows,
            total: count,
            totalAmount,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Expenses fetched successfully');
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return errorResponse(res, error.message);
    }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByPk(id, {
            include: [
                { 
                    model: ExpenseCategory,
                    as: 'category'
                },
                { 
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password_hash'] } 
                }
            ]
        });

        if (!expense) {
            return errorResponse(res, 'Expense not found', 404);
        }

        return successResponse(res, expense, 'Expense fetched successfully');
    } catch (error) {
        console.error('Error fetching expense:', error);
        return errorResponse(res, error.message);
    }
};

// Create new expense
exports.createExpense = async (req, res) => {
    try {
        const {
            expense_category_id,
            amount,
            description,
            expense_date,
            reference_no,
            receipt_image,
            status
        } = req.body;

        console.log('📝 Creating expense:', { expense_category_id, amount, description });

        const expense = await Expense.create({
            expense_category_id,
            user_id: req.userId,
            amount,
            description,
            expense_date: expense_date || new Date(),
            reference_no: reference_no || null,
            receipt_image: receipt_image || null,
            status: status || 'pending'
        });

        const result = await Expense.findByPk(expense.expense_id, {
            include: [
                { 
                    model: ExpenseCategory,
                    as: 'category'
                },
                { 
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password_hash'] } 
                }
            ]
        });

        return successResponse(res, result, 'Expense created successfully', 201);
    } catch (error) {
        console.error('Error creating expense:', error);
        return errorResponse(res, error.message);
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            expense_category_id,
            amount,
            description,
            expense_date,
            reference_no,
            receipt_image,
            status
        } = req.body;

        const expense = await Expense.findByPk(id);
        if (!expense) {
            return errorResponse(res, 'Expense not found', 404);
        }

        await expense.update({
            expense_category_id: expense_category_id || expense.expense_category_id,
            amount: amount || expense.amount,
            description: description || expense.description,
            expense_date: expense_date || expense.expense_date,
            reference_no: reference_no || expense.reference_no,
            receipt_image: receipt_image || expense.receipt_image,
            status: status || expense.status
        });

        const updatedExpense = await Expense.findByPk(id, {
            include: [
                { 
                    model: ExpenseCategory,
                    as: 'category'
                },
                { 
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password_hash'] } 
                }
            ]
        });

        return successResponse(res, updatedExpense, 'Expense updated successfully');
    } catch (error) {
        console.error('Error updating expense:', error);
        return errorResponse(res, error.message);
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByPk(id);
        if (!expense) {
            return errorResponse(res, 'Expense not found', 404);
        }

        await expense.destroy();
        return successResponse(res, null, 'Expense deleted successfully');
    } catch (error) {
        console.error('Error deleting expense:', error);
        return errorResponse(res, error.message);
    }
};

// Get expense categories
exports.getExpenseCategories = async (req, res) => {
    try {
        const categories = await ExpenseCategory.findAll({
            where: { is_active: true },
            order: [['category_name', 'ASC']]
        });

        return successResponse(res, categories, 'Expense categories fetched successfully');
    } catch (error) {
        console.error('Error fetching categories:', error);
        return errorResponse(res, error.message);
    }
};

// Get expense summary by category
exports.getExpenseSummary = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const where = {};

        if (start_date && end_date) {
            where.expense_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        const summary = await Expense.findAll({
            attributes: [
                'expense_category_id',
                [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total_amount'],
                [require('sequelize').fn('COUNT', require('sequelize').col('expense_id')), 'count']
            ],
            where,
            include: [{ 
                model: ExpenseCategory,
                as: 'category'
            }],
            group: ['expense_category_id', 'category.expense_category_id']
        });

        return successResponse(res, summary, 'Expense summary fetched successfully');
    } catch (error) {
        console.error('Error fetching expense summary:', error);
        return errorResponse(res, error.message);
    }
};

// expense.controller.js ထဲက getExpenseById ကို ပြင်မယ်
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByPk(id, {
            include: [
                { model: ExpenseCategory, as: 'category' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                // ✅ ဒီတစ်ခုကို အသစ်ထည့်မယ် (Expense ကနေ Maintenance တွေကို ပြန်ဆွဲမယ်)
                { 
                    model: MachineMaintenance, 
                    as: 'maintenances' 
                }
            ]
        });

        if (!expense) {
            return errorResponse(res, 'Expense not found', 404);
        }

        return successResponse(res, expense, 'Expense fetched successfully');
    } catch (error) {
        console.error('Error fetching expense:', error);
        return errorResponse(res, error.message);
    }
};
