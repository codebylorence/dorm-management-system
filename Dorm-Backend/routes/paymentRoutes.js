const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticate);

// Get payment statistics (for dashboard)
router.get('/statistics', paymentController.getPaymentStatistics);

// Get overdue payments
router.get('/overdue', paymentController.getOverduePayments);

// Update overdue payments
router.put('/update-overdue', paymentController.updateOverduePayments);

// Get payments by tenant
router.get('/tenant/:tenantId', paymentController.getPaymentsByTenant);

// Get payments by unit
router.get('/unit/:unitNumber', paymentController.getPaymentsByUnit);

// CRUD operations
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;

