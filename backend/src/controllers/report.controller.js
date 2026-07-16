const { LaundryOrder, Expense, DailyReport, Customer, User, OrderItem, ClothingType, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');
const moment = require('moment');

// ============================================
// GET DAILY REPORT
// ============================================
exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        const reportDate = date ? new Date(date) : new Date();
        
        console.log('📊 Getting daily report for date:', reportDate);

        const startOfDay = moment(reportDate).startOf('day').toDate();
        const endOfDay = moment(reportDate).endOf('day').toDate();

        // Get orders
        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: ClothingType, as: 'clothing_type' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get expenses
        const expenses = await Expense.findAll({
            where: {
                expense_date: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: 'approved'
            }
        });

        // Calculate totals
        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        const netProfit = totalIncome - totalExpenses;

        // Payment method breakdown
        const cashOrders = orders.filter(o => o.payment_method === 'cash' || !o.payment_method);
        const kpayOrders = orders.filter(o => o.payment_method === 'kpay');
        const waveOrders = orders.filter(o => o.payment_method === 'wave_pay');

        const cashTotal = cashOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
        const kpayTotal = kpayOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
        const waveTotal = waveOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

        const result = {
            period: {
                date: moment(reportDate).format('YYYY-MM-DD'),
                start: startOfDay,
                end: endOfDay
            },
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: netProfit,
                cash: cashTotal,
                kpay: kpayTotal,
                wave: waveTotal
            },
            orders: orders,
            expenses: expenses
        };

        return successResponse(res, result, 'Daily report fetched successfully');
    } catch (error) {
        console.error('❌ Error in getDailyReport:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET WEEKLY REPORT
// ============================================
exports.getWeeklyReport = async (req, res) => {
    try {
        const { week, year } = req.query;
        const currentYear = year || moment().year();
        const currentWeek = week || moment().week();

        console.log('📊 Getting weekly report for week:', currentWeek, 'year:', currentYear);

        const startOfWeek = moment().year(currentYear).week(currentWeek).startOf('week').toDate();
        const endOfWeek = moment().year(currentYear).week(currentWeek).endOf('week').toDate();

        // Get orders
        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfWeek, endOfWeek]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get expenses
        const expenses = await Expense.findAll({
            where: {
                expense_date: {
                    [Op.between]: [startOfWeek, endOfWeek]
                },
                status: 'approved'
            }
        });

        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

        const result = {
            period: {
                week: currentWeek,
                year: currentYear,
                start: moment(startOfWeek).format('YYYY-MM-DD'),
                end: moment(endOfWeek).format('YYYY-MM-DD')
            },
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: totalIncome - totalExpenses
            },
            orders: orders,
            expenses: expenses
        };

        return successResponse(res, result, 'Weekly report fetched successfully');
    } catch (error) {
        console.error('❌ Error in getWeeklyReport:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET MONTHLY REPORT
// ============================================
exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentYear = year || moment().year();
        const currentMonth = month || moment().month() + 1;

        console.log('📊 Getting monthly report for month:', currentMonth, 'year:', currentYear);

        const startOfMonth = moment().year(currentYear).month(currentMonth - 1).startOf('month').toDate();
        const endOfMonth = moment().year(currentYear).month(currentMonth - 1).endOf('month').toDate();

        // Get orders
        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfMonth, endOfMonth]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get expenses
        const expenses = await Expense.findAll({
            where: {
                expense_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                },
                status: 'approved'
            }
        });

        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

        const result = {
            period: {
                month: currentMonth,
                year: currentYear,
                month_name: moment().month(currentMonth - 1).format('MMMM'),
                start: moment(startOfMonth).format('YYYY-MM-DD'),
                end: moment(endOfMonth).format('YYYY-MM-DD')
            },
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: totalIncome - totalExpenses
            },
            orders: orders,
            expenses: expenses
        };

        return successResponse(res, result, 'Monthly report fetched successfully');
    } catch (error) {
        console.error('❌ Error in getMonthlyReport:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET YEARLY REPORT
// ============================================
exports.getYearlyReport = async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year || moment().year();

        console.log('📊 Getting yearly report for year:', currentYear);

        const startOfYear = moment().year(currentYear).startOf('year').toDate();
        const endOfYear = moment().year(currentYear).endOf('year').toDate();

        // Get orders
        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfYear, endOfYear]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get expenses
        const expenses = await Expense.findAll({
            where: {
                expense_date: {
                    [Op.between]: [startOfYear, endOfYear]
                },
                status: 'approved'
            }
        });

        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

        const result = {
            period: {
                year: currentYear,
                start: moment(startOfYear).format('YYYY-MM-DD'),
                end: moment(endOfYear).format('YYYY-MM-DD')
            },
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: totalIncome - totalExpenses
            },
            orders: orders,
            expenses: expenses
        };

        return successResponse(res, result, 'Yearly report fetched successfully');
    } catch (error) {
        console.error('❌ Error in getYearlyReport:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET CUSTOM REPORT
// ============================================
exports.getCustomReport = async (req, res) => {
    try {
        const { start_date, end_date, report_type = 'summary' } = req.query;

        if (!start_date || !end_date) {
            return errorResponse(res, 'Start date and end date are required', 400);
        }

        console.log('📊 Getting custom report from:', start_date, 'to:', end_date);

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        // Get orders
        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } }
            ],
            order: [['created_at', 'DESC']]
        });

        // Get expenses
        const expenses = await Expense.findAll({
            where: {
                expense_date: {
                    [Op.between]: [startDate, endDate]
                },
                status: 'approved'
            }
        });

        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

        const result = {
            period: {
                start: start_date,
                end: end_date
            },
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: totalIncome - totalExpenses
            },
            orders: orders,
            expenses: expenses
        };

        return successResponse(res, result, 'Custom report fetched successfully');
    } catch (error) {
        console.error('❌ Error in getCustomReport:', error);
        return errorResponse(res, error.message);
    }
};