const { Inventory, InventoryTransaction, User, LaundryOrder, sequelize } = require('../models');
const { Op } = require('sequelize');

class InventoryService {
    // Get all inventory with filters
    static async getAllInventory(filters = {}) {
        const {
            category,
            search,
            low_stock,
            page = 1,
            limit = 10
        } = filters;

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

        return {
            inventory: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    // Get inventory by ID
    static async getInventoryById(inventoryId) {
        const inventory = await Inventory.findByPk(inventoryId, {
            include: [
                {
                    model: InventoryTransaction,
                    limit: 10,
                    order: [['transaction_date', 'DESC']]
                }
            ]
        });

        if (!inventory) {
            throw new Error('Inventory item not found');
        }

        return inventory;
    }

    // Create new inventory
    static async createInventory(data, userId) {
        const transaction = await sequelize.transaction();
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
            } = data;

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

            // Create initial transaction if quantity > 0
            if (quantity > 0) {
                await InventoryTransaction.create({
                    inventory_id: inventory.inventory_id,
                    transaction_type: 'in',
                    quantity: quantity,
                    unit_price: unit_price || 0,
                    total_amount: (quantity * (unit_price || 0)),
                    user_id: userId,
                    notes: 'Initial stock'
                }, { transaction });
            }

            await transaction.commit();
            return inventory;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Update inventory
    static async updateInventory(inventoryId, data) {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) {
            throw new Error('Inventory item not found');
        }

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
        } = data;

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

        return inventory;
    }

    // Adjust inventory quantity
    static async adjustInventory(inventoryId, quantity, adjustmentType, userId, notes = '') {
        const transaction = await sequelize.transaction();
        try {
            const inventory = await Inventory.findByPk(inventoryId);
            if (!inventory) {
                throw new Error('Inventory item not found');
            }

            let newQuantity;
            let transactionType;

            if (adjustmentType === 'add') {
                newQuantity = parseFloat(inventory.quantity) + parseFloat(quantity);
                transactionType = 'in';
            } else if (adjustmentType === 'subtract') {
                if (parseFloat(inventory.quantity) < parseFloat(quantity)) {
                    throw new Error('Insufficient stock');
                }
                newQuantity = parseFloat(inventory.quantity) - parseFloat(quantity);
                transactionType = 'out';
            } else {
                throw new Error('Invalid adjustment type');
            }

            // Update inventory
            await inventory.update({ quantity: newQuantity }, { transaction });

            // Create transaction record
            await InventoryTransaction.create({
                inventory_id: inventory.inventory_id,
                transaction_type: transactionType,
                quantity: quantity,
                unit_price: inventory.unit_price,
                total_amount: (quantity * inventory.unit_price),
                user_id: userId,
                notes: notes || `Stock adjustment: ${adjustmentType}`
            }, { transaction });

            await transaction.commit();
            return inventory;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Get inventory transactions
    static async getInventoryTransactions(inventoryId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const { count, rows } = await InventoryTransaction.findAndCountAll({
            where: { inventory_id: inventoryId },
            include: [
                { model: User, attributes: { exclude: ['password_hash'] } },
                { model: LaundryOrder, attributes: ['order_number'] }
            ],
            order: [['transaction_date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            transactions: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        };
    }

    // Delete inventory
    static async deleteInventory(inventoryId) {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) {
            throw new Error('Inventory item not found');
        }

        // Check if there are transactions
        const transactionCount = await InventoryTransaction.count({
            where: { inventory_id: inventoryId }
        });

        if (transactionCount > 0) {
            // Soft delete
            await inventory.update({ is_active: false });
            return { message: 'Inventory item deactivated (has transactions)' };
        }

        await inventory.destroy();
        return { message: 'Inventory item deleted successfully' };
    }

    // Get low stock items
    static async getLowStockItems() {
        const items = await Inventory.findAll({
            where: {
                is_active: true,
                quantity: {
                    [Op.lte]: sequelize.col('reorder_level')
                }
            },
            order: [['quantity', 'ASC']]
        });

        return items;
    }

    // Get inventory summary
    static async getInventorySummary() {
        const totalItems = await Inventory.count({ where: { is_active: true } });
        const totalValue = await Inventory.sum(sequelize.literal('quantity * unit_price'), {
            where: { is_active: true }
        });

        const categorySummary = await Inventory.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('inventory_id')), 'count'],
                [sequelize.fn('SUM', sequelize.literal('quantity * unit_price')), 'total_value']
            ],
            where: { is_active: true },
            group: ['category']
        });

        return {
            total_items: totalItems || 0,
            total_value: totalValue || 0,
            by_category: categorySummary
        };
    }
}

module.exports = InventoryService;