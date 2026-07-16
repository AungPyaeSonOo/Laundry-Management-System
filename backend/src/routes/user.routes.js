// routes/user.routes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');

// ✅ All routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize('admin'));

// ✅ Get available users for employee assignment
router.get('/available-for-employee', userController.getAvailableForEmployee);

// ✅ Change password
router.put('/:id/change-password', userController.changePassword);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;