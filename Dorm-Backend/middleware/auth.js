const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authenticate user from JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided. Authorization denied.' 
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User no longer exists' 
      });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'User account is inactive or suspended' 
      });
    }
    
    // Add user to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      message: 'Error authenticating user', 
      error: error.message 
    });
  }
};

// Authorize user based on roles
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    
    next();
  };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'User not authenticated' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required' 
    });
  }
  
  next();
};

// Check if user is staff or admin
exports.isStaffOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'User not authenticated' 
    });
  }
  
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Staff or Admin access required' 
    });
  }
  
  next();
};

// Prevent staff from editing admin credentials
exports.preventStaffEditingAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admins can edit anyone
    }
    
    // If staff is trying to edit a user, check if target is admin
    if (req.params.id) {
      const User = require('../models/User');
      const targetUser = await User.findByPk(req.params.id);
      
      if (targetUser && targetUser.role === 'admin') {
        return res.status(403).json({ 
          message: 'Staff cannot edit admin credentials' 
        });
      }
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error checking user permissions', 
      error: error.message 
    });
  }
};

// Prevent staff from accessing system settings
exports.preventStaffSystemAccess = (req, res, next) => {
  if (req.user.role === 'staff') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required for system settings.' 
    });
  }
  
  next();
};

// Prevent staff from editing other users (staff can only edit themselves)
exports.preventStaffEditingOthers = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admins can edit anyone
    }
    
    // Staff can only edit their own profile
    if (req.params.id && req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'Staff can only edit their own profile' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error checking user permissions', 
      error: error.message 
    });
  }
};

// Allow tenants to edit their own information, staff/admin can edit any tenant
exports.allowTenantSelfEdit = async (req, res, next) => {
  try {
    // Admin and staff can edit any tenant
    if (['admin', 'staff'].includes(req.user.role)) {
      return next();
    }
    
    // For tenants, check if they're editing their own information
    if (req.user.role === 'tenant' && req.params.id) {
      const Tenant = require('../models/Tenant');
      const tenant = await Tenant.findByPk(req.params.id);
      
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      
      // Check if the tenant belongs to the current user
      if (tenant.userId !== req.user.id) {
        return res.status(403).json({ 
          message: 'You can only edit your own information' 
        });
      }
      
      return next();
    }
    
    // If not admin, staff, or tenant editing their own info, deny access
    return res.status(403).json({ 
      message: 'Access denied' 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error checking tenant permissions', 
      error: error.message 
    });
  }
};

