const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/orders/stats', dashboardController.getOrderStats);
router.get('/charts/income', dashboardController.getIncomeChartData);
router.get('/charts/revenue-expense', dashboardController.getRevenueExpenseComparison);

module.exports = router;