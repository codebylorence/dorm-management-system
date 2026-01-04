const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, role, phone } = req.body;
    
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
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      role: role || 'staff',
      phone,
      status: 'active'
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide username and password' 
      });
    }
    
    // Find user by username or email
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email: username }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Account is inactive or suspended' 
      });
    }
    
    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    // Generate token
    const token = generateToken(user);
    
    // Create role indicator information
    const roleIndicator = {
      role: user.role,
      roleDisplay: user.role === 'admin' ? 'Administrator' : 'Staff Member',
      roleColor: user.role === 'admin' ? '#dc3545' : '#28a745',
      roleIcon: user.role === 'admin' ? 'shield-check' : 'user',
      accessLevel: user.role === 'admin' ? 'Full Access' : 'Limited Access',
      welcomeMessage: `Welcome back, ${user.role === 'admin' ? 'Administrator' : 'Staff Member'} ${user.fullName}!`
    };
    
    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
      roleIndicator: roleIndicator,
      sessionInfo: {
        loginTime: new Date().toISOString(),
        tokenExpiry: JWT_EXPIRE,
        userAgent: req.headers['user-agent'] || 'Unknown'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
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

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { fullName, email, phone, profilePicture } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email already in use' 
        });
      }
    }
    
    await user.update({
      fullName: fullName || user.fullName,
      email: email || user.email,
      phone: phone || user.phone,
      profilePicture: profilePicture || user.profilePicture
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Please provide current and new password' 
      });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Current password is incorrect' 
      });
    }
    
    // Update password
    await user.update({ password: newPassword });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error changing password', 
      error: error.message 
    });
  }
};

// Logout (client-side token removal, but can be used for logging)
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is primarily client-side
    // But we can log the event or implement token blacklisting if needed
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging out', 
      error: error.message 
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user || user.status !== 'active') {
      return res.status(403).json({ 
        message: 'User not found or inactive' 
      });
    }
    
    const token = generateToken(user);
    
    res.json({
      message: 'Token refreshed successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error refreshing token', 
      error: error.message 
    });
  }
};

