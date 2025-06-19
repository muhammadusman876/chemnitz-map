/**
 * Transforms a GeoJSON Feature object into a MongoDB document.
 * @param {Object} feature - A GeoJSON Feature object.
 * @returns {Object} - A MongoDB-ready document.
 */
const geojsonToMongoDoc = (feature) => {
  if (!feature || !feature.properties || !feature.geometry) {
    throw new Error("Invalid GeoJSON Feature");
  }

  const props = feature.properties;
  const coords = feature.geometry.coordinates;

  // Determine category from available properties
  const category = props.tourism || props.amenity || props.historic || "Other";

  // Build address object if any address fields exist
  const addressFields = [
    "addr:street",
    "addr:housenumber",
    "addr:postcode",
    "addr:city",
    "addr:country",
  ];
  const address = {};
  addressFields.forEach((field) => {
    if (props[field]) {
      address[field.replace("addr:", "")] = props[field];
    }
  });

  return {
    name: props.name || "Unnamed Site",
    category,
    description: props.description || "",
    coordinates: {
      lat: coords[1],
      lng: coords[0],
    },
    address: Object.keys(address).length > 0 ? address : undefined,
    website: props.website || undefined,
    operator: props.operator || undefined,
    opening_hours: props.opening_hours || undefined,
    wheelchair: props.wheelchair || undefined,
    fee: props.fee || undefined,
    cuisine: props.cuisine || undefined,
    phone: props.phone || undefined,
    artist_name: props.artist_name || undefined,
    artwork_type: props.artwork_type || undefined,
    material: props.material || undefined,
    start_date: props.start_date || undefined,
    museum: props.museum || undefined,
    tourism: props.tourism || undefined,
    amenity: props.amenity || undefined,
    historic: props.historic || undefined,
  };
};

export default geojsonToMongoDoc;
