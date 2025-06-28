import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Updated middleware to use cookies instead of Authorization header
const authMiddleware = async (req, res, next) => {
  // Get token from cookie instead of header
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated, please login" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the full user data including role
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Set complete user data including role
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role, // ← This is what was missing!
    };

    "🔍 Auth middleware set req.user:", req.user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
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
