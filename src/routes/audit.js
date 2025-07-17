const express = require('express');
const { AuditLog, User, Application } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePagination, validateUUID } = require('../middleware/validation');

const router = express.Router();

// Get recent audit logs (admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const action = req.query.action;
    const entityType = req.query.entityType;
    const userId = req.query.userId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let whereClause = {};
    
    if (action) {
      whereClause.action = action;
    }
    
    if (entityType) {
      whereClause.entityType = entityType;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (startDate || endDate) {
      const { Op } = require('sequelize');
      whereClause.createdAt = {};
      
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Application,
          as: 'application',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// Get audit logs for a specific user (admin only)
router.get('/user/:userId', authenticateToken, requireAdmin, validateUUID('userId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows: auditLogs } = await AuditLog.getUserActivity(
      req.params.userId,
      limit,
      offset
    );

    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get user audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user audit logs'
    });
  }
});

// Get audit logs for a specific application (admin only)
router.get('/application/:applicationId', authenticateToken, requireAdmin, validateUUID('applicationId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows: auditLogs } = await AuditLog.getApplicationActivity(
      req.params.applicationId,
      limit,
      offset
    );

    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get application audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application audit logs'
    });
  }
});

// Get audit log statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { Op, fn, col } = require('sequelize');
    
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get action counts
    const actionStats = await AuditLog.findAll({
      attributes: [
        'action',
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: ['action'],
      order: [[fn('COUNT', col('id')), 'DESC']]
    });

    // Get entity type counts
    const entityStats = await AuditLog.findAll({
      attributes: [
        'entityType',
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: ['entityType'],
      order: [[fn('COUNT', col('id')), 'DESC']]
    });

    // Get daily activity
    const dailyActivity = await AuditLog.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    // Get most active users
    const activeUsers = await AuditLog.findAll({
      attributes: [
        'userId',
        [fn('COUNT', col('AuditLog.id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'firstName', 'lastName']
        }
      ],
      group: ['userId', 'user.id'],
      order: [[fn('COUNT', col('AuditLog.id')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        actionStats,
        entityStats,
        dailyActivity,
        activeUsers
      }
    });

  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics'
    });
  }
});

// Get available filter options (admin only)
router.get('/filters', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const actions = await AuditLog.findAll({
      attributes: ['action'],
      group: ['action'],
      order: [['action', 'ASC']]
    });

    const entityTypes = await AuditLog.findAll({
      attributes: ['entityType'],
      group: ['entityType'],
      order: [['entityType', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        actions: actions.map(item => item.action),
        entityTypes: entityTypes.map(item => item.entityType)
      }
    });

  } catch (error) {
    console.error('Get audit filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit filters'
    });
  }
});

module.exports = router;
