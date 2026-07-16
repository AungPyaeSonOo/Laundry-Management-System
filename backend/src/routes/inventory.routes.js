const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', inventoryController.getAllInventory);
router.get('/:id', inventoryController.getInventoryById);
router.get('/:id/transactions', inventoryController.getInventoryTransactions);
router.post('/', authorize('admin'), inventoryController.createInventory);
router.put('/:id', authorize('admin'), inventoryController.updateInventory);
router.patch('/:id/adjust', authorize('admin'), inventoryController.adjustInventory);
router.delete('/:id', authorize('admin'), inventoryController.deleteInventory);

module.exports = router;