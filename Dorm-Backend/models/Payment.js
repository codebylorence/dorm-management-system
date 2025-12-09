const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  unitNumber: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  tenantName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentType: {
    type: DataTypes.ENUM(
      'Rent Bill',
      'Electricity & Water Bill',
      'Advance',
      'Deposit',
      'Maintenance',
      'Other'
    ),
    allowNull: false,
    defaultValue: 'Rent Bill'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid', 'Late', 'Partial'),
    allowNull: false,
    defaultValue: 'Unpaid'
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'Cash',
      'Bank Transfer',
      'GCash',
      'PayMaya',
      'Credit Card',
      'Debit Card',
      'Other'
    ),
    allowNull: true
  },
  referenceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;

