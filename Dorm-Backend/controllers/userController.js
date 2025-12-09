const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }
    
    const users = await User.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error.message 
    });
  }
};

// Create new user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, role, phone, status } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }
    
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      role: role || 'staff',
      phone,
      status: status || 'active'
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { username, email, password, fullName, phone, status, profilePicture } = req.body;
    
    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username already in use' 
        });
      }
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email already in use' 
        });
      }
    }
    
    // Prepare update data
    const updateData = {
      username: username || user.username,
      email: email || user.email,
      fullName: fullName || user.fullName,
      phone: phone || user.phone,
      status: status || user.status,
      profilePicture: profilePicture || user.profilePicture
    };
    
    // Only include password if provided (will be hashed by model hook)
    if (password && password.trim() !== '') {
      updateData.password = password;
    }
    
    await user.update(updateData);
    
    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent users from changing their own role
    if (req.user.id === user.id) {
      return res.status(403).json({ 
        message: 'You cannot change your own role' 
      });
    }
    
    const { role } = req.body;
    
    if (!role || !['admin', 'staff'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be admin or staff' 
      });
    }
    
    await user.update({ role });
    
    res.json({
      message: 'User role updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating user role', 
      error: error.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting own account
    if (req.user.id === user.id) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account' 
      });
    }
    
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};

