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
    message: 'DGMS Hub Backend Server is running (Test Mode - No Database)'
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

// Mock applications endpoint
app.get('/api/applications', (req, res) => {
  const mockApplications = [
    {
      id: '1',
      name: 'Student Portal',
      description: 'Access your grades, schedules, and academic information',
      url: 'https://portal.dgms.edu',
      category: 'Academic',
      displayOrder: 1,
      isActive: true,
      backgroundColor: '#1976D2',
      textColor: '#FFFFFF',
      requiresAuth: false,
      openInNewTab: false,
      iconUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Library Catalog',
      description: 'Search and reserve books from the school library',
      url: 'https://library.dgms.edu',
      category: 'Academic',
      displayOrder: 2,
      isActive: true,
      backgroundColor: '#388E3C',
      textColor: '#FFFFFF',
      requiresAuth: false,
      openInNewTab: false,
      iconUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Learning Management System',
      description: 'Access course materials, assignments, and online classes',
      url: 'https://lms.dgms.edu',
      category: 'Academic',
      displayOrder: 3,
      isActive: true,
      backgroundColor: '#F57C00',
      textColor: '#FFFFFF',
      requiresAuth: false,
      openInNewTab: false,
      iconUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'School Email',
      description: 'Access your school email account',
      url: 'https://mail.dgms.edu',
      category: 'Communication',
      displayOrder: 4,
      isActive: true,
      backgroundColor: '#D32F2F',
      textColor: '#FFFFFF',
      requiresAuth: false,
      openInNewTab: false,
      iconUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Cafeteria Menu',
      description: 'View daily menu and nutritional information',
      url: 'https://cafeteria.dgms.edu',
      category: 'Services',
      displayOrder: 5,
      isActive: true,
      backgroundColor: '#7B1FA2',
      textColor: '#FFFFFF',
      requiresAuth: false,
      openInNewTab: false,
      iconUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: {
      applications: mockApplications,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockApplications.length,
        itemsPerPage: 50
      }
    }
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
