const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin, preventStaffEditingAdmin, preventStaffSystemAccess, preventStaffEditingOthers, isStaffOrAdmin } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// Role indicator and status routes
router.get('/current-status', userController.getCurrentUserStatus);
router.get('/dashboard-data', userController.getDashboardData);
router.get('/navigation-menu', userController.getNavigationMenu);

// Permission and configuration routes
router.get('/permissions', userController.getUserPermissions);
router.get('/staff-only', isStaffOrAdmin, userController.getStaffUsers); // Staff can only see other staff

// System information routes (admin only)
router.get('/system-info', preventStaffSystemAccess, userController.getSystemInfo);
router.get('/system-settings', preventStaffSystemAccess, userController.getSystemSettings);
router.put('/system-settings', preventStaffSystemAccess, userController.updateSystemSettings);

// Update user role (admin only)
router.put('/:id/role', isAdmin, userController.updateUserRole);

// CRUD operations with role-based restrictions
router.get('/', userController.getAllUsers); // Now filters based on role
router.get('/:id', userController.getUserById); // Now prevents staff from viewing admins
router.post('/', isAdmin, userController.createUser); // Admin only
router.put('/:id', preventStaffEditingOthers, userController.updateUser); // Staff can only edit themselves
router.delete('/:id', isAdmin, userController.deleteUser); // Admin only

module.exports = router;

