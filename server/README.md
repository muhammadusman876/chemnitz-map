# MERN Authentication Application

This is a MERN stack application that implements JWT authentication. The application consists of a client-side React application and a server-side Node.js application.

## Server Setup

The server is built using Express and MongoDB. It handles user authentication, including registration and login, using JSON Web Tokens (JWT).

### Installation

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory and add the following environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Server

To start the server, run the following command:
```
npm start
```

The server will run on `http://localhost:5000` by default.

### API Endpoints

- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Log in an existing user and receive a JWT token.

### Middleware

The application includes middleware for protecting routes and verifying JWT tokens.

### Database

The application uses MongoDB to store user data. Ensure that your MongoDB instance is running and accessible.

## Client Setup

The client is built using React and Tailwind CSS for styling.

### Installation

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

### Running the Client

To start the client application, run the following command:
```
npm start
```

The client will run on `http://localhost:3000` by default.

## Conclusion

This application provides a basic structure for implementing authentication in a MERN stack application. You can extend it by adding more features and improving the user interface.