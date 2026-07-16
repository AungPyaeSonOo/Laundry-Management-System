const { Inventory, InventoryTransaction, User, LaundryOrder, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { Op } = require('sequelize');

// Get all inventory items
exports.getAllInventory = async (req, res) => {
    try {
        const { 
            category, 
            search, 
            low_stock,
            page = 1, 
            limit = 10 
        } = req.query;
        
        const offset = (page - 1) * limit;
        const where = {};

        if (category) where.category = category;
        if (search) {
            where.item_name = { [Op.iLike]: `%${search}%` };
        }
        if (low_stock === 'true') {
            where.quantity = { [Op.lte]: sequelize.col('reorder_level') };
        }

        const { count, rows } = await Inventory.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, {
            inventory: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Inventory fetched successfully');
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return errorResponse(res, error.message);
    }
};

// Get inventory by ID
exports.getInventoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await Inventory.findByPk(id, {
            include: [
                {
                    model: InventoryTransaction,
                    as: 'transactions',
                    limit: 10,
                    order: [['transaction_date', 'DESC']]
                }
            ]
        });

        if (!inventory) {
            return errorResponse(res, 'Inventory item not found', 404);
        }

        return successResponse(res, inventory, 'Inventory item fetched successfully');
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return errorResponse(res, error.message);
    }
};

// Create new inventory item
exports.createInventory = async (req, res) => {
    const transaction = await sequelize.transaction();  // ✅ ပြင်ဆင်ပြီး
    try {
        const {
            item_name,
            category,
            quantity,
            unit,
            unit_price,
            reorder_level,
            expiry_date,
            supplier,
            notes
        } = req.body;

        console.log('📝 Creating inventory item:', { item_name, category, quantity });

        const inventory = await Inventory.create({
            item_name,
            category,
            quantity: quantity || 0,
            unit,
            unit_price: unit_price || 0,
            reorder_level: reorder_level || 0,
            expiry_date: expiry_date || null,
            supplier: supplier || null,
            notes: notes || null,
            is_active: true
        }, { transaction });

        // If initial quantity > 0, create transaction
        if (quantity > 0) {
            await InventoryTransaction.create({
                inventory_id: inventory.inventory_id,
                transaction_type: 'in',
                quantity: quantity,
                unit_price: unit_price || 0,
                total_amount: (quantity * (unit_price || 0)),
                user_id: req.userId,
                notes: 'Initial stock'
            }, { transaction });
        }

        await transaction.commit();

        return successResponse(res, inventory, 'Inventory item created successfully', 201);
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating inventory:', error);
        return errorResponse(res, error.message);
    }
};

// Update inventory
exports.updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            item_name,
            category,
            unit,
            unit_price,
            reorder_level,
            expiry_date,
            supplier,
            notes,
            is_active
        } = req.body;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return errorResponse(res, 'Inventory item not found', 404);
        }

        await inventory.update({
            item_name: item_name || inventory.item_name,
            category: category || inventory.category,
            unit: unit || inventory.unit,
            unit_price: unit_price !== undefined ? unit_price : inventory.unit_price,
            reorder_level: reorder_level !== undefined ? reorder_level : inventory.reorder_level,
            expiry_date: expiry_date || inventory.expiry_date,
            supplier: supplier || inventory.supplier,
            notes: notes || inventory.notes,
            is_active: is_active !== undefined ? is_active : inventory.is_active
        });

        return successResponse(res, inventory, 'Inventory item updated successfully');
    } catch (error) {
        console.error('Error updating inventory:', error);
        return errorResponse(res, error.message);
    }
};

// Adjust inventory quantity
exports.adjustInventory = async (req, res) => {
    const transaction = await sequelize.transaction();  // ✅ ပြင်ဆင်ပြီး
    try {
        const { id } = req.params;
        const { quantity, adjustment_type, notes } = req.body;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return errorResponse(res, 'Inventory item not found', 404);
        }

        let newQuantity;
        let transactionType;

        if (adjustment_type === 'add') {
            newQuantity = parseFloat(inventory.quantity) + parseFloat(quantity);
            transactionType = 'in';
        } else if (adjustment_type === 'subtract') {
            if (parseFloat(inventory.quantity) < parseFloat(quantity)) {
                return errorResponse(res, 'Insufficient stock', 400);
            }
            newQuantity = parseFloat(inventory.quantity) - parseFloat(quantity);
            transactionType = 'out';
        } else {
            return errorResponse(res, 'Invalid adjustment type', 400);
        }

        await inventory.update({ quantity: newQuantity }, { transaction });

        await InventoryTransaction.create({
            inventory_id: inventory.inventory_id,
            transaction_type: transactionType,
            quantity: quantity,
            unit_price: inventory.unit_price,
            total_amount: (quantity * inventory.unit_price),
            user_id: req.userId,
            notes: notes || `Stock adjustment: ${adjustment_type}`
        }, { transaction });

        await transaction.commit();

        return successResponse(res, inventory, 'Inventory adjusted successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('Error adjusting inventory:', error);
        return errorResponse(res, error.message);
    }
};

// Get inventory transactions
exports.getInventoryTransactions = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await InventoryTransaction.findAndCountAll({
            where: { inventory_id: id },
            include: [
                { model: User, as: 'user', attributes: { exclude: ['password_hash'] } },
                { model: LaundryOrder, as: 'order', attributes: ['order_number'] }
            ],
            order: [['transaction_date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return successResponse(res, {
            transactions: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        }, 'Inventory transactions fetched successfully');
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return errorResponse(res, error.message);
    }
};

// Delete inventory
exports.deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return errorResponse(res, 'Inventory item not found', 404);
        }

        const transactionCount = await InventoryTransaction.count({
            where: { inventory_id: id }
        });

        if (transactionCount > 0) {
            await inventory.update({ is_active: false });
            return successResponse(res, null, 'Inventory item deactivated (has transactions)');
        }

        await inventory.destroy();
        return successResponse(res, null, 'Inventory item deleted successfully');
    } catch (error) {
        console.error('Error deleting inventory:', error);
        return errorResponse(res, error.message);
    }
};