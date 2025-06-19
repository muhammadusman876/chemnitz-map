import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


// Default marker icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CATEGORY_COLORS: Record<string, string> = {
    museum: '#2563eb',      // blue
    restaurant: '#16a34a',  // green
    artwork: '#f59e42',     // orange
    theatre: '#a21caf',     // purple
    hotel: '#e11d48',       // red
    // ...add more as needed
};

function getCategoryIcon(category: string) {
    const color = CATEGORY_COLORS[category] || '#64748b'; // default gray
    return L.divIcon({
        className: '',
        html: `<svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="16" rx="14" ry="14" fill="${color}" stroke="#222" stroke-width="2"/>
      <rect x="14" y="30" width="4" height="8" rx="2" fill="${color}" stroke="#222" stroke-width="2"/>
    </svg>`,
        iconSize: [32, 41],
        iconAnchor: [16, 41],
        popupAnchor: [0, -41],
    });
}

// Selected marker icon (red and bigger)
const SelectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: iconShadow,
  iconSize: [35, 51],
  iconAnchor: [17, 51],
});

interface MapProps {
  geoJsonData: any;
  selectedCoords: [number, number] | null;
}

const Map: React.FC<MapProps> = ({ geoJsonData, selectedCoords }) => {
  const chemnitzCoordinates: [number, number] = [50.8621274, 12.9677156];
  const mapRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<L.MarkerClusterGroup | null>(null);

  // Helper to compare coordinates
  const isSelected = (lat: number, lng: number) =>
    selectedCoords &&
    Math.abs(lat - selectedCoords[0]) < 1e-6 &&
    Math.abs(lng - selectedCoords[1]) < 1e-6;

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(chemnitzCoordinates, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Remove previous cluster layer if exists
    if (clusterLayerRef.current) {
      clusterLayerRef.current.clearLayers();
      mapRef.current.removeLayer(clusterLayerRef.current);
    }

    // Create cluster group
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
    });

    // Add GeoJSON features as markers to the cluster group
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties;
        const markerIcon = isSelected(latlng.lat, latlng.lng)
          ? SelectedIcon
          : getCategoryIcon(props.category);

        let popupContent = `<div style="min-width:200px">`;
        if (props.name) popupContent += `<h3 style="margin-bottom:4px">${props.name}</h3>`;
        if (props.category) popupContent += `<p><strong>Category:</strong> ${props.category}</p>`;
        if (props.description) popupContent += `<p>${props.description}</p>`;
        if (props.operator) popupContent += `<p><strong>Operator:</strong> ${props.operator}</p>`;
        if (props.opening_hours) popupContent += `<p><strong>Opening Hours:</strong> ${props.opening_hours}</p>`;
        if (props.fee) popupContent += `<p><strong>Fee:</strong> ${props.fee}</p>`;
        if (props.cuisine) popupContent += `<p><strong>Cuisine:</strong> ${props.cuisine}</p>`;
        if (props.phone) popupContent += `<p><strong>Phone:</strong> ${props.phone}</p>`;
        if (props.artist_name) popupContent += `<p><strong>Artist:</strong> ${props.artist_name}</p>`;
        if (props.artwork_type) popupContent += `<p><strong>Artwork Type:</strong> ${props.artwork_type}</p>`;
        if (props.material) popupContent += `<p><strong>Material:</strong> ${props.material}</p>`;
        if (props.start_date) popupContent += `<p><strong>Year:</strong> ${props.start_date}</p>`;
        if (props.wheelchair) popupContent += `<p><strong>Wheelchair:</strong> ${props.wheelchair}</p>`;
        if (props.website) popupContent += `<p><a href="${props.website}" target="_blank" rel="noopener noreferrer">Website</a></p>`;

        // Address block
        if (
          props.address &&
          (props.address.street ||
            props.address.housenumber ||
            props.address.postcode ||
            props.address.city ||
            props.address.country)
        ) {
          const addressParts = [
            props.address.street && props.address.housenumber
              ? `${props.address.street} ${props.address.housenumber}`
              : props.address.street,
            props.address.postcode,
            props.address.city,
            props.address.country,
          ].filter(Boolean);
          popupContent += `<p><strong>Address:</strong> ${addressParts.join(', ')}</p>`;
        }

        popupContent += `</div>`;
        return L.marker(latlng, { icon: markerIcon, riseOnHover: true }).bindPopup(popupContent);
      },
    });

    clusterGroup.addLayer(geoJsonLayer);
    clusterGroup.addTo(mapRef.current);
    clusterLayerRef.current = clusterGroup;

    // Fit bounds to show all markers
    try {
      const bounds = clusterGroup.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      }
    } catch {
      mapRef.current.setView(chemnitzCoordinates, 13);
    }

    return () => {
      if (mapRef.current && clusterLayerRef.current) {
        clusterLayerRef.current.clearLayers();
        mapRef.current.removeLayer(clusterLayerRef.current);
      }
    };
  }, [geoJsonData, selectedCoords]);

  // Pan/zoom to selected marker
  useEffect(() => {
    if (selectedCoords && mapRef.current) {
      mapRef.current.setView(selectedCoords, 16, { animate: true });
    }
  }, [selectedCoords]);

  return <div id="map" style={{ height: '600px', width: '100%' }} />;
};

export default Map;