# DGMS Hub Backend API

## Deployment Instructions for Railway

This backend provides API endpoints for the DGMS Hub mobile application.

### Quick Deploy to Railway

1. Push this folder to GitHub
2. Connect to Railway
3. Deploy automatically

### Environment Variables (Optional)
- `PORT` - Automatically set by Railway
- `NODE_ENV` - Set to 'production' by Railway

### API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/applications` - Get all applications
- `GET /api/applications/meta/categories` - Get categories
- `POST /api/auth/login` - Authentication

### Features

- Mock data for testing
- CORS enabled for mobile apps
- Rate limiting
- Security middleware
- Logging

### Test Mode

Currently running in test mode with mock data. No database required.
