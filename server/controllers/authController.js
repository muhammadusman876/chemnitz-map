import User from "../models/User.js";
import UserVisit from "../models/UserVisit.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/authMiddleware.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register a new user
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Check if username is taken
    // user = await User.findOne({ username });
    // if (user)
    //   return res.status(400).json({ message: "Username is already taken" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send user data (without password)
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      message: "Registration successful",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = generateToken(user._id);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send user data
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
export const logout = (req, res) => {
  // Clear the cookie
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's visited sites from UserVisit model
    const userVisit = await UserVisit.findOne({ userId: req.user.id });
    const visitedSites =
      userVisit?.visitedSites?.map((visit) => visit.site) || [];

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        favorites: user.favorites,
        visitedSites: visitedSites,
        role: user.role,
        settings: user.settings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const userId = req.user?.id; // Use req.user.id if using auth middleware
    const updateFields = { ...req.body };

    // Prevent updating sensitive fields directly
    delete updateFields.password; // Password should be updated via separate endpoint
    delete updateFields.role;
    delete updateFields.email; // Optional: prevent email change

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update user.", error: err.message });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user with password field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update password", error: error.message });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Example: /uploads/filename.png
    const avatarUrl = `/uploads/${req.file.filename}`;

    // Update user's avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    res.json({ avatar: user.avatar, message: "Avatar updated" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to upload avatar", error: err.message });
  }
};

// Delete avatar
export const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user and get current avatar path
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user has an avatar, delete the file from filesystem
    if (user.avatar) {
      // Fix the path - user.avatar already contains '/uploads/filename'
      // So we need to remove the leading slash and get just the filename
      const filename = user.avatar.replace("/uploads/", "");
      const avatarPath = path.join(__dirname, "../uploads", filename);


      // Check if file exists and delete it
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
        console.log("✅ Deleted avatar file:", avatarPath);
      } else {
        console.warn(
          "❗ File does not exist, cannot delete avatar:",
          avatarPath
        );
      }
    }

    // Update user in database to remove avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { avatar: 1 } }, // Remove avatar field
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar removed successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: null, // Explicitly return null
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove avatar" });
  }
};
