const User = require('../models/User');

// Get all users (with role-based filtering)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    
    const where = {};
    
    // Staff can only see other staff members, not admins
    if (req.user.role === 'staff') {
      where.role = 'staff';
    } else if (role) {
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

// Get single user by ID (with role-based access)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Staff cannot view admin user details
    if (req.user.role === 'staff' && user.role === 'admin') {
      return res.status(403).json({ 
        message: 'Staff cannot view admin user details' 
      });
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
    
    // Additional check: Staff cannot change admin credentials
    if (req.user.role === 'staff' && user.role === 'admin') {
      return res.status(403).json({ 
        message: 'Staff cannot edit admin credentials' 
      });
    }
    
    // Staff cannot change roles
    if (req.user.role === 'staff' && req.body.role && req.body.role !== user.role) {
      return res.status(403).json({ 
        message: 'Staff cannot change user roles' 
      });
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

// Get system information (Admin only)
exports.getSystemInfo = async (req, res) => {
  try {
    const Tenant = require('../models/Tenant');
    const Unit = require('../models/Unit');
    const Payment = require('../models/Payment');
    
    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalStaff = await User.count({ where: { role: 'staff' } });
    const totalTenants = await Tenant.count();
    const activeTenants = await Tenant.count({ where: { status: 'active' } });
    const totalUnits = await Unit.count();
    const totalPayments = await Payment.count();
    
    res.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        staff: totalStaff
      },
      tenants: {
        total: totalTenants,
        active: activeTenants
      },
      units: {
        total: totalUnits
      },
      payments: {
        total: totalPayments
      },
      systemVersion: '1.0.0',
      databaseStatus: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching system information', 
      error: error.message 
    });
  }
};

// Get system settings (Admin only)
exports.getSystemSettings = async (req, res) => {
  try {
    // In a real application, you would fetch these from a settings table
    const settings = {
      siteName: process.env.SITE_NAME || 'Dorm Management System',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
      sessionTimeout: process.env.JWT_EXPIRE || '24h',
      emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
      smsNotifications: process.env.SMS_NOTIFICATIONS === 'true'
    };
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching system settings', 
      error: error.message 
    });
  }
};

// Update system settings (Admin only)
exports.updateSystemSettings = async (req, res) => {
  try {
    // In a real application, you would save these to a settings table
    // For now, we'll just return success
    const { siteName, maintenanceMode, allowRegistration, maxLoginAttempts, sessionTimeout, emailNotifications, smsNotifications } = req.body;
    
    res.json({
      message: 'System settings updated successfully',
      settings: {
        siteName,
        maintenanceMode,
        allowRegistration,
        maxLoginAttempts,
        sessionTimeout,
        emailNotifications,
        smsNotifications
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating system settings', 
      error: error.message 
    });
  }
};

// Get user permissions based on role
exports.getUserPermissions = async (req, res) => {
  try {
    const permissions = {
      role: req.user.role,
      canCreateUsers: req.user.role === 'admin',
      canDeleteUsers: req.user.role === 'admin',
      canEditAdmins: req.user.role === 'admin',
      canViewAdmins: req.user.role === 'admin',
      canChangeRoles: req.user.role === 'admin',
      canAccessSystemSettings: req.user.role === 'admin',
      canCreateUnits: req.user.role === 'admin',
      canDeleteUnits: req.user.role === 'admin',
      canViewUnits: true,
      canEditUnits: true,
      canManageTenants: true,
      canManagePayments: true
    };
    
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user permissions', 
      error: error.message 
    });
  }
};

// Get staff-only user list (excludes admins)
exports.getStaffUsers = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = { role: 'staff' };
    
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
      message: 'Error fetching staff users', 
      error: error.message 
    });
  }
};

// Get current user status and role indicator
exports.getCurrentUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const roleIndicator = {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture
      },
      roleInfo: {
        role: user.role,
        roleDisplay: user.role === 'admin' ? 'Administrator' : 'Staff Member',
        roleColor: user.role === 'admin' ? '#dc3545' : '#28a745',
        roleIcon: user.role === 'admin' ? 'shield-check' : 'user',
        accessLevel: user.role === 'admin' ? 'Full Access' : 'Limited Access',
        canAccessSystemSettings: user.role === 'admin',
        canManageAllUsers: user.role === 'admin',
        canCreateUnits: user.role === 'admin'
      },
      sessionInfo: {
        loginTime: new Date().toISOString(),
        tokenExpiry: process.env.JWT_EXPIRE || '24h',
        isActive: user.status === 'active'
      }
    };
    
    res.json(roleIndicator);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user status', 
      error: error.message 
    });
  }
};

// Get role-based dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const Tenant = require('../models/Tenant');
    const Unit = require('../models/Unit');
    const Payment = require('../models/Payment');
    
    const dashboardData = {
      userInfo: {
        role: req.user.role,
        roleDisplay: req.user.role === 'admin' ? 'Administrator' : 'Staff Member',
        username: req.user.username,
        accessLevel: req.user.role === 'admin' ? 'Full System Access' : 'Staff Access'
      },
      stats: {}
    };
    
    // Common stats for both roles
    const totalTenants = await Tenant.count();
    const activeTenants = await Tenant.count({ where: { status: 'active' } });
    const totalUnits = await Unit.count();
    const totalPayments = await Payment.count();
    
    dashboardData.stats = {
      tenants: {
        total: totalTenants,
        active: activeTenants
      },
      units: {
        total: totalUnits
      },
      payments: {
        total: totalPayments
      }
    };
    
    // Admin-only stats
    if (req.user.role === 'admin') {
      const totalUsers = await User.count();
      const totalAdmins = await User.count({ where: { role: 'admin' } });
      const totalStaff = await User.count({ where: { role: 'staff' } });
      
      dashboardData.stats.users = {
        total: totalUsers,
        admins: totalAdmins,
        staff: totalStaff
      };
      
      dashboardData.systemInfo = {
        version: '1.0.0',
        databaseStatus: 'connected',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
      };
    }
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
};

// Get role-based navigation menu
exports.getNavigationMenu = async (req, res) => {
  try {
    const baseMenu = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        path: '/dashboard',
        order: 1
      },
      {
        id: 'tenants',
        label: 'Tenants',
        icon: 'users',
        path: '/tenants',
        order: 2
      },
      {
        id: 'units',
        label: 'Units',
        icon: 'building',
        path: '/units',
        order: 3
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: 'credit-card',
        path: '/payments',
        order: 4
      }
    ];
    
    const userMenu = {
      id: 'users',
      label: req.user.role === 'admin' ? 'User Management' : 'Staff Management',
      icon: 'user-cog',
      path: '/users',
      order: 5
    };
    
    let menu = [...baseMenu, userMenu];
    
    // Admin-only menu items
    if (req.user.role === 'admin') {
      const adminMenuItems = [
        {
          id: 'system-settings',
          label: 'System Settings',
          icon: 'cog',
          path: '/system-settings',
          order: 6,
          adminOnly: true
        },
        {
          id: 'system-info',
          label: 'System Information',
          icon: 'info-circle',
          path: '/system-info',
          order: 7,
          adminOnly: true
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: 'chart-bar',
          path: '/reports',
          order: 8,
          adminOnly: true
        }
      ];
      
      menu = [...menu, ...adminMenuItems];
    }
    
    // Sort by order
    menu.sort((a, b) => a.order - b.order);
    
    res.json({
      userRole: req.user.role,
      roleDisplay: req.user.role === 'admin' ? 'Administrator' : 'Staff Member',
      menu: menu
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching navigation menu', 
      error: error.message 
    });
  }
};

