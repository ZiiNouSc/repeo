const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Agence = require('../models/agenceModel');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else if (process.env.NODE_ENV === 'development') {
    // For development only - allow requests without token
    // This is a temporary solution for testing
    req.user = {
      _id: '60d0fe4f5311236168a109ca',
      role: 'superadmin'
    };
    next();
  } else if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// Agency middleware
const agency = (req, res, next) => {
  if (req.user && (req.user.role === 'agence' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an agency');
  }
};

// Check if user has permission for a module
const hasPermission = (module, action) => {
  return (req, res, next) => {
    // For development only - allow all permissions
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    // Superadmin has all permissions
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Agency admin has all permissions on their active modules
    if (req.user.role === 'agence') {
      // Check if module is active for this agency
      Agence.findById(req.user.agenceId).then(agence => {
        if (agence && agence.modulesActifs.includes(module)) {
          return next();
        } else {
          res.status(403);
          throw new Error('Not authorized, module not active for this agency');
        }
      }).catch(err => {
        res.status(500);
        throw new Error('Error checking agency modules');
      });
    }

    // For agents, check specific permissions
    if (req.user.role === 'agent' && req.user.permissions) {
      const modulePermission = req.user.permissions.find(p => p.module === module);
      if (modulePermission && modulePermission.actions.includes(action)) {
        return next();
      }
    }

    res.status(403);
    throw new Error('Not authorized, insufficient permissions');
  };
};

module.exports = { protect, admin, agency, hasPermission };