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
    visitedSites: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CulturalSite" },
    ],
    role: { type: String, default: "user" },
    settings: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
