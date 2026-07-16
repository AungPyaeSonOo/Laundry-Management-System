const { Customer, LaundryOrder } = require('../models');
const { Op } = require('sequelize');

class CustomerService {
    // Get all customers with filters
    static async getAllCustomers(filters = {}) {
        const {
            search,
            page = 1,
            limit = 10
        } = filters;

        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Customer.findAndCountAll({
            where,
            include: [
                {
                    model: LaundryOrder,
                    attributes: ['order_id', 'order_number', 'total_price', 'status', 'created_at']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            customers: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    // Get customer by ID
    static async getCustomerById(customerId) {
        const customer = await Customer.findByPk(customerId, {
            include: [
                {
                    model: LaundryOrder,
                    attributes: ['order_id', 'order_number', 'total_price', 'status', 'created_at', 'delivery_date']
                }
            ]
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return customer;
    }

    // Create new customer
    static async createCustomer(data) {
        const { name, phone, email, address, note } = data;

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
            where: { phone }
        });

        if (existingCustomer) {
            throw new Error('Customer with this phone already exists');
        }

        const customer = await Customer.create({
            name,
            phone,
            email,
            address,
            note,
            loyalty_points: 0
        });

        return customer;
    }

    // Update customer
    static async updateCustomer(customerId, data) {
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const {
            name,
            phone,
            email,
            address,
            note,
            is_active
        } = data;

        await customer.update({
            name: name || customer.name,
            phone: phone || customer.phone,
            email: email || customer.email,
            address: address || customer.address,
            note: note || customer.note,
            is_active: is_active !== undefined ? is_active : customer.is_active
        });

        return customer;
    }

    // Delete customer
    static async deleteCustomer(customerId) {
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Check if customer has orders
        const orderCount = await LaundryOrder.count({
            where: { customer_id: customerId }
        });

        if (orderCount > 0) {
            // Soft delete - just deactivate
            await customer.update({ is_active: false });
            return { message: 'Customer deactivated (has existing orders)' };
        }

        await customer.destroy();
        return { message: 'Customer deleted successfully' };
    }

    // Get customer orders
    static async getCustomerOrders(customerId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const { count, rows } = await LaundryOrder.findAndCountAll({
            where: { customer_id: customerId },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            customer: customer.name,
            orders: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    // Get customer statistics
    static async getCustomerStats() {
        const totalCustomers = await Customer.count({ where: { is_active: true } });
        const totalOrders = await LaundryOrder.count();
        const totalRevenue = await LaundryOrder.sum('total_price', {
            where: { status: { [Op.ne]: 'cancelled' } }
        });

        // Top customers by order count
        const topCustomers = await Customer.findAll({
            attributes: [
                'customer_id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('orders.order_id')), 'order_count'],
                [sequelize.fn('SUM', sequelize.col('orders.total_price')), 'total_spent']
            ],
            include: [
                {
                    model: LaundryOrder,
                    as: 'orders',
                    attributes: [],
                    where: { status: { [Op.ne]: 'cancelled' } }
                }
            ],
            group: ['Customer.customer_id'],
            order: [[sequelize.literal('order_count'), 'DESC']],
            limit: 10
        });

        return {
            total_customers: totalCustomers,
            total_orders: totalOrders,
            total_revenue: totalRevenue || 0,
            top_customers: topCustomers
        };
    }
}

module.exports = CustomerService;