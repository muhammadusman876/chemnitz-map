import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';

import { checkinToNearbySite } from '../../api/mapApi';
import { getMe } from '../../api/authApi';
import { Fab, Tooltip, Chip, Stack, Paper, useTheme } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import useMediaQuery from '@mui/material/useMediaQuery';
import toast from 'react-hot-toast';

const CATEGORY_COLORS: Record<string, string> = {
  museum: '#dc2626',
  gallery: '#06b6d4',
  artwork: '#F564A9',
  theatre: '#A888B5',
  hotel: '#A27B5C',
  guest_house: '#f97316',
  restaurant: '#10b981',
};

function getCategoryIcon(category: string) {
  const color = CATEGORY_COLORS[category] || '#64748b'; // default gray
  return L.divIcon({
    className: 'modern-marker',
    html: `<div style="
      position: relative;
      width: 32px;
      height: 40px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      transition: all 0.2s ease;
    ">
      <!-- Pin body -->
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.1);
        transform: rotate(-45deg);
        position: relative;
      ">
        <!-- Center dot for precise location -->
        <div style="
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        "></div>
      </div>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

// Selected marker icon (modern highlighted style)
const SelectedIcon = L.divIcon({
  className: 'selected-marker',
  html: `<div style="
    position: relative;
    width: 40px;
    height: 48px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    animation: pulse 2s infinite;
  ">
    <!-- Pin body -->
    <div style="
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border: 4px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4), 0 4px 10px rgba(0,0,0,0.2);
      transform: rotate(-45deg);
      position: relative;
    ">
      <!-- Center dot -->
      <div style="
        width: 12px;
        height: 12px;
        background: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      "></div>
    </div>
  </div>
  <style>
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  </style>`,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
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
  showCategoryFilter: boolean;

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
  showCategoryFilter = true,
}) => {
  const chemnitzCoordinates: [number, number] = [50.8621274, 12.9677156];
  const mapRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<L.MarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Store visited site IDs for the current user
  const [visitedSites, setVisitedSites] = useState<string[]>([]);
  const [shouldPanToUser, setShouldPanToUser] = useState<boolean>(false); // Flag to control panning
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        toast.error("Failed to fetch visited sites. Please try again later.");
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
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        // Modern gradient cluster design with subtle pin inspiration
        const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
        const dimensions = size === 'small' ? 42 : size === 'medium' ? 52 : 62;
        const fontSize = size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px';

        return L.divIcon({
          html: `<div style="
            position: relative;
            width: ${dimensions}px;
            height: ${dimensions}px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <!-- Main cluster circle -->
            <div style="
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              border: 3px solid #ffffff;
              border-radius: 50%;
              width: ${dimensions}px;
              height: ${dimensions}px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3), 0 4px 8px rgba(0,0,0,0.15);
              transition: all 0.2s ease;
              position: relative;
            ">
              <span style="
                color: #ffffff;
                font-weight: 700;
                font-size: ${fontSize};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                z-index: 1;
              ">${count}</span>
              <!-- Subtle location indicator -->
              <div style="
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 6px;
                height: 6px;
                background: rgba(255,255,255,0.8);
                border-radius: 50%;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
              "></div>
            </div>
          </div>`,
          className: 'modern-cluster-icon',
          iconSize: [dimensions, dimensions],
        });
      },
    });

    // Add GeoJSON features as markers to the cluster group
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties;
        // Use a special icon if site is visited
        const isVisited = visitedSites.includes(props._id);
        const markerIcon = isVisited
          ? L.divIcon({
            className: 'visited-marker',
            html: `<div style="
              position: relative;
              width: 34px;
              height: 42px;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              transition: all 0.2s ease;
            ">
              <!-- Pin body -->
              <div style="
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: 3px solid #ffffff;
                border-radius: 50% 50% 50% 0;
                width: 30px;
                height: 30px;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3), 0 2px 4px rgba(0,0,0,0.15);
                position: relative;
              ">
                <!-- Checkmark -->
                <div style="
                  color: #ffffff;
                  font-size: 14px;
                  font-weight: bold;
                  transform: rotate(45deg);
                  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                  line-height: 1;
                ">✓</div>
              </div>
            </div>`,
            iconSize: [34, 42],
            iconAnchor: [17, 42],
            popupAnchor: [0, -42],
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

      // Create modern user location icon
      const userLocationMarkerIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="
          position: relative;
          width: 36px;
          height: 44px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          animation: userPulse 2s infinite;
        ">
          <!-- Pin body -->
          <div style="
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            border: 4px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4), 0 4px 10px rgba(0,0,0,0.2);
            transform: rotate(-45deg);
            position: relative;
          ">
            <!-- User icon -->
            <div style="
              color: #ffffff;
              font-size: 16px;
              font-weight: bold;
              transform: rotate(45deg);
              text-shadow: 0 1px 2px rgba(0,0,0,0.2);
              line-height: 1;
            ">📍</div>
          </div>
        </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
      });

      // Add new user marker with modern icon
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userLocationMarkerIcon,
        title: 'Your Location',
        zIndexOffset: 1000, // Ensure it appears above other markers
      }).addTo(mapRef.current).bindPopup('Your Location');

      // Add 100m radius circle to match backend check-in radius
      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: 80,
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(mapRef.current);

      // Only pan/zoom to user location if explicitly requested (manual location update)
      if (shouldPanToUser) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 18, { animate: true });
        setShouldPanToUser(false); // Reset flag
      }
    }
  }, [userLocation, shouldPanToUser]);

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
    }, 3000); // 5 minutes in ms

    return () => clearInterval(interval);
  }, [setUserLocation]);

  // Check-in logic: call backend when userLocation changes
  useEffect(() => {
    async function checkInToNearbySite(userLocation: { lat: number; lng: number }) {
      try {
        const res = await checkinToNearbySite(userLocation);
        const data = res.data;
        if (res.status === 200 && data.success) {
          // Add the site to visitedSites state if not already present
          if (data.site && !visitedSites.includes(data.site._id)) {
            setVisitedSites((prev) => [...prev, data.site._id]);
          }
        } else if (res.status === 200 && !data.success) {
          console.warn('Looks like there is no cultural site nearby to check in to.');
        }
      } catch (err) {
        // Handle actual network or server errors
        console.error('Check-in error:', err);
      }
    }
    if (userLocation) {
      checkInToNearbySite(userLocation);
    }
    // Note: visitedSites dependency removed to prevent resetting state
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setShouldPanToUser(true); // Set flag to trigger panning
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
      <style>
        {`
          /* Modern marker hover effects */
          .modern-marker:hover {
            transform: scale(1.1);
            z-index: 1000;
          }
          
          .visited-marker:hover {
            transform: scale(1.1);
            z-index: 1000;
          }
          
          .selected-marker:hover {
            transform: scale(1.05);
          }
          
          .user-location-marker:hover {
            transform: scale(1.1);
            z-index: 1000;
          }
          
          /* Cluster hover effects */
          .modern-cluster-icon:hover {
            transform: scale(1.1);
            z-index: 1000;
          }
          
          /* Smooth transitions for all markers */
          .modern-marker,
          .visited-marker,
          .selected-marker,
          .user-location-marker,
          .modern-cluster-icon {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
          }
          
          /* Pulse animation for selected marker */
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          /* User location pulse animation */
          @keyframes userPulse {
            0% { transform: scale(1); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
            50% { transform: scale(1.08); box-shadow: 0 8px 25px rgba(37, 99, 235, 0.6); }
            100% { transform: scale(1); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
          }
        `}
      </style>
      {/* Category filter overlay */}
      {showCategoryFilter && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: isMobile ? 12 : 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1201,
            px: { xs: 1, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            borderRadius: 3,
            background: theme.palette.mode === 'dark' ? "#23232b" : "#fff",
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 120,
            maxWidth: "98vw",
            overflowX: "auto"
          }}
        >
          <Stack direction="row" spacing={1} sx={{ width: "100%", overflowX: "auto" }}>
            <Chip
              label="All"
              onClick={() => setSelectedCategory("")}
              sx={{
                fontWeight: 600,
                minWidth: 56,
                fontSize: { xs: 12, sm: 14 },
                cursor: 'pointer',
                borderRadius: 2,
                boxShadow: selectedCategory === "" ? 2 : 0,
                background: selectedCategory === "" ? "#2563eb" : "#f1f5f9",
                color: selectedCategory === "" ? "#fff" : "#222",
                transition: "all 0.2s",
              }}
            />
            {categories.map(cat => (
              <Chip
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  fontWeight: 600,
                  background: selectedCategory === cat ? CATEGORY_COLORS[cat] : "#f1f5f9",
                  color: selectedCategory === cat ? "#fff" : "#222",
                  minWidth: 56,
                  fontSize: { xs: 12, sm: 14 },
                  cursor: 'pointer',
                  borderRadius: 2,
                  boxShadow: selectedCategory === cat ? 2 : 0,
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}
      {/* Map */}
      <div id="map" style={{ width: "100%", height: "100%" }} />
      <Tooltip title="Go to my location" placement={isMobile ? "top" : "left"}>
        <Fab
          color="primary"
          onClick={handleLocateMe}
          sx={{
            position: "absolute",
            bottom: isMobile ? 16 : 32,
            right: isMobile ? 16 : 32,
            zIndex: 1000,
            boxShadow: 4,
            width: { xs: 44, sm: 56 },
            height: { xs: 44, sm: 56 },
            minHeight: 0,
          }}
          aria-label="locate me"
        >
          <MyLocationIcon sx={{ fontSize: { xs: 22, sm: 28 } }} />
        </Fab>
      </Tooltip>
    </div>
  );
};

export default Map;