// Database Setup Script for Render PostgreSQL
// This script will create the applications table if it doesn't exist

const { Sequelize, DataTypes } = require('sequelize');

// Get database URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ No DATABASE_URL or POSTGRES_URL environment variable found');
  console.log('ℹ️  For local development, set DATABASE_URL=postgres://username:password@localhost:5432/dbname');
  process.exit(1);
}

console.log('🔌 Connecting to database...');
console.log('📍 Database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log, // Show SQL queries during setup
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Application Model (same as in database-server.js)
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

async function setupDatabase() {
  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Create tables
    console.log('🔄 Creating/updating database tables...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables created/updated');

    // Check if we have any applications
    const appCount = await Application.count();
    console.log(`📊 Current applications in database: ${appCount}`);

    if (appCount === 0) {
      console.log('ℹ️  Database is empty - ready for new applications');
    } else {
      console.log('ℹ️  Database contains existing applications');
      
      // List existing applications
      const apps = await Application.findAll({
        attributes: ['id', 'name', 'url', 'isActive'],
        order: [['displayOrder', 'ASC']]
      });
      
      console.log('📋 Existing applications:');
      apps.forEach((app, index) => {
        console.log(`  ${index + 1}. ${app.name} - ${app.url} ${app.isActive ? '✅' : '❌'}`);
      });
    }

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('🚀 Your applications will now persist across server restarts');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run setup
setupDatabase();
