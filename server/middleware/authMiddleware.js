import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Updated middleware to use cookies instead of Authorization header
const authMiddleware = (req, res, next) => {
  // Get token from cookie instead of header
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated, please login" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Match your token structure (just id)
    next();
  } catch (err) {
    res.status(401).json({ message: "Authentication invalid" });
  }
};

// Generate JWT - Keep this the same
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export { authMiddleware, generateToken };
