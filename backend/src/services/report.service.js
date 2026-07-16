const { LaundryOrder, Expense, DailyReport, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class ReportService {
    // Get daily report
    static async getDailyReport(date = null) {
        const reportDate = date ? new Date(date) : new Date();
        const startOfDay = moment(reportDate).startOf('day').toDate();
        const endOfDay = moment(reportDate).endOf('day').toDate();

        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: ['Customer', 'User']
        });

        const expenses = await Expense.findAll({
            where: {
                expense_date: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: 'approved'
            }
        });

        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        const netProfit = totalIncome - totalExpenses;

        return {
            period: {
                start: moment(reportDate).format('YYYY-MM-DD'),
                end: moment(reportDate).format('YYYY-MM-DD')
            },
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: netProfit
            },
            orders: orders,
            expenses: expenses
        };
    }

    // Get weekly report
    static async getWeeklyReport(week = null, year = null) {
        const currentYear = year || moment().year();
        const currentWeek = week || moment().week();

        const startOfWeek = moment().year(currentYear).week(currentWeek).startOf('week').toDate();
        const endOfWeek = moment().year(currentYear).week(currentWeek).endOf('week').toDate();

        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfWeek, endOfWeek]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: ['Customer', 'User']
        });

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

        return {
            week: currentWeek,
            year: currentYear,
            period: {
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
    }

    // Get monthly report
    static async getMonthlyReport(month = null, year = null) {
        const currentYear = year || moment().year();
        const currentMonth = month || moment().month() + 1;

        const startOfMonth = moment().year(currentYear).month(currentMonth - 1).startOf('month').toDate();
        const endOfMonth = moment().year(currentYear).month(currentMonth - 1).endOf('month').toDate();

        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfMonth, endOfMonth]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: ['Customer', 'User']
        });

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

        return {
            month: currentMonth,
            year: currentYear,
            month_name: moment().month(currentMonth - 1).format('MMMM'),
            period: {
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
    }

    // Get yearly report
    static async getYearlyReport(year = null) {
        const currentYear = year || moment().year();

        const startOfYear = moment().year(currentYear).startOf('year').toDate();
        const endOfYear = moment().year(currentYear).endOf('year').toDate();

        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [startOfYear, endOfYear]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: ['Customer', 'User']
        });

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

        return {
            year: currentYear,
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: totalIncome - totalExpenses
            },
            orders: orders,
            expenses: expenses
        };
    }

    // Get custom report
    static async getCustomReport(startDate, endDate, reportType = 'summary') {
        const orders = await LaundryOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            include: ['Customer', 'User']
        });

        const expenses = await Expense.findAll({
            where: {
                expense_date: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                },
                status: 'approved'
            },
            include: ['ExpenseCategory', 'User']
        });

        const totalIncome = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

        let result = {
            period: {
                start: startDate,
                end: endDate
            },
            summary: {
                total_orders: orders.length,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                net_profit: totalIncome - totalExpenses
            }
        };

        if (reportType === 'detailed') {
            result.orders = orders;
            result.expenses = expenses;
        }

        return result;
    }
}

module.exports = ReportService;