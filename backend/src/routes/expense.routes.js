const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', expenseController.getAllExpenses);
router.get('/categories', expenseController.getExpenseCategories);
router.post('/', authorize('admin', 'accountant'), expenseController.createExpense);
router.put('/:id', authorize('admin', 'accountant'), expenseController.updateExpense);
router.delete('/:id', authorize('admin'), expenseController.deleteExpense);

module.exports = router;