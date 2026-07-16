const { 
    LaundryOrder, 
    OrderItem, 
    Customer, 
    ClothingType, 
    User, 
    OrderStatusHistory, 
    DeliveryTracking,
    sequelize 
} = require('../models');
const generateOrderNumber = require('../utils/generateOrderNumber');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');

// ============================================
// STATUS TRANSITION RULES (Role-Based)
// ============================================
const STATUS_TRANSITIONS = {
    'pending': {
        allowedRoles: ['admin', 'delivery'],
        nextStatus: 'collected',
        label: 'Collected (Pickup Complete)',
        description: 'Pickup completed'
    },
    'collected': {
        allowedRoles: ['admin', 'employee'],
        nextStatus: 'washing',
        label: 'Washing',
        description: 'Start washing'
    },
    'washing': {
        allowedRoles: ['admin', 'employee'],
        nextStatus: 'ironing',
        label: 'Ironing',
        description: 'Start ironing'
    },
    'ironing': {
        allowedRoles: ['admin', 'employee'],
        nextStatus: 'ready',
        label: 'Ready',
        description: 'Ready for delivery'
    },
    'ready': {
        allowedRoles: ['admin', 'delivery'],
        nextStatus: 'delivered',
        label: 'Delivered (Payment Collected)',
        description: 'Order delivered, payment collected from customer'
    },
    'delivered': {
        allowedRoles: ['admin', 'accountant', 'manager'],
        nextStatus: 'completed',
        label: 'Complete (Payment Verified)',
        description: 'Payment verified, order completed'
    },
    'completed': {
        allowedRoles: ['admin'],
        nextStatus: null,
        label: 'Completed',
        description: 'Order completed'
    }
};

