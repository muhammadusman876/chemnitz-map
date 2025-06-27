import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import userLocationIcon from '../../assets/shooting-target-color-icon(1).svg'; // adjust the path as needed
import { checkinToNearbySite } from '../../api/mapApi';
import { getMe } from '../../api/authApi';
import { Fab, Tooltip, Chip, Stack, Paper, useTheme } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

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
  userLocation?: { lat: number; lng: number } | null;
  setUserLocation?: (loc: { lat: number; lng: number }) => void;
  themeMode?: "light" | "dark";
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  categories: string[];
  setSelectedSite?: (site: any) => void; // <-- Add this prop
}

const Map: React.FC<MapProps> = ({
  geoJsonData,
  selectedCoords,
  userLocation,
  setUserLocation,
  themeMode,
  selectedCategory,
  setSelectedCategory,
  categories,
  setSelectedSite,
}) => {
  const chemnitzCoordinates: [number, number] = [50.8621274, 12.9677156];
  const mapRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<L.MarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Store visited site IDs for the current user
  const [visitedSites, setVisitedSites] = useState<string[]>([]);
  const theme = useTheme();

  // Helper to compare coordinates
  const isSelected = (lat: number, lng: number) =>
    selectedCoords &&
    Math.abs(lat - selectedCoords[0]) < 1e-6 &&
    Math.abs(lng - selectedCoords[1]) < 1e-6;

  // Fetch visited sites for the current user on mount
  useEffect(() => {
    async function fetchVisited() {
      try {
        const res = await getMe();
        if (res.status === 200) {
          const user = res.data.user;
          if (user.visitedSites && user.visitedSites.length > 0 && typeof user.visitedSites[0] === 'object') {
            setVisitedSites(user.visitedSites.map((site: any) => site._id));
          } else {
            setVisitedSites(user.visitedSites || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch visited sites", err);
      }
    }
    fetchVisited();
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(chemnitzCoordinates, 13);
    }
  }, []);

  // Handle tile layer switching on theme change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous tile layer if exists
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    // Add new tile layer with correct theme
    let tileUrl =
      themeMode === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    let tileOptions: any = {
      maxZoom: 19,
      attribution:
        themeMode === "dark"
          ? '&copy; <a href="https://carto.com/">CartoDB</a>'
          : '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    };

    if (themeMode === "dark") {
      tileOptions.subdomains = "abcd";
    }

    tileLayerRef.current = L.tileLayer(tileUrl, tileOptions).addTo(mapRef.current);
  }, [themeMode]);

  // Handle cluster and markers (do not refit bounds on theme change)
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous cluster layer if exists
    if (clusterLayerRef.current) {
      clusterLayerRef.current.clearLayers();
      mapRef.current.removeLayer(clusterLayerRef.current);
    }

    // Sites mode - use marker clustering
    // @ts-ignore
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
    });

    // Add GeoJSON features as markers to the cluster group
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties;
        // Use a special icon if site is visited
        const isVisited = visitedSites.includes(props._id);
        const markerIcon = isVisited
          ? L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', // Example: green check icon
            iconSize: [32, 41],
            iconAnchor: [16, 41],
            popupAnchor: [0, -41],
          })
          : isSelected(latlng.lat, latlng.lng)
            ? SelectedIcon
            : getCategoryIcon(props.category);

        // Create marker
        const marker = L.marker(latlng, { icon: markerIcon, riseOnHover: true });

        // Instead of popup, handle click to show details in sidebar
        marker.on('click', () => {
          if (setSelectedSite) setSelectedSite(props);
        });

        // Optionally, you can still bind a minimal popup:
        // marker.bindPopup(`<b>${props.name}</b>`);

        return marker;
      },
    });

    clusterGroup.addLayer(geoJsonLayer);
    clusterGroup.addTo(mapRef.current);
    clusterLayerRef.current = clusterGroup;

    // Fit bounds to show all markers (only on data change, not theme change)
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
  }, [geoJsonData, selectedCoords, visitedSites, setSelectedSite]);

  // Pan/zoom to selected marker
  useEffect(() => {
    if (selectedCoords && mapRef.current) {
      mapRef.current.setView(selectedCoords, 16, { animate: true });
    }
  }, [selectedCoords]);

  // Add or update user location marker and pan/zoom
  useEffect(() => {
    if (userLocation && mapRef.current) {
      // Remove previous user marker if exists
      if (userMarkerRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
      }
      // Remove previous circle if exists
      if (userCircleRef.current) {
        mapRef.current.removeLayer(userCircleRef.current);
      }
      // Add new user marker
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({
          iconUrl: userLocationIcon, // user icon
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
        title: 'Your Location',
      }).addTo(mapRef.current).bindPopup('Your Location');
      // Add 50m radius circle
      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: 50,
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(mapRef.current);
      // Pan/zoom to user location
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    }
  }, [userLocation]);

  // Automatic location polling every 5 minutes
  useEffect(() => {
    if (!setUserLocation) return;
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          }
        );
      }
    }, 300000); // 5 minutes in ms

    return () => clearInterval(interval);
  }, [setUserLocation]);

  // Check-in logic: call backend when userLocation changes
  useEffect(() => {
    async function checkInToNearbySite(userLocation: { lat: number; lng: number }) {
      try {
        const res = await checkinToNearbySite(userLocation);
        const data = res.data;
        if (res.status === 200) {
          // Add the site to visitedSites state if not already present
          if (data.site && !visitedSites.includes(data.site._id)) {
            setVisitedSites((prev) => [...prev, data.site._id]);
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    if (userLocation) {
      checkInToNearbySite(userLocation);
    }
    // eslint-disable-next-line
  }, [userLocation]);

  // Floating "locate me" button
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current || !setUserLocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
      },
      () => {
        alert('Unable to retrieve your location.');
      },
      { enableHighAccuracy: true }
    );
  };

  // --- Category Filter Overlay ---
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Category filter overlay */}
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1201,
          px: 2,
          py: 1,
          borderRadius: 3,
          background: theme.palette.mode === 'dark' ? "#23232b" : "#fff",
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 200,
          maxWidth: "90vw",
          overflowX: "auto"
        }}
      >
        <Stack direction="row" spacing={1} sx={{ width: "100%", overflowX: "auto" }}>
          <Chip
            label="All"
            color={selectedCategory === "" ? "primary" : "default"}
            onClick={() => setSelectedCategory("")}
            sx={{
              fontWeight: 600,
              minWidth: 64,
              cursor: 'pointer',
              borderRadius: 2,
              boxShadow: selectedCategory === "" ? 2 : 0,
            }}
          />
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}
              color={selectedCategory === cat ? "primary" : "default"}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 600,
                background: selectedCategory === cat ? CATEGORY_COLORS[cat] : "#f1f5f9",
                color: selectedCategory === cat ? "#fff" : "#222",
                minWidth: 64,
                cursor: 'pointer',
                borderRadius: 2,
                boxShadow: selectedCategory === cat ? 2 : 0,
                transition: "all 0.2s"
              }}
            />
          ))}
        </Stack>
      </Paper>
      {/* Map */}
      <div id="map" style={{ width: "100%", height: "100%" }} />
      <Tooltip title="Go to my location" placement="left">
        <Fab
          color="primary"
          onClick={handleLocateMe}
          sx={{
            position: "absolute",
            bottom: 32,
            right: 32,
            zIndex: 1000,
            boxShadow: 4,
          }}
          aria-label="locate me"
        >
          <MyLocationIcon />
        </Fab>
      </Tooltip>
    </div>
  );
};

export default Map;