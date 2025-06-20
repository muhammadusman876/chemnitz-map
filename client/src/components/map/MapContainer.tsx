import React, { useState, useEffect } from 'react';
import Map from './Map';
import CulturalSitesList from './CulturalSitesList';

const MapContainer = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory
      ? `http://localhost:5000/api/admin?category=${encodeURIComponent(selectedCategory)}`
      : 'http://localhost:5000/api/admin/';
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load GeoJSON data');
        }
        return response.json();
      })
      .then(data => {
        // Convert array of sites to GeoJSON FeatureCollection
        const features = data
          .filter(
            (site: any) =>
              site.coordinates &&
              typeof site.coordinates.lng === 'number' &&
              typeof site.coordinates.lat === 'number'
          )
          .map((site: any) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [site.coordinates.lng, site.coordinates.lat]
            },
            properties: {
              _id: site._id,
              name: site.name,
              category: site.category,
              description: site.description,
              website: site.website,
              address: site.address,
              operator: site.operator,
              opening_hours: site.opening_hours,
              wheelchair: site.wheelchair,
              fee: site.fee,
              cuisine: site.cuisine,
              phone: site.phone,
              artist_name: site.artist_name,
              artwork_type: site.artwork_type,
              material: site.material,
              start_date: site.start_date,
              museum: site.museum,
              tourism: site.tourism,
              amenity: site.amenity,
              historic: site.historic
            },
            id: site._id
          }));
        setGeoJsonData({
          type: "FeatureCollection",
          features
        });
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading GeoJSON data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [selectedCategory]);

  if (loading) return <div>Loading map data...</div>;
  if (error) return <div>Error loading map: {error}</div>;

  return (
    <div className="map-container">
      <h2>Chemnitz Cultural Sites Map</h2>
      <CulturalSitesList
        onSiteClick={setSelectedCoords}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <Map
        geoJsonData={geoJsonData}
        selectedCoords={selectedCoords}
        userLocation={userLocation}
        setUserLocation={setUserLocation} // Pass setter for floating button in Map
      />
    </div>
  );
};

export default MapContainer;