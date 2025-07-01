import { useState, useEffect, useRef } from 'react';
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
  Drawer,
  IconButton,
  Typography,
  Button,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import FavoriteIcon from '@mui/icons-material/Favorite';
import useMediaQuery from '@mui/material/useMediaQuery';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { simpleCache } from '../../utils/simpleCache';

const NAVBAR_HEIGHT = 64;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const MapContainer = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'sites' | 'districts'>('sites');
  const [progressData, setProgressData] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const searchRef = useRef<HTMLInputElement>(null);
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);

  // Fetch categories with cache
  useEffect(() => {
    const loadCategories = async () => {
      // Try cache first
      let cachedCategories = simpleCache.get('categories');
      if (cachedCategories && Array.isArray(cachedCategories)) {
        // Validate that all items are strings
        const validCategories = cachedCategories.filter((cat): cat is string => typeof cat === 'string');
        setCategories(validCategories);
        return;
      }

      // Cache miss - fetch fresh
      try {
        const response = await fetch('http://localhost:5000/api/culturalsites/');
        const sites = await response.json();

        // Extract categories with proper type checking
        const categorySet = new Set<string>();
        sites.forEach((site: any) => {
          if (site.category && typeof site.category === 'string') {
            categorySet.add(site.category);
          }
        });

        const uniqueCategories = Array.from(categorySet);

        setCategories(uniqueCategories);
        simpleCache.set('categories', uniqueCategories, 15 * 60 * 1000); // 15 minutes cache
        simpleCache.set('all-sites', sites, 10 * 60 * 1000); // 10 minutes cache for sites
      } catch (error) {
        console.error('❌ Failed to load categories:', error);
        setCategories([]); // Fallback to empty array
      }
    };

    loadCategories();
  }, []);

  // Fetch sites with cache and filtering - FIXED: Handle district filtering properly
  useEffect(() => {
    const loadSites = async () => {
      setLoading(true);
      try {
        if (districtFilter) {
          const cacheKey = `district-${districtFilter}`;
          let districtSites = simpleCache.get(cacheKey);
          if (!districtSites) {
            try {
              const response = await fetch(`http://localhost:5000/api/districts/${encodeURIComponent(districtFilter.trim())}`);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              districtSites = await response.json();
              if (districtSites && Array.isArray(districtSites)) {
                simpleCache.set(cacheKey, districtSites, 10 * 60 * 1000);
              } else {
                districtSites = [];
              }
            } catch (fetchError) {
              let allSites = simpleCache.get('all-sites');
              if (!allSites) {
                const allSitesResponse = await fetch('http://localhost:5000/api/culturalsites/');
                allSites = await allSitesResponse.json();
                simpleCache.set('all-sites', allSites);
              }
              // Prefer filtering by site.district if available
              districtSites = allSites.filter((site: any) =>
                (site.district && site.district.trim().toLowerCase() === districtFilter.trim().toLowerCase()) ||
                (site.address && site.address.city && site.address.city.toLowerCase().includes(districtFilter.toLowerCase()))
              );
              simpleCache.set(cacheKey, districtSites, 10 * 60 * 1000);
            }
          }
          let filteredSites = districtSites;
          if (debouncedSearch) {
            filteredSites = districtSites.filter((site: any) =>
              site.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              site.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
          }
          const features = filteredSites
            .filter((site: any) =>
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
              properties: { ...site },
              id: site._id
            }));
          setGeoJsonData({ type: "FeatureCollection", features });
        } else {
          let allSites = simpleCache.get('all-sites');
          if (!allSites) {
            const response = await fetch('http://localhost:5000/api/culturalsites/');
            allSites = await response.json();
            simpleCache.set('all-sites', allSites, 10 * 60 * 1000);
          }
          let filteredSites = allSites;
          if (selectedCategory) {
            filteredSites = allSites.filter((site: any) => site.category === selectedCategory);
          }
          if (debouncedSearch) {
            filteredSites = filteredSites.filter((site: any) =>
              site.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              site.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
          }
          const features = filteredSites
            .filter((site: any) =>
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
              properties: { ...site },
              id: site._id
            }));
          setGeoJsonData({ type: "FeatureCollection", features });
        }
      } catch (error) {
        setError('Failed to load sites');
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, [selectedCategory, debouncedSearch, districtFilter]); // Use debouncedSearch

  // Fetch progress data when view mode changes to districts
  useEffect(() => {
    if (viewMode === 'districts') {
      // Try cache first for progress data
      let cachedProgress = simpleCache.get('user-progress');
      if (cachedProgress) {
        setProgressData(cachedProgress);
        return;
      }

      // Cache miss - fetch fresh progress data
      axios.get('http://localhost:5000/api/progress/current-progress', {
        withCredentials: true
      })
        .then(response => {
          setProgressData(response.data);
          simpleCache.set('user-progress', response.data, 2 * 60 * 1000); // 2 minutes cache for progress
        })
        .catch(() => {
          const defaultProgress = {
            totalVisits: 0,
            totalBadges: 0,
            categoryProgress: [],
            districtProgress: [],
            recentVisits: []
          };
          setProgressData(defaultProgress);
        });
    }
  }, [viewMode]);

  // Focus search on mount for better UX
  useEffect(() => {
    if (viewMode === 'sites' && !selectedSite) {
      searchRef.current?.focus();
    }
  }, [viewMode, selectedSite]);

  // Check for preferred mode from Dashboard
  useEffect(() => {
    const preferredMode = sessionStorage.getItem('preferredMapMode');
    if (preferredMode === 'districts') {
      setViewMode('districts');
      sessionStorage.removeItem('preferredMapMode');
    }
  }, []);

  // Check authentication status and fetch favorites on component mount
  useEffect(() => {
    // Try cache first for favorites
    let cachedFavorites = simpleCache.get('user-favorites');
    if (cachedFavorites) {
      setFavorites(cachedFavorites);
      setIsLoggedIn(true);
      return;
    }

    // Cache miss - fetch fresh favorites
    axios.get('http://localhost:5000/api/favorites', { withCredentials: true })
      .then(response => {
        setIsLoggedIn(true);
        const favoriteIds = response.data.map((site: any) => site._id);
        setFavorites(favoriteIds);
        simpleCache.set('user-favorites', favoriteIds, 3 * 60 * 1000); // 3 minutes cache for favorites
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);



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

  // Handle district click: fetch and cache sites for the selected district (like Dashboard)
  const handleDistrictClick = async (district: string) => {
    setSelectedCategory('');
    setSearch('');
    setDistrictFilter(district.trim());
    setViewMode('sites');
  };

  // Add a "Show All Sites" button handler to clear the district filter
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
      const updatedFavorites = [...favorites, siteId];
      setFavorites(updatedFavorites);
      simpleCache.set('user-favorites', updatedFavorites, 3 * 60 * 1000); // Update cache
      toast ? toast.success('Added to favorites') : alert('Added to favorites');
    } catch (error) {
      toast ? toast.error('Failed to add to favorites') : alert('Failed to add to favorites');
    }
  };

  // Function to remove a site from favorites
  const removeFromFavorites = async (siteId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/favorites/remove/${siteId}`, { withCredentials: true });
      const updatedFavorites = favorites.filter(id => id !== siteId);
      setFavorites(updatedFavorites);
      simpleCache.set('user-favorites', updatedFavorites, 3 * 60 * 1000); // Update cache
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
        height: { xs: `calc(100vh - ${NAVBAR_HEIGHT - 8}px)`, sm: `calc(100vh - ${NAVBAR_HEIGHT}px)` },
        overflow: "hidden",
        m: 0,
        p: 0,
        background: "#f8fafc",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Sidebar with search and list */}
      <Box
        sx={{
          width: isMobile ? "100vw" : { xs: "100vw", sm: 370, md: 400 },
          maxWidth: 420,
          minWidth: isMobile ? 0 : { sm: 280, md: 340 },
          height: isMobile ? 'auto' : "100%",
          zIndex: 1200,
          background: theme.palette.background.paper,
          borderRight: !isMobile ? { sm: "1px solid #e0e7ef" } : undefined,
          boxShadow: !isMobile ? { sm: 3 } : undefined,
          display: "flex",
          flexDirection: "column",
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

        {/* Status Bar - Fixed - UPDATED to show district info */}
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {districtFilter && (
              <Chip
                label={`${districtFilter} District`}
                size="small"
                color="secondary"
                variant="filled"
                onDelete={() => handleShowAllSites()}
                sx={{ height: 24 }}
              />
            )}

            {geoJsonData?.features?.length > 0 && !districtFilter && (
              <Chip
                label={selectedCategory ?
                  `Showing ${selectedCategory.replace(/_/g, ' ')}` :
                  (search ? 'Search results' : 'All sites')}
                size="small"
                color={search || selectedCategory ? "primary" : "default"}
                variant="outlined"
                sx={{ height: 24 }}
              />
            )}
          </Box>
        </Box>

        {/* Scrollable Content Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 0.5, sm: 2 } }}>
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
              {/* Show the initial state only when no search, no category, no district AND no data */}
              {!search && !selectedCategory && !districtFilter && (!geoJsonData || geoJsonData.features.length === 0) ? (
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
                  <Button
                    sx={{ mt: 2 }}
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('');
                      setDistrictFilter(null);
                    }}
                  >
                    Reset filters
                  </Button>
                </Box>
              ) : (
                // Show sites - search results OR district sites OR category filtered sites
                <Box sx={{ py: 1 }}>

                  <CulturalSitesList
                    sites={geoJsonData?.features || []}
                    onSiteClick={handleListSiteSelect}
                    selectedCategory={districtFilter ? '' : selectedCategory} // Don't pass category when viewing district
                    setSelectedCategory={setSelectedCategory}
                    search={search}
                    categories={categories}
                    setCategories={setCategories}
                    paginationLimit={12} // Increased from 6 to 12
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Map */}
      <Box sx={{ flex: 1, height: isMobile ? 320 : "100%", position: "relative" }}>
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
            showCategoryFilter={!districtFilter} // <-- Add this line
          />
        ) : (
          <DistrictMapView
            sites={geoJsonData?.features || []}
            progressData={progressData}
            onDistrictClick={handleDistrictClick}
            themeMode={theme.palette.mode}
          />
        )}
      </Box>

      {/* Details Drawer - Rest of component stays the same */}
      <Drawer
        anchor={isMobile ? "bottom" : "left"}
        open={!!selectedSite}
        onClose={() => setSelectedSite(null)}
        PaperProps={{
          sx: {
            width: isMobile ? "100vw" : { xs: "100vw", sm: 380, md: 420 },
            maxWidth: "98vw",
            borderRadius: isMobile ? 0 : { xs: 0, sm: "0 16px 16px 0" },
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
                {!(selectedSite.address || selectedSite.opening_hours || selectedSite.phone || selectedSite.website) ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textAlign: "center",
                      fontStyle: "italic",
                      py: 2,
                      opacity: 0.7,
                    }}
                  >
                    No contact or location information available.
                  </Typography>
                ) : (
                  <>
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
                  </>
                )}
              </Box>

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Details
              </Typography>

              {!(
                selectedSite.operator ||
                selectedSite.fee ||
                selectedSite.cuisine ||
                selectedSite.artist_name ||
                selectedSite.artwork_type ||
                selectedSite.material ||
                selectedSite.start_date ||
                selectedSite.wheelchair
              ) ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    fontStyle: "italic",
                    py: 3,
                    opacity: 0.7,
                  }}
                >
                  No details currently available.
                </Typography>
              ) : (
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
              )}

              {/* Action button */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>

                <Button
                  variant="contained"
                  startIcon={
                    isFavorite(selectedSite._id)
                      ? <FavoriteIcon sx={{ color: "#fff" }} /> // White heart on red background
                      : <FavoriteIcon />
                  }
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