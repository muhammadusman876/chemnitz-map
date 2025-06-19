import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  street: String,
  housenumber: String,
  postcode: String,
  city: String,
  country: String
}, { _id: false });

const CulturalSiteSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  address: AddressSchema,
  website: String
});

const CulturalSite = mongoose.model('CulturalSite', CulturalSiteSchema);
export default CulturalSite;