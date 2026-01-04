const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { authenticate, isAdmin, isStaffOrAdmin } = require('../middleware/auth');

// All unit routes require authentication
router.use(authenticate);

// Permission routes
router.get('/permissions', unitController.getUnitPermissions);

// CRUD operations with role-based restrictions
router.get('/', isStaffOrAdmin, unitController.getAllUnits); // Staff and Admin can view
router.get('/:id', isStaffOrAdmin, unitController.getUnitById); // Staff and Admin can view
router.post('/', isAdmin, unitController.createUnit); // Admin only can create
router.put('/:id', isAdmin, unitController.updateUnit); // Admin only can update
router.delete('/:id', isAdmin, unitController.deleteUnit); // Admin only can delete

module.exports = router;
