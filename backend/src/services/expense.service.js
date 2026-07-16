const { Expense, ExpenseCategory, User } = require('../models');
const { Op } = require('sequelize');

class ExpenseService {
    // Get all expenses with filters
    static async getAllExpenses(filters = {}) {
        const {
            category_id,
            start_date,
            end_date,
            status,
            page = 1,
            limit = 10
        } = filters;

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
                { model: ExpenseCategory },
                { model: User, attributes: { exclude: ['password_hash'] } }
            ],
            order: [['expense_date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalAmount = rows.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

        return {
            expenses: rows,
            total: count,
            totalAmount,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    // Get expense by ID
    static async getExpenseById(expenseId) {
        const expense = await Expense.findByPk(expenseId, {
            include: [
                { model: ExpenseCategory },
                { model: User, attributes: { exclude: ['password_hash'] } }
            ]
        });

        if (!expense) {
            throw new Error('Expense not found');
        }

        return expense;
    }

    // Create new expense
    static async createExpense(data, userId) {
        const {
            expense_category_id,
            amount,
            description,
            expense_date,
            reference_no,
            receipt_image,
            status
        } = data;

        const expense = await Expense.create({
            expense_category_id,
            user_id: userId,
            amount,
            description,
            expense_date: expense_date || new Date(),
            reference_no: reference_no || null,
            receipt_image: receipt_image || null,
            status: status || 'pending'
        });

        return await this.getExpenseById(expense.expense_id);
    }

    // Update expense
    static async updateExpense(expenseId, data) {
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            throw new Error('Expense not found');
        }

        const {
            expense_category_id,
            amount,
            description,
            expense_date,
            reference_no,
            receipt_image,
            status
        } = data;

        await expense.update({
            expense_category_id: expense_category_id || expense.expense_category_id,
            amount: amount || expense.amount,
            description: description || expense.description,
            expense_date: expense_date || expense.expense_date,
            reference_no: reference_no || expense.reference_no,
            receipt_image: receipt_image || expense.receipt_image,
            status: status || expense.status
        });

        return await this.getExpenseById(expenseId);
    }

    // Delete expense
    static async deleteExpense(expenseId) {
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            throw new Error('Expense not found');
        }

        await expense.destroy();
        return { message: 'Expense deleted successfully' };
    }

    // Get expense categories
    static async getExpenseCategories() {
        const categories = await ExpenseCategory.findAll({
            where: { is_active: true },
            order: [['category_name', 'ASC']]
        });

        return categories;
    }

    // Get expense summary by category
    static async getExpenseSummary(startDate = null, endDate = null) {
        const where = {};
        if (startDate && endDate) {
            where.expense_date = {
                [Op.between]: [startDate, endDate]
            };
        }

        const summary = await Expense.findAll({
            attributes: [
                'expense_category_id',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
                [sequelize.fn('COUNT', sequelize.col('expense_id')), 'count']
            ],
            where,
            include: [{ model: ExpenseCategory }],
            group: ['expense_category_id', 'ExpenseCategory.expense_category_id']
        });

        return summary;
    }

    // Get expense statistics
    static async getExpenseStats() {
        const totalExpenses = await Expense.sum('amount', {
            where: { status: 'approved' }
        });

        const pendingExpenses = await Expense.sum('amount', {
            where: { status: 'pending' }
        });

        const expenseCount = await Expense.count({
            where: { status: 'approved' }
        });

        // Monthly expenses
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyExpenses = await Expense.sum('amount', {
            where: {
                expense_date: {
                    [Op.gte]: startOfMonth
                },
                status: 'approved'
            }
        });

        return {
            total_expenses: totalExpenses || 0,
            pending_expenses: pendingExpenses || 0,
            monthly_expenses: monthlyExpenses || 0,
            expense_count: expenseCount || 0
        };
    }
}

module.exports = ExpenseService;