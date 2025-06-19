/**
 * Transforms a GeoJSON Feature object into a MongoDB document.
 * @param {Object} feature - A GeoJSON Feature object.
 * @returns {Object} - A MongoDB-ready document.
 */
const geojsonToMongoDoc = (feature) => {
  if (!feature || !feature.properties || !feature.geometry) {
    throw new Error('Invalid GeoJSON Feature');
  }

  const props = feature.properties;
  const coords = feature.geometry.coordinates;

  // Determine category from available properties
  const category = props.tourism || props.amenity || props.historic || "Other";

  // Build address object if any address fields exist
  const addressFields = ['addr:street', 'addr:housenumber', 'addr:postcode', 'addr:city', 'addr:country'];
  const address = {};
  addressFields.forEach(field => {
    if (props[field]) {
      // Remove 'addr:' prefix for MongoDB field names
      address[field.replace('addr:', '')] = props[field];
    }
  });

  return {
    name: props.name || "Unnamed Site",
    category,
    description: props.description || "",
    coordinates: {
      lat: coords[1], // GeoJSON: [lng, lat]
      lng: coords[0]
    },
    address: Object.keys(address).length > 0 ? address : undefined,
    website: props.website || undefined
    // Add more fields as needed
  };
};

export default geojsonToMongoDoc;

