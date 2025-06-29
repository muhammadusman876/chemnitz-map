import mongoose from "mongoose";

const DistrictSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  geometry: { type: Object, required: true }, // GeoJSON geometry
  siteCount: { type: Number, default: 0 },
});

const District = mongoose.model("District", DistrictSchema);
export default District;
