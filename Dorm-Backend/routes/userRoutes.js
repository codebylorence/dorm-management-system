const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// Update user role (admin only)
router.put('/:id/role', isAdmin, userController.updateUserRole);

// CRUD operations
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', isAdmin, userController.createUser); // Admin only
router.put('/:id', userController.updateUser);
router.delete('/:id', isAdmin, userController.deleteUser); // Admin only

module.exports = router;

