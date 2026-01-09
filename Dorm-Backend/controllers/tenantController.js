const Tenant = require('../models/Tenant');

// Get all tenants
exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      order: [['unit', 'ASC']]
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants', error: error.message });
  }
};

// Get single tenant by ID
exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenant', error: error.message });
  }
};

// Create new tenant
exports.createTenant = async (req, res) => {
  try {
    const { 
      unit, 
      fullName, 
      phone, 
      email, 
      address, 
      moveInDate, 
      gender,
      dateOfBirth,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      status 
    } = req.body;
    
    const newTenant = await Tenant.create({
      unit,
      fullName,
      phone,
      email,
      address,
      moveInDate,
      gender,
      dateOfBirth,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      status: status || 'active'
    });
    
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(400).json({ message: 'Error creating tenant', error: error.message });
  }
};

// Update tenant
exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    // Permission check: tenants can only edit their own information
    if (req.user.role === 'tenant' && req.user.id !== tenant.userId) {
      return res.status(403).json({ message: 'You can only edit your own information' });
    }
    
    // Prepare update data
    const updateData = { ...req.body };
    
    // Tenants cannot change their unit assignment - only admin/staff can
    if (req.user.role === 'tenant' && updateData.unit && updateData.unit !== tenant.unit) {
      return res.status(403).json({ message: 'You cannot change your unit assignment. Contact admin for unit changes.' });
    }
    
    await tenant.update(updateData);
    res.json(tenant);
  } catch (error) {
    res.status(400).json({ message: 'Error updating tenant', error: error.message });
  }
};

// Delete tenant
exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    await tenant.destroy();
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tenant', error: error.message });
  }
};
