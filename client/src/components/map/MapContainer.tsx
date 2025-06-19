import React, { useState, useEffect } from 'react';
import Map from './Map';

const MapContainer = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace this path with your actual GeoJSON file location
    fetch('/data/Chemnitz.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load GeoJSON data');
        }
        return response.json();
      })
      .then(data => {
        console.log("GeoJSON data loaded:", data);
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading GeoJSON data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading map data...</div>;
  if (error) return <div>Error loading map: {error}</div>;

  return (
    <div className="map-container">
      <h2>Chemnitz Railway Museum Map</h2>
      <Map geoJsonData={geoJsonData} />
    </div>
  );
};

export default MapContainer;