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
        if (distance <= 80) {
          checkedInSite = site;
          break;
        }
      }
    }

    if (!checkedInSite) {
      return res.status(200).json({
        success: false,
        message:
          "You need to be within 50 meters of a cultural site to check in.",
        nearbyRequired: true,
      });
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
      } else {
        // Fallback: Initialize missing districtProgress entry
        const totalSitesInDistrict = await CulturalSite.countDocuments({
          district: checkedInSite.district,
        });
        userVisit.districtProgress.push({
          district: checkedInSite.district,
          totalSites: totalSitesInDistrict,
          visitedSites: [checkedInSite._id],
          completed: totalSitesInDistrict === 1, // Completed if this is the only site
        });
        userVisit.totalBadges += 1; // Award badge for discovering a new district
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

    // Get user with populated favorites
    const userWithFavorites = await User.findById(userId).populate("favorites");

    if (!userVisit) {
      // Get all available categories and districts to show 0 progress
      const allCategories = await CulturalSite.distinct("category");
      const allDistricts = await CulturalSite.distinct("district");

      // Create empty category progress
      const emptyCategoryProgress = await Promise.all(
        allCategories.map(async (category) => {
          const totalSites = await CulturalSite.countDocuments({ category });
          return {
            category,
            totalSites,
            visitedSites: [],
            completed: false,
          };
        })
      );

      // Create empty district progress
      const emptyDistrictProgress = await Promise.all(
        allDistricts.map(async (district) => {
          const totalSites = await CulturalSite.countDocuments({ district });
          return {
            district,
            totalSites,
            visitedSites: [],
            completed: false,
          };
        })
      );

      return res.json({
        totalVisits: 0,
        totalBadges: 0,
        categoryProgress: emptyCategoryProgress,
        districtProgress: emptyDistrictProgress,
        recentVisits: [],
        favoriteSites: userWithFavorites?.favorites || [],
      });
    }

    // User has progress data
    // Ensure categoryProgress is properly initialized (for existing users)
    if (
      !userVisit.categoryProgress ||
      userVisit.categoryProgress.length === 0
    ) {
      // Get all available categories
      const allCategories = await CulturalSite.distinct("category");
      userVisit.categoryProgress = [];

      for (const category of allCategories) {
        const totalSitesInCategory = await CulturalSite.countDocuments({
          category,
        });

        // Find visited sites in this category from user's visit history
        const visitedSitesInCategory = [];
        for (const visit of userVisit.visitedSites) {
          if (!visit || !visit.site) continue; // Skip if visit or site is null

          let siteId;
          if (typeof visit.site === "string") {
            siteId = visit.site;
          } else if (visit.site._id) {
            siteId = visit.site._id;
          } else {
            continue; // Skip if we can't determine the site ID
          }

          const site = await CulturalSite.findById(siteId);
          if (site && site.category === category) {
            visitedSitesInCategory.push(siteId);
          }
        }

        userVisit.categoryProgress.push({
          category,
          totalSites: totalSitesInCategory,
          visitedSites: visitedSitesInCategory,
          completed: visitedSitesInCategory.length >= totalSitesInCategory,
        });
      }

      // Save the updated user visit data
      await userVisit.save();
    }

    return res.json({
      totalVisits: userVisit.visitedSites.length,
      totalBadges: userVisit.totalBadges,
      categoryProgress: userVisit.categoryProgress,
      districtProgress: userVisit.districtProgress,
      recentVisits: userVisit.visitedSites.slice(-5), // Last 5 visits
      favoriteSites: userWithFavorites?.favorites || [],
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

    // Get all sites
    const allSites = await CulturalSite.find({});

    if (!userVisit) {
      // Return all sites as unvisited
      const mapData = allSites.map((site) => ({
        ...site.toObject(),
        isVisited: false,
        districtCompleted: false,
      }));

      return res.json(mapData);
    }

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

// Get monthly leaderboard data
export const getLeaderboard = async (req, res) => {
  try {
    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Get users who have visited sites this month
    const userVisits = await UserVisit.find({
      "visitedSites.visitDate": {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    })
      .populate("userId", "username avatar")
      .lean();

    // Calculate monthly stats for each user
    const leaderboard = userVisits
      .filter((visit) => visit.userId && visit.userId.username) // Filter out users with null userId
      .map((visit) => {
        // Filter visits to only this month
        const monthlyVisits = visit.visitedSites.filter(
          (v) =>
            new Date(v.visitDate) >= startOfMonth &&
            new Date(v.visitDate) <= endOfMonth
        );

        // Get latest visit date from this month
        const latestVisit =
          monthlyVisits.length > 0
            ? new Date(
                Math.max(...monthlyVisits.map((v) => new Date(v.visitDate)))
              )
            : null;

        // Get first visit date (join date) - earliest visit ever
        const joinDate =
          visit.visitedSites.length > 0
            ? new Date(
                Math.min(
                  ...visit.visitedSites.map((v) => new Date(v.visitDate))
                )
              )
            : null;

        return {
          username: visit.userId.username,
          avatar: visit.userId.avatar,
          totalBadges: visit.totalBadges || 0,
          visitedSites: visit.visitedSites.length, // Total all-time visits
          monthlyVisits: monthlyVisits.length, // This month's visits
          completedCategories: visit.categoryProgress
            ? visit.categoryProgress.filter((cp) => cp.completed).length
            : 0,
          completedDistricts: visit.districtProgress
            ? visit.districtProgress.filter((dp) => dp.completed).length
            : 0,
          latestVisitDate: latestVisit,
          joinDate: joinDate, // First visit date as join date
        };
      })
      .filter((user) => user.monthlyVisits > 0) // Only users with visits this month
      .sort((a, b) => {
        // Sort by monthly visits first, then by latest visit date
        if (b.monthlyVisits !== a.monthlyVisits) {
          return b.monthlyVisits - a.monthlyVisits;
        }
        return new Date(b.latestVisitDate) - new Date(a.latestVisitDate);
      })
      .slice(0, 10); // Top 10

    return res.json({
      leaderboard,
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
      totalActiveUsers: leaderboard.length,
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: error.message });
  }
};
