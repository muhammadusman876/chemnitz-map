import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String }, // Profile picture URL
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String }, // Optional: human-readable address
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "CulturalSite" }],
    // Removed redundant visitedSites array
    // Optional: Add this reference if you want direct access from User
    progress: { type: mongoose.Schema.Types.ObjectId, ref: "UserVisit" },
    role: { type: String, default: "user" },
    settings: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      mapPreferences: {
        showVisited: { type: Boolean, default: true },
        highlightConquered: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// Method to add a site to favorites
userSchema.methods.addFavorite = async function (siteId) {
  // Check if the site is not already in favorites
  if (!this.favorites.includes(siteId)) {
    this.favorites.push(siteId);
    await this.save();
    return true; // Successfully added
  }
  return false; // Already in favorites
};

// Method to remove a site from favorites
userSchema.methods.removeFavorite = async function (siteId) {
  if (this.favorites.includes(siteId)) {
    this.favorites = this.favorites.filter(
      (favorite) => favorite.toString() !== siteId.toString()
    );
    await this.save();
    return true; // Successfully removed
  }
  return false; // Not in favorites
};

const User = mongoose.model("User", userSchema);

export default User;
