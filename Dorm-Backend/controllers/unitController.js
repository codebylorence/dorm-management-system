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
    
    await unit.update(req.body);

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
