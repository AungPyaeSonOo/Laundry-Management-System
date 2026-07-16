const { Customer, LaundryOrder } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');

// Get all customers with pagination and search
exports.getAllCustomers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
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
                    as: 'orders',  // ✅ as ထည့်ပါ
                    attributes: ['order_id', 'order_number', 'total_price', 'status', 'created_at']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, {
            customers: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Customers fetched successfully');
    } catch (error) {
        console.error('Error fetching customers:', error);
        return errorResponse(res, error.message);
    }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByPk(id, {
            include: [
                {
                    model: LaundryOrder,
                    as: 'orders',  // ✅ as ထည့်ပါ
                    attributes: ['order_id', 'order_number', 'total_price', 'status', 'created_at', 'delivery_date']
                }
            ]
        });

        if (!customer) {
            return errorResponse(res, 'Customer not found', 404);
        }

        return successResponse(res, customer, 'Customer fetched successfully');
    } catch (error) {
        console.error('Error fetching customer:', error);
        return errorResponse(res, error.message);
    }
};

// Create new customer
exports.createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address, note } = req.body;

        const existingCustomer = await Customer.findOne({
            where: { phone }
        });

        if (existingCustomer) {
            return errorResponse(res, 'Customer with this phone already exists', 409);
        }

        const customer = await Customer.create({
            name,
            phone,
            email,
            address,
            note,
            loyalty_points: 0
        });

        return successResponse(res, customer, 'Customer created successfully', 201);
    } catch (error) {
        console.error('Error creating customer:', error);
        return errorResponse(res, error.message);
    }
};

// Update customer
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address, note, is_active } = req.body;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return errorResponse(res, 'Customer not found', 404);
        }

        await customer.update({
            name: name || customer.name,
            phone: phone || customer.phone,
            email: email || customer.email,
            address: address || customer.address,
            note: note || customer.note,
            is_active: is_active !== undefined ? is_active : customer.is_active
        });

        return successResponse(res, customer, 'Customer updated successfully');
    } catch (error) {
        console.error('Error updating customer:', error);
        return errorResponse(res, error.message);
    }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return errorResponse(res, 'Customer not found', 404);
        }

        const orderCount = await LaundryOrder.count({
            where: { customer_id: id }
        });

        if (orderCount > 0) {
            await customer.update({ is_active: false });
            return successResponse(res, null, 'Customer deactivated (has existing orders)');
        }

        await customer.destroy();
        return successResponse(res, null, 'Customer deleted successfully');
    } catch (error) {
        console.error('Error deleting customer:', error);
        return errorResponse(res, error.message);
    }
};

// Get customer order history
exports.getCustomerOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return errorResponse(res, 'Customer not found', 404);
        }

        const { count, rows } = await LaundryOrder.findAndCountAll({
            where: { customer_id: id },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, {
            customer: customer.name,
            orders: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Customer orders fetched successfully');
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return errorResponse(res, error.message);
    }
};