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
  website: String,
  operator: String,
  opening_hours: String,
  wheelchair: String,
  fee: String,
  cuisine: String,
  phone: String,
  artist_name: String,
  artwork_type: String,
  material: String,
  start_date: String,
  museum: String,
  tourism: String,
  amenity: String,
  historic: String
});

const CulturalSite = mongoose.model('CulturalSite', CulturalSiteSchema);
export default CulturalSite;