const Setting = require('../models/Setting');

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll({
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
    
    // Convert to key-value object for easier frontend consumption
    const settingsObject = {};
    settings.forEach(setting => {
      let value = setting.value;
      
      // Parse value based on type
      switch (setting.type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = setting.value;
          }
          break;
        default:
          value = setting.value;
      }
      
      settingsObject[setting.key] = value;
    });
    
    res.json(settingsObject);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Get single setting by key
exports.getSettingByKey = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: { key: req.params.key }
    });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    let value = setting.value;
    
    // Parse value based on type
    switch (setting.type) {
      case 'number':
        value = parseFloat(value);
        break;
      case 'boolean':
        value = value === 'true';
        break;
      case 'json':
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = setting.value;
        }
        break;
      default:
        value = setting.value;
    }
    
    res.json({ key: setting.key, value, type: setting.type });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
};

// Update or create setting
exports.updateSetting = async (req, res) => {
  try {
    const { key, value, type = 'string', description, category = 'general' } = req.body;
    
    if (!key) {
      return res.status(400).json({ message: 'Setting key is required' });
    }
    
    // Convert value to string for storage
    let stringValue = value;
    if (type === 'json') {
      stringValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else {
      stringValue = String(value);
    }
    
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: {
        key,
        value: stringValue,
        type,
        description,
        category
      }
    });
    
    if (!created) {
      await setting.update({
        value: stringValue,
        type,
        description,
        category
      });
    }
    
    res.json({
      message: created ? 'Setting created successfully' : 'Setting updated successfully',
      setting: {
        key: setting.key,
        value: type === 'json' ? JSON.parse(stringValue) : (type === 'boolean' ? stringValue === 'true' : (type === 'number' ? parseFloat(stringValue) : stringValue)),
        type: setting.type
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating setting', error: error.message });
  }
};

// Update multiple settings at once
exports.updateMultipleSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required' });
    }
    
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
      // Determine type based on value
      let type = 'string';
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (typeof value === 'object') type = 'json';
      
      // Convert value to string for storage
      let stringValue = value;
      if (type === 'json') {
        stringValue = JSON.stringify(value);
      } else if (type === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else {
        stringValue = String(value);
      }
      
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: {
          key,
          value: stringValue,
          type,
          category: 'system'
        }
      });
      
      if (!created) {
        await setting.update({
          value: stringValue,
          type
        });
      }
      
      results.push({
        key,
        value,
        type,
        created
      });
    }
    
    res.json({
      message: 'Settings updated successfully',
      results
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error: error.message });
  }
};

// Delete setting
exports.deleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: { key: req.params.key }
    });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    await setting.destroy();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting setting', error: error.message });
  }
};

// Initialize default settings
exports.initializeDefaultSettings = async (req, res) => {
  try {
    const defaultSettings = [
      {
        key: 'systemName',
        value: 'Dormitory Management System',
        type: 'string',
        description: 'Name of the system',
        category: 'system'
      },
      {
        key: 'version',
        value: '1.0.0',
        type: 'string',
        description: 'System version',
        category: 'system'
      },
      {
        key: 'contactEmail',
        value: 'admin@dorm.com',
        type: 'string',
        description: 'System contact email',
        category: 'contact'
      },
      {
        key: 'contactPhone',
        value: '+63 123 456 7890',
        type: 'string',
        description: 'System contact phone',
        category: 'contact'
      },
      {
        key: 'address',
        value: '123 Dormitory Street, City, Country',
        type: 'string',
        description: 'Physical address',
        category: 'contact'
      }
    ];
    
    const results = [];
    
    for (const defaultSetting of defaultSettings) {
      const [setting, created] = await Setting.findOrCreate({
        where: { key: defaultSetting.key },
        defaults: defaultSetting
      });
      
      results.push({
        key: defaultSetting.key,
        created,
        value: setting.value
      });
    }
    
    res.json({
      message: 'Default settings initialized',
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing settings', error: error.message });
  }
};