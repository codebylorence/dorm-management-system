const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const { Op } = require('sequelize');

// Get all payments with optional filtering
exports.getAllPayments = async (req, res) => {
  try {
    const { status, paymentType, startDate, endDate } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (paymentType) {
      where.paymentType = paymentType;
    }
    
    if (startDate && endDate) {
      where.paymentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const payments = await Payment.findAll({
      where,
      order: [['paymentDate', 'DESC']],
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'email', 'unit']
      }]
    });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get single payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'email', 'unit']
      }]
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// Get payments by tenant ID
exports.getPaymentsByTenant = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { tenantId: req.params.tenantId },
      order: [['paymentDate', 'DESC']],
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'email', 'unit']
      }]
    });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenant payments', error: error.message });
  }
};

// Get payments by unit number
exports.getPaymentsByUnit = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { unitNumber: req.params.unitNumber },
      order: [['paymentDate', 'DESC']],
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'email', 'unit']
      }]
    });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unit payments', error: error.message });
  }
};

// Get payment statistics for dashboard
exports.getPaymentStatistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    // Total rent collected (all paid payments)
    const totalCollected = await Payment.sum('paidAmount', {
      where: { status: 'Paid' }
    }) || 0;
    
    // Due today
    const dueToday = await Payment.sum('amount', {
      where: {
        dueDate: {
          [Op.between]: [today, endOfToday]
        },
        status: { [Op.in]: ['Unpaid', 'Partial'] }
      }
    }) || 0;
    
    // Overdue/Late payments
    const overdue = await Payment.sum('amount', {
      where: {
        dueDate: {
          [Op.lt]: today
        },
        status: { [Op.in]: ['Unpaid', 'Late', 'Partial'] }
      }
    }) || 0;
    
    // Count of payments by status
    const statusCounts = await Payment.findAll({
      attributes: [
        'status',
        [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Recent payments (last 10)
    const recentPayments = await Payment.findAll({
      limit: 10,
      order: [['paymentDate', 'DESC']],
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'unit']
      }]
    });
    
    res.json({
      totalCollected: parseFloat(totalCollected).toFixed(2),
      dueToday: parseFloat(dueToday).toFixed(2),
      overdue: parseFloat(overdue).toFixed(2),
      statusCounts,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment statistics', error: error.message });
  }
};

// Get overdue payments
exports.getOverduePayments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overduePayments = await Payment.findAll({
      where: {
        dueDate: {
          [Op.lt]: today
        },
        status: { [Op.in]: ['Unpaid', 'Late', 'Partial'] }
      },
      order: [['dueDate', 'ASC']],
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'email', 'unit']
      }]
    });
    
    res.json(overduePayments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overdue payments', error: error.message });
  }
};

// Create new payment
exports.createPayment = async (req, res) => {
  try {
    const {
      tenantId,
      unitNumber,
      tenantName,
      amount,
      paymentType,
      paymentDate,
      dueDate,
      status,
      paymentMethod,
      referenceNumber,
      paidAmount,
      notes
    } = req.body;
    
    // Verify tenant exists
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    const newPayment = await Payment.create({
      tenantId,
      unitNumber: unitNumber || tenant.unit,
      tenantName: tenantName || tenant.fullName,
      amount,
      paymentType: paymentType || 'Rent Bill',
      paymentDate: paymentDate || new Date(),
      dueDate,
      status: status || 'Unpaid',
      paymentMethod,
      referenceNumber,
      paidAmount: paidAmount || 0,
      notes
    });
    
    const paymentWithTenant = await Payment.findByPk(newPayment.id, {
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'email', 'unit']
      }]
    });
    
    res.status(201).json(paymentWithTenant);
  } catch (error) {
    res.status(400).json({ message: 'Error creating payment', error: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    await payment.update(req.body);
    
    const updatedPayment = await Payment.findByPk(payment.id, {
      include: [{
        model: Tenant,
        attributes: ['id', 'fullName', 'phone', 'email', 'unit']
      }]
    });
    
    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating payment', error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    await payment.destroy();
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