// ============================================
// GET ALL ORDERS
// ============================================
exports.getAllOrders = async (req, res) => {
    try {
        const { status, customer_id, start_date, end_date, page = 1, limit = 10 } = req.query;
        
        const where = {};
        if (status) where.status = status;
        if (customer_id) where.customer_id = customer_id;
        if (start_date && end_date) {
            where.order_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        const offset = (page - 1) * limit;

        const include = [
            { model: Customer, as: 'customer' },
            { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
            { 
                model: OrderItem,
                as: 'items',
                include: [{ model: ClothingType, as: 'clothing_type' }]
            }
        ];

        const { count, rows } = await LaundryOrder.findAndCountAll({
            where,
            include,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, {
            orders: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Orders fetched successfully');
    } catch (error) {
        console.error('Error fetching orders:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET ORDER BY ID
// ============================================
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const include = [
            { model: Customer, as: 'customer' },
            { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
            { 
                model: OrderItem,
                as: 'items',
                include: [{ model: ClothingType, as: 'clothing_type' }]
            },
            {
                model: OrderStatusHistory,
                as: 'status_history',
                include: [{ model: User, as: 'user' }]
            }
        ];

        const order = await LaundryOrder.findByPk(id, { include });

        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        return successResponse(res, order, 'Order fetched successfully');
    } catch (error) {
        console.error('Error fetching order:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// CREATE ORDER
// ============================================
exports.createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { 
            customer_id, 
            items = [],
            pickup_date, 
            discount = 0, 
            notes 
        } = req.body;

        const customer = await Customer.findByPk(customer_id);
        if (!customer) {
            return errorResponse(res, 'Customer not found', 404);
        }

        let totalPrice = 0;
        const orderItems = [];

        if (items && items.length > 0 && items[0].clothing_type_id) {
            for (const item of items) {
                const clothingType = await ClothingType.findByPk(item.clothing_type_id);
                if (!clothingType) {
                    return errorResponse(res, `Clothing type ${item.clothing_type_id} not found`, 404);
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
        }

        const finalTotal = totalPrice - discount;
        const orderNumber = generateOrderNumber();

        const validPickupDate = pickup_date && pickup_date !== 'Invalid date' ? pickup_date : null;

        const order = await LaundryOrder.create({
            order_number: orderNumber,
            customer_id,
            user_id: req.userId,
            order_date: new Date(),
            pickup_date: validPickupDate,
            delivery_date: null,
            total_price: finalTotal,
            discount,
            paid_amount: 0,
            status: 'pending',
            payment_status: 'unpaid',
            notes: notes || `Order created by ${req.user.full_name}`
        }, { transaction });

        if (orderItems.length > 0) {
            for (const item of orderItems) {
                await OrderItem.create({
                    order_id: order.order_id,
                    ...item
                }, { transaction });
            }
        }

        await OrderStatusHistory.create({
            order_id: order.order_id,
            status: 'pending',
            user_id: req.userId,
            notes: notes || 'Order created (pending pickup)'
        }, { transaction });

        await transaction.commit();

        const completeOrder = await LaundryOrder.findByPk(order.order_id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                { 
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: ClothingType, as: 'clothing_type' }]
                }
            ]
        });

        return successResponse(res, completeOrder, 'Order created successfully', 201);
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating order:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// UPDATE ORDER
// ============================================
exports.updateOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { 
            customer_id, 
            items, 
            pickup_date, 
            delivery_date, 
            discount = 0, 
            notes 
        } = req.body;

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        await order.update({
            customer_id,
            pickup_date,
            delivery_date,
            discount,
            notes
        }, { transaction });

        await OrderItem.destroy({
            where: { order_id: id }
        }, { transaction });

        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const clothingType = await ClothingType.findByPk(item.clothing_type_id);
            if (!clothingType) {
                return errorResponse(res, `Clothing type ${item.clothing_type_id} not found`, 404);
            }

            const unitPrice = item.unit_price || clothingType.default_price;
            const itemTotal = unitPrice * item.quantity;
            totalPrice += itemTotal;

            orderItems.push({
                order_id: id,
                clothing_type_id: item.clothing_type_id,
                quantity: item.quantity,
                unit_price: unitPrice,
                total_price: itemTotal,
                notes: item.notes || null
            });
        }

        const finalTotal = totalPrice - (discount || 0);

        await order.update({
            total_price: finalTotal
        }, { transaction });

        for (const item of orderItems) {
            await OrderItem.create(item, { transaction });
        }

        await transaction.commit();

        const completeOrder = await LaundryOrder.findByPk(id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                { 
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: ClothingType, as: 'clothing_type' }]
                }
            ]
        });

        return successResponse(res, completeOrder, 'Order updated successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating order:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET NEXT STATUS
// ============================================
exports.getNextStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        console.log('📊 getNextStatus called:', { id, userRole });

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        const currentStatus = order.status;
        const transition = STATUS_TRANSITIONS[currentStatus];

        if (!transition) {
            return errorResponse(res, 'Invalid status', 400);
        }

        const canComplete = transition.allowedRoles.includes(userRole) && transition.nextStatus !== null;

        const remainingAmount = parseFloat(order.total_price) - parseFloat(order.paid_amount);
        const isFullyPaid = remainingAmount <= 0;
        const hasPayment = order.paid_amount > 0;

        console.log('📊 Next Status Check:', {
            currentStatus,
            userRole,
            canComplete,
            allowedRoles: transition.allowedRoles,
            nextStatus: transition.nextStatus
        });

        return successResponse(res, {
            current_status: currentStatus,
            next_status: transition.nextStatus,
            next_label: transition.label,
            description: transition.description,
            allowed_roles: transition.allowedRoles,
            can_complete: canComplete,
            is_completed: currentStatus === 'completed',
            payment_collected: hasPayment,
            payment_complete: isFullyPaid,
            total_amount: order.total_price,
            paid_amount: order.paid_amount,
            remaining_amount: remainingAmount,
            payment_status: order.payment_status,
            payment_method: order.payment_method
        }, 'Next status info fetched successfully');
    } catch (error) {
        console.error('Error getting next status:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// COMPLETE NEXT STATUS
// ============================================
exports.completeNextStatus = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { notes, payment_method, payment_reference, amount } = req.body;
        const userRole = req.user.role;
        const userId = req.userId;

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        const currentStatus = order.status;
        const transition = STATUS_TRANSITIONS[currentStatus];

        if (!transition) {
            return errorResponse(res, 'Invalid status', 400);
        }

        if (!transition.allowedRoles.includes(userRole)) {
            return errorResponse(res, `Role '${userRole}' cannot update this order`, 403);
        }

        if (!transition.nextStatus) {
            return errorResponse(res, 'Order is already completed', 400);
        }

        const nextStatus = transition.nextStatus;

        // ✅ Delivery completes delivery - collects payment
        if (currentStatus === 'ready' && nextStatus === 'delivered') {
            if (!payment_method) {
                return errorResponse(res, 'Payment method is required (cash, kpay, or wave_pay)', 400);
            }
            
            const paymentAmount = amount || order.total_price;
            const remaining = parseFloat(order.total_price) - parseFloat(order.paid_amount);
            
            if (parseFloat(paymentAmount) > remaining) {
                return errorResponse(res, `Payment amount ${paymentAmount} exceeds remaining balance ${remaining}`, 400);
            }

            const newPaidAmount = parseFloat(order.paid_amount) + parseFloat(paymentAmount);
            let paymentStatus = 'partial';
            if (newPaidAmount >= parseFloat(order.total_price)) {
                paymentStatus = 'paid';
            } else if (newPaidAmount > 0) {
                paymentStatus = 'partial';
            }

            await order.update({
                paid_amount: newPaidAmount,
                payment_status: paymentStatus,
                payment_method: payment_method,
                payment_reference: payment_reference || order.payment_reference,
                payment_collected_by: userId,
                payment_collected_at: new Date(),
                payment_notes: notes || order.payment_notes
            }, { transaction });
        }

        // ✅ Admin/Manager/Accountant verifies payment (delivered → completed)
        if (currentStatus === 'delivered' && nextStatus === 'completed') {
            if (order.paid_amount <= 0) {
                return errorResponse(res, 'No payment recorded. Please collect payment first.', 400);
            }

            await order.update({
                payment_status: 'paid',
                payment_verified_by: userId,
                payment_verified_at: new Date(),
                payment_notes: notes || order.payment_notes
            }, { transaction });
        }

        // ✅ Update order status
        await order.update({ status: nextStatus }, { transaction });

        await OrderStatusHistory.create({
            order_id: order.order_id,
            status: nextStatus,
            user_id: userId,
            notes: notes || `Status changed from ${currentStatus} to ${nextStatus} by ${userRole}`
        }, { transaction });

        await transaction.commit();

        const updatedOrder = await LaundryOrder.findByPk(id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                { 
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: ClothingType, as: 'clothing_type' }]
                }
            ]
        });

        return successResponse(res, {
            order: updatedOrder,
            status_changed: {
                from: currentStatus,
                to: nextStatus,
                by: userRole,
                label: transition.label
            }
        }, `Order ${transition.label} successfully`);
    } catch (error) {
        await transaction.rollback();
        console.error('Error completing next status:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// UPDATE ORDER STATUS (Admin Only)
// ============================================
exports.updateOrderStatus = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        await order.update({ status }, { transaction });

        await OrderStatusHistory.create({
            order_id: order.order_id,
            status,
            user_id: req.userId,
            notes: notes || `Status changed to ${status}`
        }, { transaction });

        await transaction.commit();

        const updatedOrder = await LaundryOrder.findByPk(id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                { 
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: ClothingType, as: 'clothing_type' }]
                }
            ]
        });

        return successResponse(res, updatedOrder, 'Order status updated successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating order status:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// UPDATE PAYMENT
// ============================================
exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paid_amount } = req.body;

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        const newPaidAmount = parseFloat(order.paid_amount) + parseFloat(paid_amount);
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

        return successResponse(res, order, 'Payment updated successfully');
    } catch (error) {
        console.error('Error updating payment:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// DELETE ORDER
// ============================================
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        await order.destroy();

        return successResponse(res, null, 'Order deleted successfully');
    } catch (error) {
        console.error('Error deleting order:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// UPDATE DELIVERY LOCATION
// ============================================
exports.updateDeliveryLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return errorResponse(res, 'Latitude and longitude are required', 400);
        }

        await DeliveryTracking.upsert({
            order_id: id,
            delivery_person_id: req.userId,
            lat: lat,
            lng: lng,
            updated_at: new Date()
        });

        return successResponse(res, null, 'Location updated successfully');
    } catch (error) {
        console.error('Error updating location:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// GET ACTIVE DELIVERIES (FOR ADMIN MAP)
// ============================================
exports.getActiveDeliveries = async (req, res) => {
    try {
        // ✅ Get orders with status pending, collected, ready, delivered
        const orders = await LaundryOrder.findAll({
            where: {
                status: {
                    [Op.in]: ['pending', 'collected', 'ready', 'delivered']
                }
            },
            include: [
                { 
                    model: Customer, 
                    as: 'customer',
                    attributes: ['name', 'phone', 'address']
                },
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['full_name', 'user_id'] 
                },
                {
                    // ✅ Join with DeliveryTracking for location
                    model: DeliveryTracking,
                    as: 'delivery',
                    attributes: ['lat', 'lng', 'status', 'delivery_person_id', 'updated_at']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // ✅ Filter orders that have location data
        const activeDeliveries = orders
            .filter(order => order.delivery && order.delivery.lat && order.delivery.lng)
            .map(order => {
                // Determine task type
                let taskType = 'delivery';
                if (['pending', 'collected'].includes(order.status)) {
                    taskType = 'pickup';
                }

                return {
                    order_id: order.order_id,
                    order_number: order.order_number,
                    customer_name: order.customer?.name || 'N/A',
                    customer_address: order.customer?.address || 'N/A',
                    status: order.status,
                    task_type: taskType,
                    delivery_person: order.user?.full_name || 'Driver',
                    location: {
                        lat: parseFloat(order.delivery.lat),
                        lng: parseFloat(order.delivery.lng)
                    },
                    last_updated: order.delivery.updated_at
                };
            });

        return successResponse(res, activeDeliveries, 'Active deliveries fetched successfully');
    } catch (error) {
        console.error('Error fetching active deliveries:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// ADD ITEMS TO ORDER
// ============================================
exports.addItemsToOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { items, notes } = req.body;

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        const allowedRoles = ['admin', 'accountant', 'manager'];
        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, 'You are not authorized to add items', 403);
        }

        if (order.status !== 'collected') {
            return errorResponse(res, 'Items can only be added when order is collected', 400);
        }

        const existingItems = await OrderItem.findAll({
            where: { order_id: id }
        });

        if (existingItems.length > 0) {
            return errorResponse(res, 'Items already added to this order', 400);
        }

        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const clothingType = await ClothingType.findByPk(item.clothing_type_id);
            if (!clothingType) {
                return errorResponse(res, `Clothing type ${item.clothing_type_id} not found`, 404);
            }

            const unitPrice = item.unit_price || clothingType.default_price;
            const itemTotal = unitPrice * item.quantity;
            totalPrice += itemTotal;

            orderItems.push({
                order_id: id,
                clothing_type_id: item.clothing_type_id,
                quantity: item.quantity,
                unit_price: unitPrice,
                total_price: itemTotal,
                notes: item.notes || null
            });
        }

        for (const item of orderItems) {
            await OrderItem.create(item, { transaction });
        }

        const finalTotal = totalPrice - (order.discount || 0);
        await order.update({
            total_price: finalTotal,
            notes: notes || `Items added by ${req.user.full_name}`
        }, { transaction });

        await OrderStatusHistory.create({
            order_id: order.order_id,
            status: 'collected',
            user_id: req.userId,
            notes: `Items added by ${req.user.full_name}`
        }, { transaction });

        await transaction.commit();

        const completeOrder = await LaundryOrder.findByPk(id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                { 
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: ClothingType, as: 'clothing_type' }]
                }
            ]
        });

        return successResponse(res, completeOrder, 'Items added successfully', 200);
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding items:', error);
        return errorResponse(res, error.message);
    }
};

