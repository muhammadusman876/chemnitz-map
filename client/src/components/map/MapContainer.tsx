import React, { useState, useEffect, useRef } from 'react';
import Map from './Map';
import CulturalSitesList from './CulturalSitesList';
import DistrictMapView from './DistrictMapView';
import {
  Box,
  CircularProgress,
  Alert,
  useTheme,
  TextField,
  InputAdornment,
  Stack,
  Paper,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';

const NAVBAR_HEIGHT = 64;

const MapContainer = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Pass to Map
  const [categories, setCategories] = useState<string[]>([]); // Pass to Map
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSite, setSelectedSite] = useState<any | null>(null); // <-- NEW: for details panel
  const [viewMode, setViewMode] = useState<'sites' | 'districts'>('sites');
  const [progressData, setProgressData] = useState<any>(null);
  const theme = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch all categories on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/')
      .then(res => res.json())
      .then(data => {
        setCategories(Array.from(new Set(data.map((site: any) => site.category))));
      });
  }, []);

  // Fetch geojson data for selected category and search
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (search) params.append('q', search);

    const url = `http://localhost:5000/api/admin/${params.toString() ? '?' + params.toString() : ''}`;
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
  }, [selectedCategory, search]);

  // Fetch progress data when view mode changes to districts
  useEffect(() => {
    if (viewMode === 'districts') {
      // Fetch user progress data using axios with credentials
      axios.get('http://localhost:5000/api/progress/progress', {
        withCredentials: true // For HTTP-only cookies
      })
        .then(response => {
          setProgressData(response.data);
        })
        .catch(err => {
          setProgressData({
            totalVisits: 0,
            totalBadges: 0,
            categoryProgress: [],
            districtProgress: [],
            recentVisits: []
          });
        });
    }
  }, [viewMode]);

  // Focus search on mount for better UX
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Check for preferred mode from Dashboard
  useEffect(() => {
    const preferredMode = sessionStorage.getItem('preferredMapMode');
    if (preferredMode === 'districts') {
      setViewMode('districts');
      // Clear the preference
      sessionStorage.removeItem('preferredMapMode');
    }
  }, []);

  // Helper to get full site info by coordinates (for marker click)
  const handleMapSiteSelect = (coords: [number, number]) => {
    setSelectedCoords(coords);
    // Find the site in geoJsonData
    if (geoJsonData && geoJsonData.features) {
      const found = geoJsonData.features.find(
        (f: any) =>
          f.geometry.coordinates[1] === coords[0] &&
          f.geometry.coordinates[0] === coords[1]
      );
      if (found) setSelectedSite(found.properties);
    }
  };

  // Helper for list click (also sets details)
  const handleListSiteSelect = (coords: [number, number]) => {
    setSelectedCoords(coords);
    if (geoJsonData && geoJsonData.features) {
      const found = geoJsonData.features.find(
        (f: any) =>
          f.geometry.coordinates[1] === coords[0] &&
          f.geometry.coordinates[0] === coords[1]
      );
      if (found) setSelectedSite(found.properties);
    }
  };

  // Handle district click: fetch sites for the district from backend and show them
  const handleDistrictClick = async (district: string) => {
    setSelectedCategory('');
    setSearch('');
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/districts/${encodeURIComponent(district)}`);
      const data = await response.json();
      // Convert to GeoJSON FeatureCollection if needed
      const features = data
        .filter((site: any) => site.coordinates && typeof site.coordinates.lng === 'number' && typeof site.coordinates.lat === 'number')
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
      setViewMode('sites');
    } catch (err) {
      setError('Failed to load sites for this district');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: `calc(100vh - ${NAVBAR_HEIGHT}px)`, sm: `calc(100vh - ${NAVBAR_HEIGHT}px)` },
        overflow: "hidden",
        m: 0,
        p: 0,
        background: "#f8fafc",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Sidebar with search and list */}
      <Box
        sx={{
          width: { xs: "100vw", sm: 370, md: 400 },
          maxWidth: 420,
          minWidth: { sm: 280, md: 340 },
          height: "100%",
          zIndex: 1200,
          background: theme.palette.background.paper,
          borderRight: { sm: "1px solid #e0e7ef" },
          boxShadow: { sm: 3 },
          p: { xs: 1, sm: 2 },
          overflowY: "auto",
        }}
      >
        {/* Search bar + view toggle */}
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: theme.palette.background.paper,
            mb: 2,
            p: 2,
            borderRadius: 3,
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
            <TextField
              inputRef={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or description..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, background: theme.palette.mode === 'dark' ? '#222' : "#f8fafc" }
              }}
              variant="outlined"
              sx={{ minWidth: 220, flex: 1 }}
            />
          </Stack>

          {/* View mode toggle */}
          <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
              color="primary"
              aria-label="map view mode"
            >
              <ToggleButton value="sites" aria-label="sites view">
                <LocationOnIcon sx={{ mr: 0.5 }} />
                Sites
              </ToggleButton>
              <ToggleButton value="districts" aria-label="districts view">
                <MapIcon sx={{ mr: 0.5 }} />
                Districts
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" py={2}>
                <CircularProgress />
              </Box>
            )}
            <CulturalSitesList
              onSiteClick={handleListSiteSelect}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              search={search}
              categories={categories}
              setCategories={setCategories}
            />
          </>
        )}
      </Box>

      {/* Map */}
      <Box sx={{ flex: 1, height: "100%", position: "relative" }}>
        {viewMode === 'sites' ? (
          <Map
            geoJsonData={geoJsonData}
            selectedCoords={selectedCoords}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            themeMode={theme.palette.mode}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            setSelectedSite={setSelectedSite}
          />
        ) : (
          <DistrictMapView
            progressData={progressData}
            onDistrictClick={handleDistrictClick}
            themeMode={theme.palette.mode}
          />
        )}
      </Box>

      {/* Details Drawer */}
      <Drawer
        anchor="left"
        open={!!selectedSite}
        onClose={() => setSelectedSite(null)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 350, md: 400 },
            maxWidth: 420,
            p: 3,
            background: theme.palette.background.paper,
          }
        }}
      >
        {selectedSite && (
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                {selectedSite.name}
              </Typography>
              <IconButton onClick={() => setSelectedSite(null)}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
              {selectedSite.category && selectedSite.category.charAt(0).toUpperCase() + selectedSite.category.slice(1)}
            </Typography>
            {selectedSite.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedSite.description}
              </Typography>
            )}
            {selectedSite.address && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Address:</strong>{" "}
                {selectedSite.address.street ? selectedSite.address.street + " " : ""}
                {selectedSite.address.housenumber ? selectedSite.address.housenumber + ", " : ""}
                {selectedSite.address.postcode ? selectedSite.address.postcode + " " : ""}
                {selectedSite.address.city ? selectedSite.address.city + ", " : ""}
                {selectedSite.address.country ? selectedSite.address.country : ""}
              </Typography>
            )}
            {selectedSite.website && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Website:</strong>{" "}
                <a href={selectedSite.website} target="_blank" rel="noopener noreferrer">
                  {selectedSite.website}
                </a>
              </Typography>
            )}
            {selectedSite.operator && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Operator:</strong> {selectedSite.operator}
              </Typography>
            )}
            {selectedSite.opening_hours && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Opening Hours:</strong> {selectedSite.opening_hours}
              </Typography>
            )}
            {selectedSite.fee && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fee:</strong> {selectedSite.fee}
              </Typography>
            )}
            {selectedSite.cuisine && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Cuisine:</strong> {selectedSite.cuisine}
              </Typography>
            )}
            {selectedSite.phone && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Phone:</strong> {selectedSite.phone}
              </Typography>
            )}
            {selectedSite.artist_name && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Artist:</strong> {selectedSite.artist_name}
              </Typography>
            )}
            {selectedSite.artwork_type && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Artwork Type:</strong> {selectedSite.artwork_type}
              </Typography>
            )}
            {selectedSite.material && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Material:</strong> {selectedSite.material}
              </Typography>
            )}
            {selectedSite.start_date && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Year:</strong> {selectedSite.start_date}
              </Typography>
            )}
            {selectedSite.wheelchair && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Wheelchair:</strong> {selectedSite.wheelchair}
              </Typography>
            )}
            {/* Add more fields as needed */}
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default MapContainer;