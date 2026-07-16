const express = require('express');
const router = express.Router();
const clothingTypeController = require('../controllers/clothingType.controller');
const { authMiddleware, authorize } = require('../middleware/auth.middleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', clothingTypeController.getAll);
router.get('/:id', clothingTypeController.getById);
router.post('/', clothingTypeController.create);
router.put('/:id', clothingTypeController.update);
router.delete('/:id', clothingTypeController.delete);

module.exports = router;