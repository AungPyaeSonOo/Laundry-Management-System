const { 
    LaundryOrder, 
    Customer, 
    Employee, 
    Expense, 
    Inventory,
    OrderStatusHistory,
    sequelize 
} = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');
const moment = require('moment');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const today = moment().startOf('day').toDate();
        const tomorrow = moment().endOf('day').toDate();
        const startOfWeek = moment().startOf('week').toDate();
        const startOfMonth = moment().startOf('month').toDate();

        // Today's orders
        const todayOrders = await LaundryOrder.count({
            where: {
                created_at: {
                    [Op.between]: [today, tomorrow]
                }
            }
        });

        // Today's income
        const todayIncome = await LaundryOrder.sum('total_price', {
            where: {
                created_at: {
                    [Op.between]: [today, tomorrow]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        }) || 0;

        // Pending orders
        const pendingOrders = await LaundryOrder.count({
            where: {
                status: {
                    [Op.in]: ['pending', 'collected']
                }
            }
        });

        // In progress orders
        const inProgressOrders = await LaundryOrder.count({
            where: {
                status: {
                    [Op.in]: ['washing', 'ironing']
                }
            }
        });

        // Ready for delivery
        const readyOrders = await LaundryOrder.count({
            where: {
                status: 'ready'
            }
        });

        // Total customers
        const totalCustomers = await Customer.count({
            where: { is_active: true }
        });

        // Total employees
        const totalEmployees = await Employee.count({
            where: { is_active: true }
        });

        // Low stock items
        const lowStockItems = await Inventory.count({
            where: {
                is_active: true,
                quantity: {
                    [Op.lte]: sequelize.col('reorder_level')
                }
            }
        });

        // Weekly income
        const weeklyIncome = await LaundryOrder.sum('total_price', {
            where: {
                created_at: {
                    [Op.gte]: startOfWeek
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        }) || 0;

        // Monthly income
        const monthlyIncome = await LaundryOrder.sum('total_price', {
            where: {
                created_at: {
                    [Op.gte]: startOfMonth
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        }) || 0;

        // Monthly expenses
        const monthlyExpenses = await Expense.sum('amount', {
            where: {
                expense_date: {
                    [Op.gte]: startOfMonth
                },
                status: 'approved'
            }
        }) || 0;

        // Recent orders
        const recentOrders = await LaundryOrder.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [
                { 
                    model: Customer,
                    as: 'customer'
                },
                {
                    model: OrderStatusHistory,
                    as: 'status_history',
                    limit: 1,
                    order: [['created_at', 'DESC']]
                }
            ]
        });

        // Recent customers
        const recentCustomers = await Customer.findAll({
            limit: 10,
            order: [['created_at', 'DESC']]
        });

        return successResponse(res, {
            summary: {
                today_orders: todayOrders || 0,
                today_income: todayIncome || 0,
                pending_orders: pendingOrders || 0,
                in_progress_orders: inProgressOrders || 0,
                ready_orders: readyOrders || 0,
                total_customers: totalCustomers || 0,
                total_employees: totalEmployees || 0,
                low_stock_items: lowStockItems || 0,
                weekly_income: weeklyIncome || 0,
                monthly_income: monthlyIncome || 0,
                monthly_expenses: monthlyExpenses || 0,
                monthly_profit: (monthlyIncome || 0) - (monthlyExpenses || 0)
            },
            recent_orders: recentOrders || [],
            recent_customers: recentCustomers || []
        }, 'Dashboard stats fetched successfully');
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return errorResponse(res, error.message);
    }
};

// Get order statistics by status
exports.getOrderStats = async (req, res) => {
    try {
        const statuses = ['pending', 'collected', 'washing', 'ironing', 'ready', 'delivered', 'completed', 'cancelled'];
        const stats = {};

        for (const status of statuses) {
            stats[status] = await LaundryOrder.count({
                where: { status }
            });
        }

        return successResponse(res, stats, 'Order stats fetched successfully');
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return errorResponse(res, error.message);
    }
};

// Get income chart data
exports.getIncomeChartData = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        let startDate;
        let groupFormat;

        if (period === 'week') {
            startDate = moment().subtract(7, 'days').startOf('day').toDate();
            groupFormat = '%Y-%m-%d';
        } else if (period === 'month') {
            startDate = moment().subtract(30, 'days').startOf('day').toDate();
            groupFormat = '%Y-%m-%d';
        } else if (period === 'year') {
            startDate = moment().subtract(12, 'months').startOf('month').toDate();
            groupFormat = '%Y-%m';
        } else {
            return errorResponse(res, 'Invalid period. Use week, month, or year', 400);
        }

        const data = await LaundryOrder.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 
                    period === 'year' ? 'month' : 'day', 
                    sequelize.col('created_at')
                ), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'income'],
                [sequelize.fn('COUNT', sequelize.col('order_id')), 'orders']
            ],
            where: {
                created_at: {
                    [Op.gte]: startDate
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            group: [sequelize.fn('DATE_TRUNC', 
                period === 'year' ? 'month' : 'day', 
                sequelize.col('created_at')
            )],
            order: [[sequelize.fn('DATE_TRUNC', 
                period === 'year' ? 'month' : 'day', 
                sequelize.col('created_at')
            ), 'ASC']]
        });

        return successResponse(res, data, 'Chart data fetched successfully');
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return errorResponse(res, error.message);
    }
};

// Get revenue and expense comparison
exports.getRevenueExpenseComparison = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentYear = year || moment().year();
        const currentMonth = month || moment().month() + 1;

        const startOfMonth = moment().year(currentYear).month(currentMonth - 1).startOf('month').toDate();
        const endOfMonth = moment().year(currentYear).month(currentMonth - 1).endOf('month').toDate();

        // Revenue by day
        const revenue = await LaundryOrder.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'amount']
            ],
            where: {
                created_at: {
                    [Op.between]: [startOfMonth, endOfMonth]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
        });

        // Expenses by day
        const expenses = await Expense.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('expense_date')), 'date'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
            ],
            where: {
                expense_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                },
                status: 'approved'
            },
            group: [sequelize.fn('DATE', sequelize.col('expense_date'))],
            order: [[sequelize.fn('DATE', sequelize.col('expense_date')), 'ASC']]
        });

        return successResponse(res, {
            period: {
                month: currentMonth,
                year: currentYear,
                start: startOfMonth,
                end: endOfMonth
            },
            revenue: revenue,
            expenses: expenses
        }, 'Revenue vs Expense data fetched successfully');
    } catch (error) {
        console.error('Error fetching revenue expense comparison:', error);
        return errorResponse(res, error.message);
    }
};