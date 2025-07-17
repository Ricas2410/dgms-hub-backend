const express = require('express');
const { User, AuditLog } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserUpdate, 
  validateUUID, 
  validatePagination 
} = require('../middleware/validation');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search;

    let whereClause = {};
    if (search) {
      const { Op } = require('sequelize');
      whereClause = {
        [Op.or]: [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get single user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, validateUUID('id'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireAdmin, validateUserRegistration, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role
    } = req.body;

    // Check if username or email already exists
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
        success: false,
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    const userData = {
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'moderator',
      createdBy: req.user.id
    };

    const user = await User.create(userData);

    // Log the action
    await AuditLog.logAction({
      action: 'CREATE',
      entityType: 'USER',
      entityId: user.id,
      userId: req.user.id,
      newValues: { ...userData, password: '[REDACTED]' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      description: `Created user: ${user.username}`
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateUUID('id'), validateUserUpdate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && req.body.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const oldValues = { ...user.toJSON() };
    delete oldValues.password; // Don't log password

    // Check for unique constraints if username or email is being updated
    if (req.body.username || req.body.email) {
      const whereClause = {
        id: { [require('sequelize').Op.ne]: user.id }
      };
      
      const orConditions = [];
      if (req.body.username) orConditions.push({ username: req.body.username });
      if (req.body.email) orConditions.push({ email: req.body.email });
      
      whereClause[require('sequelize').Op.or] = orConditions;

      const existingUser = await User.findOne({ where: whereClause });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.username === req.body.username 
            ? 'Username already exists' 
            : 'Email already exists'
        });
      }
    }

    await user.update(req.body);

    // Log the action
    const newValues = { ...req.body };
    if (newValues.password) newValues.password = '[REDACTED]';

    await AuditLog.logAction({
      action: 'UPDATE',
      entityType: 'USER',
      entityId: user.id,
      userId: req.user.id,
      oldValues,
      newValues,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      description: `Updated user: ${user.username}`
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateUUID('id'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const oldValues = { ...user.toJSON() };
    delete oldValues.password; // Don't log password

    await user.destroy();

    // Log the action
    await AuditLog.logAction({
      action: 'DELETE',
      entityType: 'USER',
      entityId: user.id,
      userId: req.user.id,
      oldValues,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      description: `Deleted user: ${user.username}`
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
