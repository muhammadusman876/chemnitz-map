// UserVisit.js model for tracking progress
import mongoose from "mongoose";

const BadgeProgressSchema = new mongoose.Schema({
  category: String,
  totalSites: {
    type: Number,
    default: 0,
  },
  visitedSites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "CulturalSite",
    default: [],
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const DistrictProgressSchema = new mongoose.Schema({
  district: String,
  totalSites: {
    type: Number,
    default: 0,
  },
  visitedSites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "CulturalSite",
    default: [],
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const UserVisitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitedSites: [
      {
        site: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CulturalSite",
        },
        visitDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    categoryProgress: [BadgeProgressSchema],
    districtProgress: [DistrictProgressSchema],
    totalBadges: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UserVisit = mongoose.model("UserVisit", UserVisitSchema);
export default UserVisit;
