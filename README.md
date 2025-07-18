# DGMS_HUB - School Web Applications Hub

A comprehensive mobile application system that serves as a centralized hub for students to access various web applications used by the school.

## System Architecture

The system consists of three main components:

1. **Mobile Application** (React Native) - Student-facing mobile app
2. **Backend API** (Node.js/Express) - RESTful API for data management
3. **Admin Panel** (React.js) - Web-based management interface

## Project Structure

```
DGMS_HUB/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   ├── package.json
│   └── server.js
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Images, icons, etc.
│   ├── android/            # Android-specific files
│   ├── ios/                # iOS-specific files (future)
│   └── package.json
├── admin-panel/            # React.js admin interface
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── public/
│   └── package.json
├── database/               # Database scripts and migrations
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
├── docs/                   # Documentation
│   ├── api/                # API documentation
│   ├── deployment/         # Deployment guides
│   └── user-manual/        # User manuals
└── scripts/                # Build and deployment scripts
```

## Technology Stack

- **Backend**: Node.js, Express.js, PostgreSQL, JWT Authentication
- **Mobile App**: React Native, React Navigation, AsyncStorage
- **Admin Panel**: React.js, Material-UI, Axios
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: HTTPS/SSL, JWT tokens, bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- React Native development environment
- Android Studio (for Android development)

### Installation

1. Clone the repository
2. Set up the database (see database/README.md)
3. Install and run the backend (see backend/README.md)
4. Install and run the admin panel (see admin-panel/README.md)
5. Install and run the mobile app (see mobile/README.md)

## Features

### Mobile Application
- Splash screen with school branding
- Intuitive home screen with web application icons
- In-app browser (WebView) with navigation controls
- Offline mode and error handling
- Push notifications support (future enhancement)
- About Us/Contact section

### Admin Panel
- Secure authentication for IT personnel
- Add/edit/delete web applications
- Icon upload and management
- Application reordering
- User management
- Audit logging

### Backend API
- RESTful API endpoints
- JWT-based authentication
- Application CRUD operations
- User management
- File upload handling
- Audit trail logging

## Security Features

- HTTPS/SSL encryption
- JWT token authentication
- Password hashing with bcrypt
- Input sanitization and validation
- CORS protection
- Rate limiting

## Deployment

- Backend: Cloud hosting (AWS/Google Cloud/Azure)
- Admin Panel: Static hosting or same server as backend
- Mobile App: Google Play Store
- Database: Cloud PostgreSQL instance

## License

Proprietary - DGMS School System
