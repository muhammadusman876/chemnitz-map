import UserVisit from "../models/UserVisit.js";
import CulturalSite from "../models/CultureSite.js";
import User from "../models/User.js";
import getDistanceFromLatLonInMeters from "../utils/distanceFromLatLon.js";

// Check in to a nearby cultural site
export const checkInToSite = async (req, res) => {
  try {
    const userId = req.user?.id; // Use authenticated user ID
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    // Find nearby sites within 50 meters
    const sites = await CulturalSite.find({});
    let checkedInSite = null;

    for (const site of sites) {
      if (site.coordinates?.lat && site.coordinates?.lng) {
        const distance = getDistanceFromLatLonInMeters(
          lat,
          lng,
          site.coordinates.lat,
          site.coordinates.lng
        );
        if (distance <= 50) {
          checkedInSite = site;
          break;
        }
      }
    }

    if (!checkedInSite) {
      return res
        .status(404)
        .json({ message: "No nearby site found for check-in." });
    }

    // Find or create user visit record
    let userVisit = await UserVisit.findOne({ userId });

    if (!userVisit) {
      // Initialize user visit tracking
      userVisit = new UserVisit({
        userId,
        visitedSites: [],
        categoryProgress: [],
        districtProgress: [],
      });

      // Initialize categoryProgress
      const categories = await CulturalSite.distinct("category");
      for (const category of categories) {
        const totalSitesInCategory = await CulturalSite.countDocuments({
          category,
        });
        userVisit.categoryProgress.push({
          category,
          totalSites: totalSitesInCategory,
          visitedSites: [],
          completed: false,
        });
      }

      // Initialize districtProgress
      const districts = await CulturalSite.distinct("district");
      for (const district of districts) {
        const totalSitesInDistrict = await CulturalSite.countDocuments({
          district,
        });
        userVisit.districtProgress.push({
          district,
          totalSites: totalSitesInDistrict,
          visitedSites: [],
          completed: false,
        });
      }
    }

    // Check if already visited
    const alreadyVisited = userVisit.visitedSites.some(
      (visit) => visit.site.toString() === checkedInSite._id.toString()
    );

    if (!alreadyVisited) {
      // Add to visitedSites
      userVisit.visitedSites.push({
        site: checkedInSite._id,
        visitDate: new Date(),
      });

      // Update category progress
      const categoryProgress = userVisit.categoryProgress.find(
        (cp) => cp.category === checkedInSite.category
      );

      if (categoryProgress) {
        categoryProgress.visitedSites.push(checkedInSite._id);

        // Check if category is complete
        if (
          categoryProgress.visitedSites.length >= categoryProgress.totalSites
        ) {
          categoryProgress.completed = true;
          userVisit.totalBadges += 1;
        }
      }

      // Update district progress
      const districtProgress = userVisit.districtProgress.find(
        (dp) => dp.district === checkedInSite.district
      );

      if (districtProgress) {
        districtProgress.visitedSites.push(checkedInSite._id);

        // Check if district is complete
        if (
          districtProgress.visitedSites.length >= districtProgress.totalSites
        ) {
          districtProgress.completed = true;
          userVisit.totalBadges += 1;
        }
      }

      // Save changes
      await userVisit.save();

      // Update reference in User model if needed
      await User.findByIdAndUpdate(userId, { progress: userVisit._id });

      return res.json({
        success: true,
        message: "Checked in successfully!",
        site: checkedInSite,
        newVisit: true,
        badges: {
          categoryCompleted: categoryProgress?.completed,
          districtCompleted: districtProgress?.completed,
          totalBadges: userVisit.totalBadges,
        },
      });
    }

    return res.json({
      success: true,
      message: "Already checked in to this site before.",
      site: checkedInSite,
      newVisit: false,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ error: error.message });
  }
};

// In your backend progress controller
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let userVisit = await UserVisit.findOne({ userId })
      .populate("visitedSites.site")
      .populate("categoryProgress.visitedSites")
      .populate("districtProgress.visitedSites");

    if (!userVisit) {
      return res
        .status(404)
        .json({ message: "No progress found for this user" });
    }

    // Get user with populated favorites
    const userWithFavorites = await User.findById(userId)
      .populate('favorites'); // Add this line

    return res.json({
      totalVisits: userVisit.visitedSites.length,
      totalBadges: userVisit.totalBadges,
      categoryProgress: userVisit.categoryProgress,
      districtProgress: userVisit.districtProgress,
      recentVisits: userVisit.visitedSites.slice(-5), // Last 5 visits
      favoriteSites: userWithFavorites?.favorites || [], // Add this line
    });
  } catch (error) {
    console.error("Error getting user progress:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get progress map data
export const getProgressMapData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userVisit = await UserVisit.findOne({ userId });
    if (!userVisit) {
      return res.status(404).json({ message: "No progress found" });
    }

    // Get all sites
    const allSites = await CulturalSite.find({});

    // Create map data with visit status
    const mapData = allSites.map((site) => {
      const isVisited = userVisit.visitedSites.some(
        (visit) => visit.site.toString() === site._id.toString()
      );

      const districtCompleted =
        userVisit.districtProgress.find((dp) => dp.district === site.district)
          ?.completed || false;

      return {
        ...site.toObject(),
        isVisited,
        districtCompleted,
      };
    });

    return res.json(mapData);
  } catch (error) {
    console.error("Error getting map data:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get leaderboard data
export const getLeaderboard = async (req, res) => {
  try {
    // Get top users by badges
    const userVisits = await UserVisit.find()
      .sort({ totalBadges: -1 })
      .limit(10)
      .populate("userId", "username avatar");

    const leaderboard = userVisits.map((visit) => ({
      username: visit.userId.username,
      avatar: visit.userId.avatar,
      totalBadges: visit.totalBadges,
      visitedSites: visit.visitedSites.length,
      completedCategories: visit.categoryProgress.filter((cp) => cp.completed)
        .length,
      completedDistricts: visit.districtProgress.filter((dp) => dp.completed)
        .length,
    }));

    return res.json(leaderboard);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
};

// Reset user progress (admin or user request)
export const resetUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const isAdmin = req.user?.role === "admin";

    // Allow reset only for own account or if admin
    if (req.user?.id !== userId && !isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await UserVisit.findOneAndDelete({ userId });

    // Update user reference
    await User.findByIdAndUpdate(userId, { $unset: { progress: "" } });

    return res.json({ message: "Progress reset successfully" });
  } catch (error) {
    console.error("Error resetting progress:", error);
    res.status(500).json({ error: error.message });
  }
};
