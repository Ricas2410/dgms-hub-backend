# DGMS Hub API Documentation

This document provides comprehensive information about the DGMS Hub REST API.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@dgms.edu",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@dgms.edu",
      "firstName": "System",
      "lastName": "Administrator",
      "role": "admin",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Applications API

### Get All Applications

```http
GET /applications
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "uuid",
        "name": "Student Portal",
        "description": "Access your grades and schedules",
        "url": "https://portal.dgms.edu",
        "iconUrl": "https://yourdomain.com/uploads/icon.png",
        "category": "Academic",
        "displayOrder": 1,
        "isActive": true,
        "backgroundColor": "#1976D2",
        "textColor": "#FFFFFF",
        "requiresAuth": false,
        "openInNewTab": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 50
    }
  }
}
```

### Get Single Application

```http
GET /applications/:id
```

### Create Application (Admin Only)

```http
POST /applications
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "name": "New Application",
  "description": "Application description",
  "url": "https://example.com",
  "category": "Academic",
  "backgroundColor": "#1976D2",
  "textColor": "#FFFFFF",
  "requiresAuth": false,
  "openInNewTab": false,
  "icon": <file>
}
```

### Update Application (Admin Only)

```http
PUT /applications/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### Delete Application (Admin Only)

```http
DELETE /applications/:id
Authorization: Bearer <token>
```

### Reorder Applications (Admin Only)

```http
POST /applications/reorder
Content-Type: application/json
Authorization: Bearer <token>

{
  "applicationIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Get Categories

```http
GET /applications/meta/categories
```

## Users API (Admin Only)

### Get All Users

```http
GET /users
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

### Create User

```http
POST /users
Content-Type: application/json
Authorization: Bearer <token>

{
  "username": "newuser",
  "email": "user@dgms.edu",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "moderator"
}
```

### Update User

```http
PUT /users/:id
Content-Type: application/json
Authorization: Bearer <token>
```

### Delete User

```http
DELETE /users/:id
Authorization: Bearer <token>
```

## Audit API (Admin Only)

### Get Audit Logs

```http
GET /audit
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `action` (optional): Filter by action type
- `entityType` (optional): Filter by entity type
- `userId` (optional): Filter by user ID
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

### Get Audit Statistics

```http
GET /audit/stats
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Headers**: Rate limit information is included in response headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## File Uploads

File uploads are supported for application icons:

- **Maximum Size**: 5MB
- **Supported Formats**: JPEG, PNG, GIF, WebP, SVG
- **Content-Type**: `multipart/form-data`

## Security

### HTTPS

All API communications must use HTTPS in production.

### CORS

Cross-Origin Resource Sharing (CORS) is configured to allow requests from:
- Admin panel domain
- Mobile application (development)

### Input Validation

All input is validated and sanitized:
- SQL injection prevention
- XSS protection
- Input length limits
- Type validation

### Authentication

- JWT tokens expire after 24 hours
- Tokens include user ID, username, and role
- Failed login attempts are logged

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## Webhooks (Future Enhancement)

The API is designed to support webhooks for real-time notifications:

- Application updates
- User management events
- System alerts

## SDK and Libraries

### JavaScript/Node.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://yourdomain.com/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get applications
const applications = await api.get('/applications');
```

### React Native

```javascript
import { api } from './services/api';

// Get applications
const response = await api.getApplications();
```

## Support

For API support and questions:
- **Email**: support@dgms.edu
- **Documentation**: https://docs.dgms.edu/api
- **Status Page**: https://status.dgms.edu
