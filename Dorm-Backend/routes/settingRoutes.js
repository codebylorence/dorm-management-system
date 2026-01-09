const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, isAdmin, isStaffOrAdmin } = require('../middleware/auth');

// All setting routes require authentication
router.use(authenticate);

// Initialize default settings (admin only)
router.post('/initialize', isAdmin, settingController.initializeDefaultSettings);

// Get all settings (staff and admin can view)
router.get('/', isStaffOrAdmin, settingController.getAllSettings);

// Get single setting by key (staff and admin can view)
router.get('/:key', isStaffOrAdmin, settingController.getSettingByKey);

// Update single setting (admin only)
router.put('/:key', isAdmin, settingController.updateSetting);

// Update multiple settings (admin only)
router.put('/', isAdmin, settingController.updateMultipleSettings);

// Delete setting (admin only)
router.delete('/:key', isAdmin, settingController.deleteSetting);

module.exports = router;