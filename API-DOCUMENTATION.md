# 🏛️ Cultural Sites Explorer - API Documentation

## Table of Contents

- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Cultural Sites Routes](#cultural-sites-routes)
  - [Districts Routes](#districts-routes)
  - [Favorites Routes](#favorites-routes)
  - [User Progress Routes](#user-progress-routes)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Testing Guidelines](#testing-guidelines)

---

## Overview

The Cultural Sites Explorer API is a RESTful service that powers a MERN stack application for discovering and tracking visits to cultural sites in Chemnitz, Germany. The API provides comprehensive functionality for user management, site exploration, progress tracking, and administrative operations.

### Key Features

- JWT-based authentication with HTTP-only cookies
- Cultural site discovery and categorization
- Geographic district management
- User favorites and progress tracking
- Leaderboard and gamification
- Role-based access control (User/Admin)

---

## Base Configuration

### Base URL

```
http://localhost:5000/api
```

### Environment Setup

- **Development Port**: 5000
- **Database**: MongoDB
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: Local uploads directory
- **CORS**: Enabled for `http://localhost:3000`

### Headers

```
Content-Type: application/json
```

For file uploads:

```
Content-Type: multipart/form-data
```

---

## Authentication

The API uses JWT tokens stored in HTTP-only cookies for session management. Authentication is handled automatically through cookie headers.

### Authentication Flow

1. User registers or logs in
2. Server sets HTTP-only cookie with JWT token
3. Subsequent requests automatically include cookie
4. Server validates token for protected routes

### Role-Based Access

- **User**: Default role, access to personal data and public endpoints
- **Admin**: Full access including data management and user administration

---

## API Endpoints

## Authentication Routes

### Base Path: `/api/auth`

#### 1. Register User

```http
POST /api/auth/register
```

**Description**: Create a new user account

**Request Body**:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):

```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "message": "Registration successful"
}
```

**Error Responses**:

- `400`: User already exists / Username taken
- `500`: Server error

---

#### 2. Login User

```http
POST /api/auth/login
```

**Description**: Authenticate user and create session

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):

```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "message": "Login successful"
}
```

**Error Responses**:

- `400`: Invalid credentials
- `500`: Server error

---

#### 3. Logout User

```http
POST /api/auth/logout
```

**Description**: Clear user session and authentication cookie

**Response** (200 OK):

```json
{
  "message": "Logout successful"
}
```

---

#### 4. Get Current User

```http
GET /api/auth/me
```

**Description**: Get currently authenticated user information

**Authentication**: Required

**Response** (200 OK):

```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "uploads/1751145633599.JPG",
    "settings": {
      "theme": "light",
      "mapPreferences": {
        "showVisited": true,
        "highlightConquered": true
      }
    }
  }
}
```

---

#### 5. Update User Profile

```http
PUT /api/auth/user
```

**Description**: Update user profile information

**Authentication**: Required

**Request Body**:

```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "settings": {
    "theme": "dark",
    "mapPreferences": {
      "showVisited": false
    }
  }
}
```

---

#### 6. Update Password

```http
PUT /api/auth/password
```

**Description**: Change user password

**Authentication**: Required

**Request Body**:

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

---

#### 7. Upload Avatar

```http
POST /api/auth/avatar
```

**Description**: Upload user profile picture

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Form Data**:

- `avatar`: Image file (JPEG, PNG, etc.)

**Response** (200 OK):

```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "uploads/1751145633599.JPG"
}
```

---

#### 8. Delete Avatar

```http
DELETE /api/auth/avatar
```

**Description**: Remove user profile picture

**Authentication**: Required

---

## Cultural Sites Routes

### Base Path: `/api/culturalsites`

#### 1. Get Sites by Category

```http
GET /api/culturalsites?category=museum
```

**Description**: Retrieve cultural sites filtered by category

**Query Parameters**:

- `category` (optional): Filter by site category (museum, theater, gallery, etc.)

**Response** (200 OK):

```json
{
  "sites": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Chemnitz Museum",
      "category": "museum",
      "description": "Local history museum",
      "location": {
        "type": "Point",
        "coordinates": [12.9216, 50.8357]
      },
      "address": "Theaterplatz 1, 09111 Chemnitz",
      "district": "Zentrum"
    }
  ]
}
```

---

#### 2. Get All Categories

```http
GET /api/culturalsites/categories
```

**Description**: Get list of all available cultural site categories

**Response** (200 OK):

```json
{
  "categories": [
    "museum",
    "theater",
    "gallery",
    "monument",
    "park",
    "cultural_center"
  ]
}
```

---

#### 3. Get Sites for Map

```http
GET /api/culturalsites/map
```

**Description**: Get all cultural sites with coordinates for map visualization

**Response** (200 OK):

```json
{
  "sites": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Chemnitz Museum",
      "category": "museum",
      "coordinates": [12.9216, 50.8357],
      "district": "Zentrum"
    }
  ]
}
```

---

#### 4. Check-in to Nearby Site

```http
POST /api/culturalsites/checkin
```

**Description**: Check-in to a cultural site within proximity

**Authentication**: Required

**Request Body**:

```json
{
  "siteId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "userLocation": {
    "lat": 50.8357,
    "lng": 12.9216
  }
}
```

**Response** (200 OK):

```json
{
  "message": "Check-in successful",
  "visit": {
    "siteId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "visitedAt": "2025-06-30T10:30:00.000Z",
    "points": 10
  }
}
```

---

#### 5. Delete All Sites (Admin Only)

```http
DELETE /api/culturalsites/sites
```

**Description**: Remove all cultural sites from database

**Authentication**: Required (Admin role)

---

#### 6. Get Sites Count (Admin Only)

```http
GET /api/culturalsites/count
```

**Description**: Get total count of cultural sites in database

**Authentication**: Required (Admin role)

**Response** (200 OK):

```json
{
  "count": 150,
  "message": "Total sites count retrieved"
}
```

---

#### 7. Import GeoJSON Data (Admin Only)

```http
POST /api/culturalsites/import-geojson
```

**Description**: Import cultural sites from GeoJSON file

**Authentication**: Required (Admin role)

**Request Body**:

```json
{
  "geojsonData": {
    "type": "FeatureCollection",
    "features": [...]
  }
}
```

---

## Districts Routes

### Base Path: `/api/districts`

#### 1. Get All Districts

```http
GET /api/districts/list
```

**Description**: Retrieve list of all city districts

**Response** (200 OK):

```json
{
  "districts": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "Zentrum",
      "sitesCount": 25,
      "area": 5.2
    },
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Kaßberg",
      "sitesCount": 18,
      "area": 3.8
    }
  ]
}
```

---

#### 2. Get District GeoJSON

```http
GET /api/districts/geojson
```

**Description**: Get geographic boundaries of districts in GeoJSON format

**Response** (200 OK):

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Zentrum",
        "sitesCount": 25
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      }
    }
  ]
}
```

---

#### 3. Get Sites by District

```http
GET /api/districts/{district}
```

**Description**: Get cultural sites within a specific district

**Path Parameters**:

- `district`: District name (e.g., "Zentrum", "Kaßberg")

**Response** (200 OK):

```json
{
  "district": "Zentrum",
  "sites": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Chemnitz Museum",
      "category": "museum",
      "address": "Theaterplatz 1, 09111 Chemnitz"
    }
  ]
}
```

---

#### 4. Import Districts GeoJSON (Admin Only)

```http
POST /api/districts/import
```

**Description**: Import district boundaries from GeoJSON data

**Authentication**: Required (Admin role)

---

#### 5. Assign Districts to Sites (Admin Only)

```http
POST /api/districts/assign-districts
```

**Description**: Automatically assign district locations to cultural sites

**Authentication**: Required (Admin role)

---

## Favorites Routes

### Base Path: `/api/favorites`

#### 1. Add to Favorites

```http
POST /api/favorites/add
```

**Description**: Add a cultural site to user's favorites list

**Authentication**: Required

**Request Body**:

```json
{
  "siteId": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

**Response** (200 OK):

```json
{
  "message": "Site added to favorites",
  "favorite": {
    "siteId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "addedAt": "2025-06-30T10:30:00.000Z"
  }
}
```

---

#### 2. Remove from Favorites

```http
DELETE /api/favorites/remove/{siteId}
```

**Description**: Remove a site from user's favorites

**Authentication**: Required

**Path Parameters**:

- `siteId`: Cultural site ID to remove

**Response** (200 OK):

```json
{
  "message": "Site removed from favorites"
}
```

---

#### 3. Get User Favorites

```http
GET /api/favorites
```

**Description**: Retrieve all sites in user's favorites list

**Authentication**: Required

**Response** (200 OK):

```json
{
  "favorites": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Chemnitz Museum",
      "category": "museum",
      "district": "Zentrum",
      "addedAt": "2025-06-30T10:30:00.000Z"
    }
  ]
}
```

---

## User Progress Routes

### Base Path: `/api/progress`

#### 1. Check-in to Site

```http
POST /api/progress/checkin
```

**Description**: Record a user visit/check-in to a cultural site

**Authentication**: Required

**Request Body**:

```json
{
  "siteId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "location": {
    "lat": 50.8357,
    "lng": 12.9216
  },
  "notes": "Great exhibition on local history"
}
```

**Response** (200 OK):

```json
{
  "message": "Check-in successful",
  "visit": {
    "siteId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "visitedAt": "2025-06-30T10:30:00.000Z",
    "points": 10,
    "notes": "Great exhibition on local history"
  },
  "totalPoints": 150,
  "rank": 5
}
```

---

#### 2. Get User Progress

```http
GET /api/progress/current-progress
```

**Description**: Get current user's visit progress and statistics

**Authentication**: Required

**Response** (200 OK):

```json
{
  "progress": {
    "totalVisits": 25,
    "totalPoints": 150,
    "rank": 5,
    "visitedDistricts": ["Zentrum", "Kaßberg", "Schönau"],
    "completedCategories": ["museum", "gallery"],
    "badges": [
      {
        "name": "Explorer",
        "description": "Visited 10 sites",
        "earnedAt": "2025-06-25T15:20:00.000Z"
      }
    ]
  }
}
```

---

#### 3. Get Progress Map Data

```http
GET /api/progress/map-data
```

**Description**: Get user's visited sites for map visualization

**Authentication**: Required

**Response** (200 OK):

```json
{
  "visitedSites": [
    {
      "siteId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Chemnitz Museum",
      "coordinates": [12.9216, 50.8357],
      "visitedAt": "2025-06-30T10:30:00.000Z",
      "points": 10
    }
  ],
  "unvisitedSites": [
    {
      "siteId": "64f8a1b2c3d4e5f6a7b8c9d4",
      "name": "Opera House",
      "coordinates": [12.9226, 50.8367]
    }
  ]
}
```

---

#### 4. Get Leaderboard

```http
GET /api/progress/leaderboard
```

**Description**: Get public leaderboard of top users by visits

**Response** (200 OK):

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "explorer123",
      "totalVisits": 45,
      "totalPoints": 350,
      "avatar": "uploads/avatar1.jpg"
    },
    {
      "rank": 2,
      "username": "culturefan",
      "totalVisits": 38,
      "totalPoints": 290,
      "avatar": null
    }
  ]
}
```

---

#### 5. Reset User Progress (Admin Only)

```http
DELETE /api/progress/reset/{userId}
```

**Description**: Reset a specific user's visit progress

**Authentication**: Required (Admin role)

**Path Parameters**:

- `userId`: Target user ID to reset

---

## Data Models

### User Model

```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  avatar: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  favorites: [ObjectId], // Reference to CulturalSite
  progress: ObjectId,    // Reference to UserVisit
  role: String,          // "user" | "admin"
  settings: {
    theme: String,       // "light" | "dark"
    mapPreferences: {
      showVisited: Boolean,
      highlightConquered: Boolean
    }
  },
  timestamps: true
}
```

### Cultural Site Model

```javascript
{
  name: String,
  category: String,
  description: String,
  location: {
    type: "Point",
    coordinates: [Number, Number] // [lng, lat]
  },
  address: String,
  district: String,
  openingHours: Object,
  website: String,
  phone: String,
  images: [String],
  timestamps: true
}
```

### User Visit Model

```javascript
{
  userId: ObjectId,      // Reference to User
  siteId: ObjectId,      // Reference to CulturalSite
  visitedAt: Date,
  points: Number,
  notes: String,
  location: {
    lat: Number,
    lng: Number
  },
  timestamps: true
}
```

### District Model

```javascript
{
  name: String,
  geometry: Object,      // GeoJSON geometry
  area: Number,
  population: Number,
  sitesCount: Number,
  timestamps: true
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (Admin access required)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `422`: Validation Error
- `500`: Internal Server Error

### Common Error Messages

- `"User already exists"`: Registration with existing email
- `"Invalid credentials"`: Login with wrong email/password
- `"Admin access required"`: Attempting admin operation without admin role
- `"Site not found"`: Referencing non-existent cultural site
- `"Already in favorites"`: Adding duplicate favorite
- `"Check-in too far from site"`: Location verification failed

---

## Testing Guidelines

### Postman Collection Setup

1. Create environment variables:

   ```
   base_url: http://localhost:5000/api
   user_token: {{token}} (auto-set by login)
   ```

2. Authentication Flow:

   - First, register or login to set authentication cookie
   - Use cookie authentication for protected routes

3. Test Data:
   - Use valid coordinates for Chemnitz area
   - Test with different user roles (user/admin)
   - Verify proximity requirements for check-ins

### Example Test Scenarios

1. **User Registration Flow**:

   - Register new user
   - Login with credentials
   - Update profile
   - Upload avatar

2. **Cultural Sites Exploration**:

   - Get all sites
   - Filter by category
   - Add to favorites
   - Check-in to site

3. **Progress Tracking**:

   - View user progress
   - Check leaderboard position
   - View map data

4. **Admin Operations**:
   - Import GeoJSON data
   - Assign districts to sites
   - Reset user progress

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Coordinates follow GeoJSON standard [longitude, latitude]
- File uploads are stored in `/uploads` directory
- Maximum proximity for check-ins: 100 meters
- Points awarded per visit: 10 points base + category bonuses
- Admin operations require explicit role verification

This API documentation provides comprehensive coverage of all endpoints in the Cultural Sites Explorer application. For additional support or questions, please refer to the project repository or contact the development team.
