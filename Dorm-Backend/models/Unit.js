const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unit = sequelize.define('Unit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unitNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  rentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'units',
  timestamps: true
});

module.exports = Unit;
