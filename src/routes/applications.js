const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { Application, AuditLog } = require('../models');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { 
  validateApplication, 
  validateApplicationUpdate, 
  validateUUID, 
  validatePagination,
  validateReorder 
} = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Get all applications (public endpoint for mobile app)
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    let whereClause = { isActive: true };
    if (category) {
      whereClause.category = category;
    }

    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereClause,
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
      limit,
      offset
    });

    // Add full icon URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const applicationsWithIcons = applications.map(app => ({
      ...app.toJSON(),
      iconUrl: app.getIconUrl(baseUrl)
    }));

    res.json({
      success: true,
      data: {
        applications: applicationsWithIcons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Get single application by ID
router.get('/:id', validateUUID('id'), optionalAuth, async (req, res) => {
  try {
    const application = await Application.findOne({
      where: { 
        id: req.params.id,
        isActive: true 
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const applicationWithIcon = {
      ...application.toJSON(),
      iconUrl: application.getIconUrl(baseUrl)
    };

    res.json({
      success: true,
      data: { application: applicationWithIcon }
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
});

// Create new application (admin only)
router.post('/', authenticateToken, validateApplication, upload.single('icon'), async (req, res) => {
  try {
    const {
      name,
      description,
      url,
      category,
      backgroundColor,
      textColor,
      requiresAuth,
      openInNewTab
    } = req.body;

    const displayOrder = await Application.getNextDisplayOrder();
    
    const applicationData = {
      name,
      description,
      url,
      category,
      displayOrder,
      backgroundColor,
      textColor,
      requiresAuth: requiresAuth === 'true' || requiresAuth === true,
      openInNewTab: openInNewTab === 'true' || openInNewTab === true,
      iconPath: req.file ? req.file.filename : null,
      createdBy: req.user.id
    };

    const application = await Application.create(applicationData);

    // Log the action
    await AuditLog.logAction({
      action: 'CREATE',
      entityType: 'APPLICATION',
      entityId: application.id,
      userId: req.user.id,
      applicationId: application.id,
      newValues: applicationData,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      description: `Created application: ${application.name}`
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const applicationWithIcon = {
      ...application.toJSON(),
      iconUrl: application.getIconUrl(baseUrl)
    };

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application: applicationWithIcon }
    });

  } catch (error) {
    // Clean up uploaded file if application creation failed
    if (req.file) {
      fs.unlink(req.file.path).catch(console.error);
    }

    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application'
    });
  }
});

// Update application (admin only)
router.put('/:id', authenticateToken, validateUUID('id'), validateApplicationUpdate, upload.single('icon'), async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const oldValues = { ...application.toJSON() };

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    // Handle boolean conversions
    if (updateData.requiresAuth !== undefined) {
      updateData.requiresAuth = updateData.requiresAuth === 'true' || updateData.requiresAuth === true;
    }
    if (updateData.openInNewTab !== undefined) {
      updateData.openInNewTab = updateData.openInNewTab === 'true' || updateData.openInNewTab === true;
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }

    // Handle icon upload
    if (req.file) {
      // Delete old icon if it exists
      if (application.iconPath) {
        const oldIconPath = path.join(__dirname, '../../uploads', application.iconPath);
        await fs.unlink(oldIconPath).catch(console.error);
      }
      updateData.iconPath = req.file.filename;
    }

    await application.update(updateData);

    // Log the action
    await AuditLog.logAction({
      action: 'UPDATE',
      entityType: 'APPLICATION',
      entityId: application.id,
      userId: req.user.id,
      applicationId: application.id,
      oldValues,
      newValues: updateData,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      description: `Updated application: ${application.name}`
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const applicationWithIcon = {
      ...application.toJSON(),
      iconUrl: application.getIconUrl(baseUrl)
    };

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application: applicationWithIcon }
    });

  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
});

// Delete application (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateUUID('id'), async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const oldValues = { ...application.toJSON() };

    // Delete icon file if it exists
    if (application.iconPath) {
      const iconPath = path.join(__dirname, '../../uploads', application.iconPath);
      await fs.unlink(iconPath).catch(console.error);
    }

    await application.destroy();

    // Log the action
    await AuditLog.logAction({
      action: 'DELETE',
      entityType: 'APPLICATION',
      entityId: application.id,
      userId: req.user.id,
      applicationId: application.id,
      oldValues,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      description: `Deleted application: ${application.name}`
    });

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
});

// Reorder applications (admin only)
router.post('/reorder', authenticateToken, validateReorder, async (req, res) => {
  try {
    const { applicationIds } = req.body;

    await Application.reorderApplications(applicationIds);

    // Log the action
    await AuditLog.logAction({
      action: 'REORDER',
      entityType: 'APPLICATION',
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      description: 'Reordered applications',
      metadata: { applicationIds }
    });

    res.json({
      success: true,
      message: 'Applications reordered successfully'
    });

  } catch (error) {
    console.error('Reorder applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder applications'
    });
  }
});

// Get application categories
router.get('/meta/categories', optionalAuth, async (req, res) => {
  try {
    const categories = await Application.findAll({
      attributes: ['category'],
      where: {
        isActive: true,
        category: { [require('sequelize').Op.ne]: null }
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(cat => cat.category).filter(Boolean);

    res.json({
      success: true,
      data: { categories: categoryList }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
