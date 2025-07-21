// DGMS Hub Backend with Hardcoded Applications
// Simple, reliable, no database needed!
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded DGMS Applications - Always available, never lost!
const DGMS_APPLICATIONS = [
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

// In-memory storage for any additional applications (will reset on server restart, but core apps always remain)
let additionalApplications = [];

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
    message: 'DGMS Hub Backend API with Hardcoded Applications',
    status: 'running',
    version: '3.0.0',
    storage: 'Hardcoded + Memory',
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
app.get('/health', (req, res) => {
  const totalApps = DGMS_APPLICATIONS.length + additionalApplications.length;
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    storage: 'Hardcoded Applications',
    applications: {
      total: totalApps,
      hardcoded: DGMS_APPLICATIONS.length,
      additional: additionalApplications.length
    },
    message: 'DGMS Hub Backend with Hardcoded Applications is running'
  });
});

// GET - Get all applications (hardcoded + additional)
app.get('/api/applications', (req, res) => {
  try {
    // Combine hardcoded applications with any additional ones
    const allApplications = [...DGMS_APPLICATIONS, ...additionalApplications];
    
    // Sort by display order
    allApplications.sort((a, b) => a.displayOrder - b.displayOrder);

    res.json({
      success: true,
      data: {
        applications: allApplications,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: allApplications.length,
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

// POST - Create new application (adds to additional applications)
app.post('/api/applications', (req, res) => {
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

    // Get next display order (after all existing applications)
    const allApps = [...DGMS_APPLICATIONS, ...additionalApplications];
    const maxOrder = Math.max(...allApps.map(app => app.displayOrder), 0);

    // Create new application
    const newApplication = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      url,
      category,
      displayOrder: maxOrder + 1,
      isActive: true,
      backgroundColor,
      textColor,
      requiresAuth,
      openInNewTab,
      iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to additional applications (in memory)
    additionalApplications.push(newApplication);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: newApplication
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating application: ' + error.message
    });
  }
});

// PUT - Update application (only additional applications can be updated)
app.put('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if it's a hardcoded application (cannot be updated)
    const isHardcoded = DGMS_APPLICATIONS.find(app => app.id === id);
    if (isHardcoded) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update hardcoded DGMS applications'
      });
    }

    // Find in additional applications
    const appIndex = additionalApplications.findIndex(app => app.id === id);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update the application
    additionalApplications[appIndex] = {
      ...additionalApplications[appIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: additionalApplications[appIndex]
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application: ' + error.message
    });
  }
});

// DELETE - Delete application (only additional applications can be deleted)
app.delete('/api/applications/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's a hardcoded application (cannot be deleted)
    const isHardcoded = DGMS_APPLICATIONS.find(app => app.id === id);
    if (isHardcoded) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete hardcoded DGMS applications'
      });
    }

    // Find in additional applications
    const appIndex = additionalApplications.findIndex(app => app.id === id);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Remove the application
    const deletedApp = additionalApplications.splice(appIndex, 1)[0];

    res.json({
      success: true,
      message: 'Application deleted successfully',
      data: deletedApp
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
app.get('/api/applications/meta/categories', (req, res) => {
  try {
    // Get unique categories from all applications
    const allApps = [...DGMS_APPLICATIONS, ...additionalApplications];
    const categories = [...new Set(allApps.filter(app => app.isActive).map(app => app.category))];
    
    res.json({
      success: true,
      data: categories.length > 0 ? categories : ['Main', 'Academic', 'Student Portal', 'Parent Portal', 'Staff Portal', 'Learning Management']
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories: ' + error.message
    });
  }
});

// Start server immediately (no database setup needed)
app.listen(PORT, () => {
  console.log(`🚀 DGMS Hub Hardcoded Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Storage: Hardcoded Applications + Memory`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API: http://localhost:${PORT}/api/applications`);
  console.log('');
  console.log('✅ HARDCODED MODE: Core DGMS applications always available');
  console.log(`   📚 ${DGMS_APPLICATIONS.length} hardcoded applications loaded:`);
  DGMS_APPLICATIONS.forEach((app, index) => {
    console.log(`     ${index + 1}. ${app.name} - ${app.url}`);
  });
  console.log('   📝 Additional applications stored in memory (reset on restart)');
  console.log('   🔒 Core applications cannot be deleted or modified');
});

module.exports = app;
