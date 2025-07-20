// DGMS Hub Backend with PostgreSQL Database
// Persistent storage that survives server restarts
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/dgms_hub', {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Application Model
const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'General'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'display_order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  backgroundColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#1976D2',
    field: 'background_color'
  },
  textColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#FFFFFF',
    field: 'text_color'
  },
  requiresAuth: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'requires_auth'
  },
  openInNewTab: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'open_in_new_tab'
  },
  iconUrl: {
    type: DataTypes.STRING(500),
    field: 'icon_url'
  }
}, {
  tableName: 'applications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(compression());
app.use(morgan('combined'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DGMS Hub Backend API with PostgreSQL',
    status: 'running',
    version: '2.0.0',
    database: 'PostgreSQL',
    endpoints: {
      health: '/health',
      applications: '/api/applications',
      createApp: 'POST /api/applications',
      updateApp: 'PUT /api/applications/:id',
      deleteApp: 'DELETE /api/applications/:id',
      categories: '/api/applications/meta/categories'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    const appCount = await Application.count();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Connected',
      applications: appCount,
      message: 'DGMS Hub Backend with PostgreSQL is running'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// GET - Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.findAll({
      order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    // Format for frontend compatibility
    const formattedApps = applications.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      url: app.url,
      category: app.category,
      displayOrder: app.displayOrder,
      isActive: app.isActive,
      backgroundColor: app.backgroundColor,
      textColor: app.textColor,
      requiresAuth: app.requiresAuth,
      openInNewTab: app.openInNewTab,
      iconUrl: app.iconUrl || `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}`,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    res.json({
      success: true,
      data: {
        applications: formattedApps,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: formattedApps.length,
          itemsPerPage: 50
        }
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications: ' + error.message
    });
  }
});

// POST - Create new application
app.post('/api/applications', async (req, res) => {
  try {
    const {
      name,
      description,
      url,
      category = 'General',
      backgroundColor = '#1976D2',
      textColor = '#FFFFFF',
      requiresAuth = false,
      openInNewTab = false
    } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Name and URL are required'
      });
    }

    // Get next display order
    const maxOrder = await Application.max('displayOrder') || 0;

    const application = await Application.create({
      name,
      description,
      url,
      category,
      displayOrder: maxOrder + 1,
      backgroundColor,
      textColor,
      requiresAuth,
      openInNewTab,
      iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating application: ' + error.message
    });
  }
});

// PUT - Update application
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update(updateData);

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application: ' + error.message
    });
  }
});

// DELETE - Delete application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Application deleted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application: ' + error.message
    });
  }
});

// GET - Get categories
app.get('/api/applications/meta/categories', async (req, res) => {
  try {
    const categories = await Application.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: {
        isActive: true
      }
    });

    const categoryList = categories.map(cat => cat.category).filter(Boolean);
    
    res.json({
      success: true,
      data: categoryList.length > 0 ? categoryList : ['General', 'Academic', 'Communication', 'Services']
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories: ' + error.message
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');

    app.listen(PORT, () => {
      console.log(`🚀 DGMS Hub Database Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: PostgreSQL`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API: http://localhost:${PORT}/api/applications`);
      console.log('');
      console.log('✅ PRODUCTION MODE: Using PostgreSQL database');
      console.log('   Data will persist across server restarts');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
