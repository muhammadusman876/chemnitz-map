import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix Leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ geoJsonData }) => {
    const chemnitzCoordinates: [number, number] = [50.8621274, 12.9677156];
    const mapRef = useRef(null);
    const clusterLayerRef = useRef(null);

    useEffect(() => {
        if (!geoJsonData || !mapRef.current) return;

        // Clean up previous layers
        if (clusterLayerRef.current) {
            clusterLayerRef.current.clearLayers();
            mapRef.current.removeLayer(clusterLayerRef.current);
        }

        // Create a cluster group for markers with customized settings
        clusterLayerRef.current = L.markerClusterGroup({
            chunkedLoading: true,           // Load markers in chunks to prevent freezing
            maxClusterRadius: 40,           // Maximum radius of a cluster
            spiderfyOnMaxZoom: true,        // Spiderfy when clicking a cluster at max zoom
            showCoverageOnHover: true,      // Show coverage polygon on hover
            zoomToBoundsOnClick: true,      // Zoom to bounds of cluster on click
            disableClusteringAtZoom: 18     // At high zoom levels, don't cluster points
        });

        // Create GeoJSON layer with custom popup for each feature
        const geoJsonLayer = L.geoJSON(geoJsonData, {
            pointToLayer: (feature, latlng) => {
                // Process only point features
                if (feature.geometry.type === 'Point') {
                    const props = feature.properties;

                    // Create marker
                    const marker = L.marker(latlng);

                    // Create informative popup content based on available properties
                    let popupContent = `<div class="custom-popup">`;

                    // Add name if available
                    if (props.name) {
                        popupContent += `<h3>${props.name}</h3>`;
                    }

                    // Add type information
                    if (props.tourism) {
                        popupContent += `<p><strong>Type:</strong> ${props.tourism}</p>`;
                    } else if (props.amenity) {
                        popupContent += `<p><strong>Type:</strong> ${props.amenity}</p>`;
                    }

                    // Add address information if available
                    let address = [];
                    if (props['addr:street'] && props['addr:housenumber']) {
                        address.push(`${props['addr:street']} ${props['addr:housenumber']}`);
                    }
                    if (props['addr:postcode'] && props['addr:city']) {
                        address.push(`${props['addr:postcode']} ${props['addr:city']}`);
                    }
                    if (address.length > 0) {
                        popupContent += `<p><strong>Address:</strong> ${address.join(', ')}</p>`;
                    }

                    // Add opening hours if available
                    if (props.opening_hours) {
                        popupContent += `<p><strong>Opening Hours:</strong> ${props.opening_hours}</p>`;
                    }

                    // Add website link if available
                    if (props.website) {
                        popupContent += `<p><a href="${props.website}" target="_blank" rel="noopener noreferrer">Visit Website</a></p>`;
                    } else if (props['website:menu']) {
                        popupContent += `<p><a href="${props['website:menu']}" target="_blank" rel="noopener noreferrer">Visit Menu</a></p>`;
                    }

                    popupContent += `</div>`;

                    // Bind the popup to the marker
                    marker.bindPopup(popupContent);
                    return marker;
                }
                return null;
            },
            // Handle non-point features (if any)
            style: (feature) => {
                return {
                    color: '#3388ff',
                    weight: 2,
                    fillOpacity: 0.2
                };
            },
            // Filter function to handle only Point features for clustering
            filter: (feature) => {
                return feature.geometry.type === 'Point';
            }
        });

        // Add GeoJSON layer to the cluster group
        clusterLayerRef.current.addLayer(geoJsonLayer);

        // Add the cluster group to the map
        mapRef.current.addLayer(clusterLayerRef.current);

        // Fit bounds to show all markers
        try {
            const bounds = clusterLayerRef.current.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15  // Don't zoom in too much
                });
            }
        } catch (e) {
            console.warn("Could not fit bounds:", e);
            // Fall back to default center and zoom
            mapRef.current.setView(chemnitzCoordinates, 13);
        }

        // Cleanup function
        return () => {
            if (clusterLayerRef.current && mapRef.current) {
                mapRef.current.removeLayer(clusterLayerRef.current);
            }
        };
    }, [geoJsonData]);

    return (
        <div className="map-container-wrapper">
            <MapContainer
                center={chemnitzCoordinates}
                zoom={13}
                style={{ height: "600px", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
        </div>
    );
};

export default Map;