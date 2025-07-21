const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Simple CORS configuration for testing
const corsOptions = {
  origin: true, // Allow all origins for testing
  credentials: true,
  optionsSuccessStatus: 200
};

const app = express();
const PORT = process.env.PORT || 3000;

// For Render deployment - handle health checks
app.get('/', (req, res) => {
  res.json({
    message: 'DGMS Hub Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      applications: '/api/applications',
      createApp: 'POST /api/applications',
      updateApp: 'PUT /api/applications/:id',
      deleteApp: 'DELETE /api/applications/:id',
      categories: '/api/applications/meta/categories',
      auth: '/api/auth/login'
    }
  });
});

// Basic security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Basic logging
app.use(morgan('combined'));

// CORS configuration
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic input validation (simplified for testing)
app.use((req, res, next) => {
  // Basic sanitization - remove any potential script tags
  if (req.body) {
    JSON.stringify(req.body).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  next();
});

// Static files for uploaded icons
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    message: 'DGMS Hub Backend Server is running (Production Mode - Full CRUD Support)'
  });
});

// Test API endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Applications endpoint - now uses dynamic data
app.get('/api/applications', (req, res) => {
  res.json({
    success: true,
    data: {
      applications: applications,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: applications.length,
        itemsPerPage: 50
      }
    }
  });
});

// Single application endpoint - now uses dynamic data
app.get('/api/applications/:id', (req, res) => {
  const { id } = req.params;

  const application = applications.find(app => app.id === id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  res.json({
    success: true,
    data: application
  });
});

// Mock categories endpoint
app.get('/api/applications/meta/categories', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: ['Academic', 'Communication', 'Services']
    }
  });
});

// DGMS Hardcoded Applications - Always Available!
let applications = [
  {
    id: 'dgms-main-website',
    name: 'DGMS Main Website',
    description: 'Official Deigratis Montessori School website',
    url: 'https://deigratiams.edu.gh/',
    category: 'Main',
    displayOrder: 1,
    isActive: true,
    backgroundColor: '#1976D2',
    textColor: '#FFFFFF',
    requiresAuth: false,
    openInNewTab: false,
    iconUrl: 'https://res.cloudinary.com/ds5udo8jc/image/upload/v1/school_logo/dgm_logo_chkygj',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dgms-library',
    name: 'DGMS Library',
    description: 'Access the school digital library resources',
    url: 'https://library.deigratiams.edu.gh',
    category: 'Academic',
    displayOrder: 2,
    isActive: true,
    backgroundColor: '#4CAF50',
    textColor: '#FFFFFF',
    requiresAuth: false,
    openInNewTab: false,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'student-dashboard',
    name: 'Student Dashboard',
    description: 'Student login portal for academic resources',
    url: 'https://deigratiams.edu.gh/users/student-login/',
    category: 'Student Portal',
    displayOrder: 3,
    isActive: true,
    backgroundColor: '#FF9800',
    textColor: '#FFFFFF',
    requiresAuth: true,
    openInNewTab: false,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'parent-portal',
    name: 'Parent Portal',
    description: 'Parent login to monitor student progress',
    url: 'https://deigratiams.edu.gh/users/parent-login/',
    category: 'Parent Portal',
    displayOrder: 4,
    isActive: true,
    backgroundColor: '#9C27B0',
    textColor: '#FFFFFF',
    requiresAuth: true,
    openInNewTab: false,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'teacher-portal',
    name: 'Teacher Portal',
    description: 'Teacher dashboard for class management',
    url: 'https://deigratiams.edu.gh/users/teacher-login/',
    category: 'Staff Portal',
    displayOrder: 5,
    isActive: true,
    backgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    requiresAuth: true,
    openInNewTab: false,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staff-portal',
    name: 'Non-Teaching Staff Portal',
    description: 'Staff login for administrative tasks',
    url: 'https://deigratiams.edu.gh/users/login/',
    category: 'Staff Portal',
    displayOrder: 6,
    isActive: true,
    backgroundColor: '#607D8B',
    textColor: '#FFFFFF',
    requiresAuth: true,
    openInNewTab: false,
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'uschool-online',
    name: 'USchool Online',
    description: 'USchool online learning management system',
    url: 'https://app.uschoolonline.com/Public/Login?ReturnUrl=%2fDefault',
    category: 'Learning Management',
    displayOrder: 7,
    isActive: true,
    backgroundColor: '#E91E63',
    textColor: '#FFFFFF',
    requiresAuth: true,
    openInNewTab: false,
    iconUrl: 'https://www.uschoolonline.com/assets/images/logo.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// POST - Create new application
app.post('/api/applications', (req, res) => {
  try {
    const { name, description, category, url, iconUrl, backgroundColor, textColor } = req.body;

    // Validation
    if (!name || !description || !category || !url) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, category, url'
      });
    }

    const newApplication = {
      id: String(Date.now()), // Simple ID generation
      name,
      description,
      category,
      url,
      iconUrl: iconUrl || null,
      backgroundColor: backgroundColor || '#1976D2',
      textColor: textColor || '#FFFFFF',
      displayOrder: applications.length + 1,
      isActive: true,
      requiresAuth: false,
      openInNewTab: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    applications.push(newApplication);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: newApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating application: ' + error.message
    });
  }
});

// PUT - Update application
app.put('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const applicationIndex = applications.findIndex(app => app.id === id);

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update the application
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: applications[applicationIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application: ' + error.message
    });
  }
});

// DELETE - Delete application
app.delete('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;

    const applicationIndex = applications.findIndex(app => app.id === id);

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const deletedApplication = applications.splice(applicationIndex, 1)[0];

    res.json({
      success: true,
      message: 'Application deleted successfully',
      data: deletedApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting application: ' + error.message
    });
  }
});

// Mock auth login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@dgms.edu' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful (Test Mode)',
      data: {
        token: 'test-jwt-token-' + Date.now(),
        user: {
          id: 'test-user-id',
          username: 'admin',
          email: 'admin@dgms.edu',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          lastLogin: new Date().toISOString()
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DGMS Hub Test Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test API: http://localhost:${PORT}/api/test`);
  console.log(`Mock Applications: http://localhost:${PORT}/api/applications`);
  console.log('');
  console.log('⚠️  TEST MODE: Running without database connection');
  console.log('   Use this for initial testing and development');
});

module.exports = app;
