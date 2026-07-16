const { 
    LaundryOrder, 
    OrderItem, 
    Customer, 
    ClothingType, 
    User, 
    OrderStatusHistory,
    sequelize 
} = require('../models');
const generateOrderNumber = require('../utils/generateOrderNumber');
const { Op } = require('sequelize');

class OrderService {
    // Create new order
    static async createOrder(orderData, userId) {
        const transaction = await sequelize.transaction();
        try {
            const {
                customer_id,
                items,
                pickup_date,
                delivery_date,
                discount = 0,
                notes
            } = orderData;

            // Check customer
            const customer = await Customer.findByPk(customer_id);
            if (!customer) {
                throw new Error('Customer not found');
            }

            // Calculate total price
            let totalPrice = 0;
            const orderItems = [];

            for (const item of items) {
                const clothingType = await ClothingType.findByPk(item.clothing_type_id);
                if (!clothingType) {
                    throw new Error(`Clothing type ${item.clothing_type_id} not found`);
                }

                const unitPrice = item.unit_price || clothingType.default_price;
                const itemTotal = unitPrice * item.quantity;
                totalPrice += itemTotal;

                orderItems.push({
                    clothing_type_id: item.clothing_type_id,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    total_price: itemTotal,
                    notes: item.notes || null
                });
            }

            const finalTotal = totalPrice - discount;
            const orderNumber = generateOrderNumber();

            // Create order
            const order = await LaundryOrder.create({
                order_number: orderNumber,
                customer_id,
                user_id: userId,
                order_date: new Date(),
                pickup_date,
                delivery_date,
                total_price: finalTotal,
                discount,
                paid_amount: 0,
                status: 'pending',
                payment_status: 'unpaid',
                notes
            }, { transaction });

            // Create order items
            for (const item of orderItems) {
                await OrderItem.create({
                    order_id: order.order_id,
                    ...item
                }, { transaction });
            }

            // Create status history
            await OrderStatusHistory.create({
                order_id: order.order_id,
                status: 'pending',
                user_id: userId,
                notes: 'Order created'
            }, { transaction });

            await transaction.commit();

            // Fetch complete order
            const completeOrder = await LaundryOrder.findByPk(order.order_id, {
                include: [
                    { model: Customer },
                    { model: User, attributes: { exclude: ['password_hash'] } },
                    {
                        model: OrderItem,
                        include: [ClothingType]
                    }
                ]
            });

            return completeOrder;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Get all orders with filters
    static async getAllOrders(filters = {}) {
        const {
            status,
            customer_id,
            start_date,
            end_date,
            page = 1,
            limit = 10
        } = filters;

        const where = {};
        if (status) where.status = status;
        if (customer_id) where.customer_id = customer_id;
        if (start_date && end_date) {
            where.order_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await LaundryOrder.findAndCountAll({
            where,
            include: [
                { model: Customer },
                { model: User, attributes: { exclude: ['password_hash'] } },
                {
                    model: OrderItem,
                    include: [ClothingType]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            orders: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    // Get order by ID
    static async getOrderById(orderId) {
        const order = await LaundryOrder.findByPk(orderId, {
            include: [
                { model: Customer },
                { model: User, attributes: { exclude: ['password_hash'] } },
                {
                    model: OrderItem,
                    include: [ClothingType]
                },
                {
                    model: OrderStatusHistory,
                    include: [User]
                }
            ]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    // Update order status
    static async updateOrderStatus(orderId, status, userId, notes = '') {
        const transaction = await sequelize.transaction();
        try {
            const order = await LaundryOrder.findByPk(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            await order.update({ status }, { transaction });

            await OrderStatusHistory.create({
                order_id: order.order_id,
                status,
                user_id: userId,
                notes: notes || `Status changed to ${status}`
            }, { transaction });

            await transaction.commit();

            return await this.getOrderById(orderId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Update payment
    static async updatePayment(orderId, paidAmount) {
        const order = await LaundryOrder.findByPk(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        const newPaidAmount = parseFloat(order.paid_amount) + parseFloat(paidAmount);
        let paymentStatus = 'unpaid';

        if (newPaidAmount >= parseFloat(order.total_price)) {
            paymentStatus = 'paid';
        } else if (newPaidAmount > 0) {
            paymentStatus = 'partial';
        }

        await order.update({
            paid_amount: newPaidAmount,
            payment_status: paymentStatus
        });

        return order;
    }

    // Delete order
    static async deleteOrder(orderId) {
        const order = await LaundryOrder.findByPk(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        await order.destroy();
        return true;
    }

    // Get order statistics
    static async getOrderStats() {
        const statuses = ['pending', 'collected', 'washing', 'ironing', 'ready', 'delivered', 'completed', 'cancelled'];
        const stats = {};

        for (const status of statuses) {
            stats[status] = await LaundryOrder.count({
                where: { status }
            });
        }

        // Today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        stats.today_orders = await LaundryOrder.count({
            where: {
                created_at: {
                    [Op.between]: [today, tomorrow]
                }
            }
        });

        stats.today_income = await LaundryOrder.sum('total_price', {
            where: {
                created_at: {
                    [Op.between]: [today, tomorrow]
                },
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        }) || 0;

        return stats;
    }
}

module.exports = OrderService;