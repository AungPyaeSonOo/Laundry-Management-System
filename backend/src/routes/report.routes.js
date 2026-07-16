const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Report routes
router.get('/daily', authorize('admin', 'accountant', 'manager'), reportController.getDailyReport);
router.get('/weekly', authorize('admin', 'accountant', 'manager'), reportController.getWeeklyReport);
router.get('/monthly', authorize('admin', 'accountant', 'manager'), reportController.getMonthlyReport);
router.get('/yearly', authorize('admin', 'accountant', 'manager'), reportController.getYearlyReport);
router.get('/custom', authorize('admin', 'accountant', 'manager'), reportController.getCustomReport);

// ✅ Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Report API is working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;