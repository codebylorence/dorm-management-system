const Unit = require('../models/Unit');
const Tenant = require('../models/Tenant');
const { Op } = require('sequelize');

// Get all units with tenant count and status
exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.findAll({
      order: [['unitNumber', 'ASC']]
    });

    // Get tenant counts for each unit
    const unitsWithStatus = await Promise.all(
      units.map(async (unit) => {
        const tenantCount = await Tenant.count({
          where: { 
            unit: unit.unitNumber,
            status: 'active'
          }
        });

        const status = tenantCount > 0 ? 'occupied' : 'vacant';

        return {
          ...unit.toJSON(),
          tenantCount,
          status
        };
      })
    );

    res.json(unitsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching units', error: error.message });
  }
};

// Get single unit by ID with tenant count
exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const tenantCount = await Tenant.count({
      where: { 
        unit: unit.unitNumber,
        status: 'active'
      }
    });

    const status = tenantCount > 0 ? 'occupied' : 'vacant';

    res.json({
      ...unit.toJSON(),
      tenantCount,
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unit', error: error.message });
  }
};

// Create new unit
exports.createUnit = async (req, res) => {
  try {
    const { unitNumber, floor, capacity, rentPrice, description } = req.body;
    
    const newUnit = await Unit.create({
      unitNumber,
      floor,
      capacity: capacity || 1,
      rentPrice,
      description
    });
    
    res.status(201).json({
      ...newUnit.toJSON(),
      tenantCount: 0,
      status: 'vacant'
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating unit', error: error.message });
  }
};

// Update unit
exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    const oldUnitNumber = unit.unitNumber;
    const newUnitNumber = req.body.unitNumber;
    let tenantUpdateResult = [0];
    let paymentUpdateResult = [0];
    
    // Check if new unit number already exists (if unit number is being changed)
    if (newUnitNumber && oldUnitNumber !== newUnitNumber) {
      const existingUnit = await Unit.findOne({
        where: { 
          unitNumber: newUnitNumber,
          id: { [Op.ne]: unit.id } // Exclude current unit
        }
      });
      
      if (existingUnit) {
        return res.status(400).json({ 
          message: `Unit number ${newUnitNumber} already exists` 
        });
      }
    }
    
    // Update the unit
    await unit.update(req.body);

    // If unit number changed, update all related records
    if (newUnitNumber && oldUnitNumber !== newUnitNumber) {
      console.log(`Unit number changed from ${oldUnitNumber} to ${newUnitNumber}, updating related records...`);
      
      // Update tenant records
      tenantUpdateResult = await Tenant.update(
        { unit: newUnitNumber },
        { 
          where: { 
            unit: oldUnitNumber 
          }
        }
      );
      
      console.log(`Updated ${tenantUpdateResult[0]} tenant records with new unit number`);
      
      // Update payment records
      const Payment = require('../models/Payment');
      paymentUpdateResult = await Payment.update(
        { unitNumber: newUnitNumber },
        {
          where: {
            unitNumber: oldUnitNumber
          }
        }
      );
      
      console.log(`Updated ${paymentUpdateResult[0]} payment records with new unit number`);
      
      // Send success message with update counts
      if (tenantUpdateResult[0] > 0 || paymentUpdateResult[0] > 0) {
        console.log(`Successfully updated unit ${oldUnitNumber} to ${newUnitNumber} and synchronized ${tenantUpdateResult[0]} tenant records and ${paymentUpdateResult[0]} payment records`);
      }
    }

    const tenantCount = await Tenant.count({
      where: { 
        unit: unit.unitNumber,
        status: 'active'
      }
    });

    const status = tenantCount > 0 ? 'occupied' : 'vacant';

    res.json({
      ...unit.toJSON(),
      tenantCount,
      status,
      // Include update information in response
      updateInfo: newUnitNumber && oldUnitNumber !== newUnitNumber ? {
        oldUnitNumber,
        newUnitNumber,
        tenantsUpdated: tenantUpdateResult[0],
        paymentsUpdated: paymentUpdateResult[0]
      } : null
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating unit', error: error.message });
  }
};

// Delete unit
exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Check if unit has active tenants
    const tenantCount = await Tenant.count({
      where: { 
        unit: unit.unitNumber,
        status: 'active'
      }
    });

    if (tenantCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete unit with active tenants. Please remove tenants first.' 
      });
    }
    
    await unit.destroy();
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting unit', error: error.message });
  }
};

// Get unit permissions based on user role
exports.getUnitPermissions = async (req, res) => {
  try {
    const permissions = {
      role: req.user.role,
      canCreateUnits: req.user.role === 'admin',
      canDeleteUnits: req.user.role === 'admin',
      canViewUnits: true,
      canEditUnits: true,
      showCreateButton: req.user.role === 'admin',
      showDeleteButton: req.user.role === 'admin'
    };
    
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching unit permissions', 
      error: error.message 
    });
  }
};
