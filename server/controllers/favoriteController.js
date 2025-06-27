import User from "../models/User.js";
import { errorHandler } from "../utils/error.js";

// Add a cultural site to user's favorites
export const addToFavorites = async (req, res, next) => {
  try {
    const { siteId } = req.body;
    const userId = req.user.id;

    if (!siteId) {
      return next(errorHandler(400, "Cultural site ID is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const added = await user.addFavorite(siteId);

    if (added) {
      res.status(200).json({ message: "Added to favorites successfully" });
    } else {
      res.status(200).json({ message: "Site already in favorites" });
    }
  } catch (error) {
    next(error);
  }
};

// Remove a cultural site from user's favorites
export const removeFromFavorites = async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const userId = req.user.id;

    if (!siteId) {
      return next(errorHandler(400, "Cultural site ID is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const removed = await user.removeFavorite(siteId);

    if (removed) {
      res.status(200).json({ message: "Removed from favorites successfully" });
    } else {
      res.status(200).json({ message: "Site was not in favorites" });
    }
  } catch (error) {
    next(error);
  }
};

// Get all favorites for a user
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("favorites");
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    next(error);
  }
};
