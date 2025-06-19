# MERN JWT Authentication with Tailwind CSS

This project is a full-stack application built using the MERN stack (MongoDB, Express, React, Node.js) that implements JWT authentication. The client-side is developed using React and styled with Tailwind CSS.

## Features

- User registration and login functionality
- Protected routes that require authentication
- Responsive design using Tailwind CSS
- User dashboard displaying user-specific information

## Project Structure

```
mern-auth-app
├── client                  # Client-side application
│   ├── public              # Public assets
│   ├── src                 # Source code for React application
│   ├── package.json        # Client dependencies and scripts
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── README.md           # Client documentation
├── server                  # Server-side application
│   ├── controllers         # Authentication logic
│   ├── middleware          # JWT verification middleware
│   ├── models              # Mongoose models
│   ├── routes              # API routes
│   ├── config              # Database configuration
│   ├── .env                # Environment variables
│   ├── server.js           # Server entry point
│   └── README.md           # Server documentation
└── README.md               # Overall project documentation
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mern-auth-app
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the `server` directory and add your MongoDB connection string and JWT secret.

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

The application should now be running on `http://localhost:3000`.

## License

This project is licensed under the MIT License.