// ============================================
// CONFIRM PAYMENT (Admin/Manager/Accountant)
// ============================================
exports.confirmPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { payment_method, amount, notes } = req.body;
        const userId = req.userId;
        const userRole = req.user.role;

        // Only admin/manager/accountant can confirm
        if (!['admin', 'accountant', 'manager'].includes(userRole)) {
            return errorResponse(res, 'Only Admin, Manager, or Accountant can confirm payments', 403);
        }

        const order = await LaundryOrder.findByPk(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return errorResponse(res, 'Order must be delivered before confirming payment', 400);
        }

        const confirmAmount = parseFloat(amount) || (parseFloat(order.total_price) - parseFloat(order.paid_amount));
        const remaining = parseFloat(order.total_price) - parseFloat(order.paid_amount);

        if (confirmAmount > remaining) {
            return errorResponse(res, `Amount exceeds remaining balance: ${remaining} MMK`, 400);
        }

        // ✅ Update order paid amount
        const newPaidAmount = parseFloat(order.paid_amount) + confirmAmount;
        let paymentStatus = 'unpaid';
        if (newPaidAmount >= parseFloat(order.total_price)) {
            paymentStatus = 'paid';
        } else if (newPaidAmount > 0) {
            paymentStatus = 'partial';
        }

        // ✅ Update order with payment method and complete
        await order.update({
            paid_amount: newPaidAmount,
            payment_status: paymentStatus,
            payment_method: payment_method || order.payment_method,
            payment_verified_by: userId,
            payment_verified_at: new Date(),
            payment_notes: notes || order.payment_notes,
            status: 'completed'
        }, { transaction });

        // ✅ Add status history
        await OrderStatusHistory.create({
            order_id: order.order_id,
            status: 'completed',
            user_id: userId,
            notes: `Payment of ${confirmAmount} MMK confirmed via ${payment_method || 'cash'} by ${req.user.full_name}. Order completed.`
        }, { transaction });

        await transaction.commit();

        // ✅ Get updated order
        const updatedOrder = await LaundryOrder.findByPk(id, {
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                { 
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: ClothingType, as: 'clothing_type' }]
                }
            ]
        });

        return successResponse(res, updatedOrder, `Payment of ${confirmAmount} MMK confirmed. Order completed successfully.`);
    } catch (error) {
        await transaction.rollback();
        console.error('Error confirming payment:', error);
        return errorResponse(res, error.message);
    }
};