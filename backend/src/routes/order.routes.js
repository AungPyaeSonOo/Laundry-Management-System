const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// ============================================
// ✅ STATIC ROUTES (MUST BE BEFORE :id)
// ============================================
router.get('/active-deliveries', orderController.getActiveDeliveries);

// ============================================
// ORDER CRUD
// ============================================
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', authorize('admin', 'manager'), orderController.createOrder);
router.put('/:id', authorize('admin', 'accountant'), orderController.updateOrder);
router.delete('/:id', authorize('admin'), orderController.deleteOrder);

// ============================================
// ADD ITEMS
// ============================================
router.post('/:id/add-items', authorize('admin', 'manager', 'accountant'), orderController.addItemsToOrder);

// ============================================
// STATUS MANAGEMENT
// ============================================
router.get('/:id/next-status', orderController.getNextStatus);
router.post('/:id/complete-next', orderController.completeNextStatus);
router.patch('/:id/status', authorize('admin'), orderController.updateOrderStatus);

// ============================================
// ✅ PAYMENT ROUTES
// ============================================
router.post('/:id/confirm-payment', authorize('admin', 'accountant', 'manager'), orderController.confirmPayment);
router.patch('/:id/payment', orderController.updatePayment);

// ============================================
// DELIVERY TRACKING
// ============================================
router.patch('/:id/location', orderController.updateDeliveryLocation);

module.exports = router;