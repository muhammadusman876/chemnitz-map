# 🏛️ Chemnitz Uncovered

A comprehensive full-stack web application designed to revolutionize how people discover, explore, and engage with cultural heritage sites in Chemnitz, Germany. Built using the MERN stack (MongoDB, Express.js, React, Node.js) with modern technologies and gamification elements to create an immersive cultural exploration experience.

## ✨ Features

### 🔐 Authentication & User Management

- JWT-based authentication with HTTP-only cookies
- User registration and login functionality
- Role-based access control (User/Admin)
- Protected routes and user profiles

### 🗺️ Interactive Mapping & Location Services

- Interactive Leaflet maps with cultural site markers
- GPS-based proximity detection for authentic check-ins
- District-based site categorization
- Real-time location tracking

### 🎯 Gamification & Progress Tracking

- Point system and user leaderboards
- Achievement badges and milestones
- Personal progress tracking and statistics
- Visit history and favorites management

### 🎨 Modern UI/UX

- Responsive design using Material-UI (MUI)
- Dark/Light theme support
- TypeScript for enhanced developer experience
- Real-time notifications with React Hot Toast

### 👤 User Features

- Personal dashboard with visit statistics
- Favorite sites management
- Profile customization
- Cultural site discovery and exploration

### 🛠️ Administrative Tools

- Admin dashboard for content management
- Cultural site data management
- User administration and analytics
- Upload and manage site images

## 🏗️ Project Structure

```
mern-auth-app/
├── 📁 client/                    # Frontend React application
│   ├── 📁 public/               # Static assets and data
│   │   ├── 📄 Stadtteil-Karte-Chemnitz.svg  # District map
│   │   └── 📁 data/             # GeoJSON data files
│   │       └── Chemnitz.geojson
│   ├── 📁 src/                  # Source code
│   │   ├── 📁 api/              # API integration layer
│   │   │   ├── authApi.ts       # Authentication API calls
│   │   │   ├── districtApi.ts   # District management
│   │   │   ├── mapApi.ts        # Map and location services
│   │   │   └── visitApi.ts      # Visit tracking
│   │   ├── 📁 components/       # Reusable UI components
│   │   │   ├── 📁 Auth/         # Authentication components
│   │   │   ├── 📁 badges/       # Achievement system
│   │   │   ├── 📁 Layout/       # App layout components
│   │   │   ├── 📁 map/          # Map-related components
│   │   │   └── 📁 profile/      # User profile management
│   │   ├── 📁 context/          # React context providers
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 pages/            # Main application pages
│   │   ├── 📁 services/         # Background services
│   │   ├── 📁 types/            # TypeScript type definitions
│   │   └── 📁 utils/            # Utility functions
│   ├── 📄 package.json          # Frontend dependencies
│   ├── 📄 vite.config.ts        # Vite configuration
│   └── 📄 tsconfig.json         # TypeScript configuration
├── 📁 server/                   # Backend Node.js application
│   ├── 📁 config/               # Database configuration
│   │   └── db.js                # MongoDB connection
│   ├── 📁 controllers/          # Business logic controllers
│   │   ├── authController.js    # User authentication
│   │   ├── cultController.js    # Cultural sites management
│   │   ├── districtController.js # District data
│   │   ├── favoriteController.js # User favorites
│   │   └── userVisitController.js # Visit tracking
│   ├── 📁 middleware/           # Express middleware
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── errorHandler.js      # Error handling
│   ├── 📁 models/               # MongoDB/Mongoose models
│   │   ├── CultureSite.js       # Cultural site schema
│   │   ├── District.js          # District schema
│   │   ├── User.js              # User schema
│   │   └── UserVisit.js         # Visit tracking schema
│   ├── 📁 routes/               # API route definitions
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   ├── cultRoutes.js        # Cultural sites endpoints
│   │   ├── districtRoutes.js    # District endpoints
│   │   ├── favoriteRoutes.js    # Favorites endpoints
│   │   └── userVisitRoutes.js   # Visit tracking endpoints
│   ├── 📁 scripts/              # Database utility scripts
│   ├── 📁 uploads/              # User uploaded images
│   ├── 📁 utils/                # Server utility functions
│   ├── 📄 package.json          # Backend dependencies
│   └── 📄 server.js             # Server entry point
└── 📄 README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd mern-auth-app
   ```

2. **Install server dependencies:**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**

   ```bash
   cd ../client
   npm install
   ```

### 🚀 Running the Application

#### Development Mode

1. **Set up environment variables:**

   Before starting the server, create a `.env` file inside the `server` directory with the following content:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://usmankhan87015:bWG5azxauITOIHMq@cluster0.vx1lj2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=abc123
   ```

2. **Start the server (from project root):**

   ```bash
   cd server
   npm run dev
   ```

   Server will run on `http://localhost:5000`

3. **Start the client (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on `http://localhost:3000`

#### Production Mode

1. **Build the client:**

   ```bash
   cd client
   npm run build
   ```

2. **Start the server:**
   ```bash
   cd server
   npm start
   ```

### 🗄️ Database Setup

The application will automatically connect to MongoDB using the provided connection string. Make sure MongoDB is running locally or provide a valid MongoDB Atlas connection string.

**Optional**: Import sample cultural sites data using the provided scripts in `server/scripts/`.

## 🛠️ Technology Stack

### Frontend

- **React 19.1.0** - User interface library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - React component library
- **React Router DOM** - Client-side routing
- **Leaflet & React-Leaflet** - Interactive maps
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Notification system

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Development Tools

- **ESLint** - Code linting
- **Nodemon** - Auto-restart development server
- **Dotenv** - Environment variable management

## 📱 Application Features

### 🏠 Landing Page

- Overview of the Cultural Sites Explorer
- Feature highlights and getting started guide
- Responsive design for all devices

### 🗺️ Interactive Map

- Real-time cultural site exploration
- GPS-based proximity check-ins
- District-based filtering and categorization
- Detailed site information and images

### 👤 User Dashboard

- Personal progress statistics
- Visit history and achievements
- Favorite sites management
- Leaderboard rankings

### 🔐 Authentication System

- Secure user registration and login
- JWT-based session management
- Protected routes and role-based access
- Profile management

## 📚 API Documentation

For detailed API documentation, including all endpoints, request/response schemas, and authentication details, see:

- **[API Documentation](./API-DOCUMENTATION.md)** - Complete API reference
- **[Project Report](./PROJECT-REPORT.md)** - Comprehensive project analysis

## 🗺️ Key API Endpoints

```bash
# Authentication
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/me          # Get current user

# Cultural Sites
GET  /api/sites            # Get all cultural sites
GET  /api/sites/:id        # Get specific site
POST /api/sites            # Create new site (Admin)

# User Visits
POST /api/visits           # Check-in to a site
GET  /api/visits/user      # Get user's visit history
GET  /api/visits/leaderboard # Get leaderboard

# Districts
GET  /api/districts        # Get all districts
GET  /api/districts/:id    # Get specific district

# Favorites
POST /api/favorites        # Add to favorites
GET  /api/favorites        # Get user favorites
DELETE /api/favorites/:id  # Remove from favorites
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

Developed as a comprehensive MERN stack demonstration project showcasing modern web development practices, authentication systems, and interactive mapping technologies.

## 🙏 Acknowledgments

- Cultural heritage data for Chemnitz, Germany
- Open source mapping libraries (Leaflet)
- Material-UI component library
- MongoDB and Express.js communities

---

**Note**: This application is designed specifically for exploring cultural sites in Chemnitz, Germany, but the architecture can be adapted for other cities and regions.
