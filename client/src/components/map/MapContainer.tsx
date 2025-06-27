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
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip

} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import axios from 'axios';
import { toast } from 'react-hot-toast'; // Add this if you have react-hot-toast

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const theme = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAllSites, setShowAllSites] = useState(false); // NEW STATE
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);

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
    // Only fetch all sites if not filtering by district
    if (districtFilter) return;

    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (search) params.append('q', search);

    // Always fetch, even if no search/category (fetch all)
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
  }, [selectedCategory, search, viewMode, districtFilter]);

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

  // Check authentication status and fetch favorites on component mount
  useEffect(() => {
    // Directly fetch favorites - the API will return unauthorized if not logged in
    axios.get('http://localhost:5000/api/favorites', { withCredentials: true })
      .then(response => {
        // User is logged in if we get a successful response
        setIsLoggedIn(true);

        // Extract favorite IDs
        const favoriteIds = response.data.map((site: any) => site._id);
        setFavorites(favoriteIds);
      })
      .catch(error => {
        // User is not logged in or there was an error
        console.log("Could not fetch favorites:", error.message);
        setIsLoggedIn(false);
      });
  }, []);

  // Fetch geojson data for a specific district
  const fetchDistrictData = async (district: string) => {
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

  // Fetch district data when view mode changes to districts
  useEffect(() => {
    if (viewMode === 'districts' && geoJsonData && geoJsonData.features) {
      // Extract the district name from the first feature's properties
      const districtName = geoJsonData.features[0].properties.district;
      if (districtName) {
        fetchDistrictData(districtName);
      }
    }
  }, [viewMode, geoJsonData]);

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
    setDistrictFilter(district); // <-- set district filter
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/districts/${encodeURIComponent(district)}`);
      const data = await response.json();
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

  // Add a "Show All Sites" button handler to clear the district filter:
  const handleShowAllSites = () => {
    setDistrictFilter(null);
    setSelectedCategory('');
    setSearch('');
  };

  // Function to add a site to favorites
  const addToFavorites = async (siteId: string) => {
    if (!isLoggedIn) {
      toast ? toast.error('Please sign in to add favorites') : alert('Please sign in to add favorites');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/favorites/add', { siteId }, { withCredentials: true });
      setFavorites(prev => [...prev, siteId]);
      toast ? toast.success('Added to favorites') : alert('Added to favorites');
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast ? toast.error('Failed to add to favorites') : alert('Failed to add to favorites');
    }
  };

  // Function to remove a site from favorites
  const removeFromFavorites = async (siteId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/favorites/remove/${siteId}`, { withCredentials: true });
      setFavorites(prev => prev.filter(id => id !== siteId));
      toast ? toast.success('Removed from favorites') : alert('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast ? toast.error('Failed to remove from favorites') : alert('Failed to remove from favorites');
    }
  };

  // Check if a site is in favorites
  const isFavorite = (siteId: string) => favorites.includes(siteId);

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
          display: "flex",
          flexDirection: "column", // Important for fixed header + scrolling content
        }}
      >
        {/* Fixed Header - Always Visible */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: "1px solid",
            borderColor: theme.palette.divider,
            background: theme.palette.background.paper,
            zIndex: 5,
          }}
        >
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Explore Cultural Sites
          </Typography>

          {/* Search bar with enhanced styling */}
          <TextField
            inputRef={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sites..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearch('')}
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                borderRadius: 2.5,
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : "#f8fafc",
              }
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {/* View mode toggle with enhanced styling */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            color="primary"
            aria-label="map view mode"
            fullWidth
          >
            <ToggleButton
              value="sites"
              aria-label="sites view"
              sx={{
                borderRadius: 2,
                py: 0.7,
                fontWeight: 500,
              }}
            >
              <LocationOnIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Sites
            </ToggleButton>
            <ToggleButton
              value="districts"
              aria-label="districts view"
              sx={{
                borderRadius: 2,
                py: 0.7,
                fontWeight: 500,
              }}
            >
              <MapIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Districts
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>



        {/* Status Bar - Fixed */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>{geoJsonData?.features?.length || 0}</strong> sites found
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {geoJsonData?.features?.length > 0 && (
              <Chip
                label={selectedCategory ?
                  `Showing ${selectedCategory.replace(/_/g, ' ')}` :
                  (search ? 'Search results' : 'All sites')}
                size="small"
                color={search || selectedCategory || showAllSites ? "primary" : "default"}
                variant="outlined"
                sx={{ height: 24, mr: 1 }}
              />
            )}


          </Box>
        </Box>

        {/* Scrollable Content Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
          {error ? (
            <Alert severity="error" sx={{ borderRadius: 2, my: 2 }}>
              {error}
            </Alert>
          ) : loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              sx={{ py: 8 }}
            >
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading sites...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Show the initial state only when no search, no category, AND no district data */}
              {!search && !selectedCategory && (!geoJsonData || geoJsonData.features.length === 0) ? (
                // Initial state - no search/filter applied
                <Box sx={{ py: 6, textAlign: 'center', px: 2 }}>

                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Search for cultural sites
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                    Use the search box above to find sites by name, or select a category to browse sites.
                  </Typography>

                  {/* Quick access category buttons */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                    {categories.slice(0, 6).map(category => (
                      <Chip
                        key={category}
                        label={category.charAt(0).toUpperCase() + category.slice(1)}
                        onClick={() => setSelectedCategory(category)}
                        color="primary"
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>

                  {/* Add this button */}
                  <Button
                    variant="contained"
                    onClick={handleShowAllSites}
                    sx={{ mt: 3 }}
                    startIcon={<MapIcon />}
                  >
                    View All Sites
                  </Button>
                </Box>
              ) : geoJsonData?.features?.length === 0 ? (
                // No results found
                <Box sx={{ py: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
                  <SearchOffIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No sites found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try changing your search or filter criteria
                  </Typography>
                  <Button sx={{ mt: 2 }} startIcon={<RefreshIcon />} onClick={() => { setSearch(''); setSelectedCategory(''); }}>
                    Reset filters
                  </Button>
                </Box>
              ) : (
                // Show sites - search results OR district sites
                <Box sx={{ py: 1 }}>
                  {geoJsonData?.features?.length > 100 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                      <Typography variant="body2" color="info.contrastText">
                        Showing {geoJsonData.features.length} sites. You can use the search box to narrow down results.
                      </Typography>
                    </Box>
                  )}
                  <CulturalSitesList
                    sites={geoJsonData?.features || []}
                    onSiteClick={handleListSiteSelect}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    search={search}
                    categories={categories}
                    setCategories={setCategories}
                    paginationLimit={6} // <-- limit to 6
                  />
                </Box>
              )}
            </>
          )}
        </Box>
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
            width: { xs: "100vw", sm: 380, md: 420 },
            maxWidth: "90vw",
            borderRadius: { xs: 0, sm: "0 16px 16px 0" },
            p: 0,
            background: theme.palette.background.paper,
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)"
          }
        }}
      >
        {selectedSite && (
          <Box>
            {/* Header with gradient background */}
            <Box
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                color: "white",
                position: "relative"
              }}
            >
              <IconButton
                onClick={() => setSelectedSite(null)}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" }
                }}
              >
                <CloseIcon />
              </IconButton>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  mb: 1,
                  pr: 4,
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                {selectedSite.name}
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  display: "inline-block",
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: 1,
                  px: 1,
                  py: 0.3
                }}
              >
                {selectedSite.category && selectedSite.category.charAt(0).toUpperCase() + selectedSite.category.slice(1)}
              </Typography>
            </Box>

            {/* Content Section */}
            <Box sx={{ p: 3 }}>
              {selectedSite.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: theme.palette.text.primary }}>
                    {selectedSite.description}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 2,
                  p: 2,
                  mb: 3
                }}
              >
                {selectedSite.address && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ color: theme.palette.primary.main, mt: 0.3 }}>
                      <LocationOnIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2">
                      {selectedSite.address.street ? selectedSite.address.street + " " : ""}
                      {selectedSite.address.housenumber ? selectedSite.address.housenumber + ", " : ""}
                      {selectedSite.address.postcode ? selectedSite.address.postcode + " " : ""}
                      {selectedSite.address.city ? selectedSite.address.city + ", " : ""}
                      {selectedSite.address.country ? selectedSite.address.country : ""}
                    </Typography>
                  </Stack>
                )}

                {selectedSite.opening_hours && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ color: theme.palette.primary.main, mt: 0.3 }}>
                      <AccessTimeIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2">{selectedSite.opening_hours}</Typography>
                  </Stack>
                )}

                {selectedSite.phone && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ color: theme.palette.primary.main, mt: 0.3 }}>
                      <PhoneIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2">{selectedSite.phone}</Typography>
                  </Stack>
                )}

                {selectedSite.website && (
                  <Stack direction="row" spacing={1}>
                    <Box sx={{ color: theme.palette.primary.main, mt: 0.3 }}>
                      <LanguageIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2">
                      <a
                        href={selectedSite.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.palette.primary.main,
                          textDecoration: "none",
                          fontWeight: 500
                        }}
                      >
                        Visit Website
                      </a>
                    </Typography>
                  </Stack>
                )}
              </Box>

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Details
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                {selectedSite.operator && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Operator</Typography>
                    <Typography variant="body2">{selectedSite.operator}</Typography>
                  </Box>
                )}

                {selectedSite.fee && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Fee</Typography>
                    <Typography variant="body2">{selectedSite.fee}</Typography>
                  </Box>
                )}

                {selectedSite.cuisine && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Cuisine</Typography>
                    <Typography variant="body2">{selectedSite.cuisine}</Typography>
                  </Box>
                )}

                {selectedSite.artist_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Artist</Typography>
                    <Typography variant="body2">{selectedSite.artist_name}</Typography>
                  </Box>
                )}

                {selectedSite.artwork_type && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Artwork Type</Typography>
                    <Typography variant="body2">{selectedSite.artwork_type}</Typography>
                  </Box>
                )}

                {selectedSite.material && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Material</Typography>
                    <Typography variant="body2">{selectedSite.material}</Typography>
                  </Box>
                )}

                {selectedSite.start_date && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Year</Typography>
                    <Typography variant="body2">{selectedSite.start_date}</Typography>
                  </Box>
                )}

                {selectedSite.wheelchair && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Wheelchair Access</Typography>
                    <Typography variant="body2">{selectedSite.wheelchair}</Typography>
                  </Box>
                )}
              </Box>

              {/* Action button */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  startIcon={<DirectionsIcon />}
                  sx={{ borderRadius: 2 }}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSite.address?.street},${selectedSite.address?.city}`}
                  target="_blank"
                >
                  Get Directions
                </Button>

                <Button
                  variant="contained"
                  startIcon={isFavorite(selectedSite._id) ? <FavoriteIcon color="error" /> : <FavoriteIcon />}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    bgcolor: isFavorite(selectedSite._id) ? 'error.main' : 'primary.main',
                    '&:hover': {
                      bgcolor: isFavorite(selectedSite._id) ? 'error.dark' : 'primary.dark',
                    }
                  }}
                  onClick={() => {
                    if (isFavorite(selectedSite._id)) {
                      removeFromFavorites(selectedSite._id);
                    } else {
                      addToFavorites(selectedSite._id);
                    }
                  }}
                >
                  {isFavorite(selectedSite._id) ? 'Remove Favorite' : 'Add to Favorites'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default MapContainer;