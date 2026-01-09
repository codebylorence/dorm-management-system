const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticate, isStaffOrAdmin, allowTenantSelfEdit } = require('../middleware/auth');

// All tenant routes require authentication
router.use(authenticate);

// CRUD operations with role-based restrictions
router.get('/', isStaffOrAdmin, tenantController.getAllTenants); // Staff and Admin can view
router.get('/:id', isStaffOrAdmin, tenantController.getTenantById); // Staff and Admin can view
router.post('/', isStaffOrAdmin, tenantController.createTenant); // Staff and Admin can create
router.put('/:id', allowTenantSelfEdit, tenantController.updateTenant); // Tenants can edit their own info, Staff and Admin can edit any
router.delete('/:id', isStaffOrAdmin, tenantController.deleteTenant); // Staff and Admin can delete

module.exports = router;
