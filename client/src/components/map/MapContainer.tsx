import React, { useState, useEffect } from 'react';
import Map from './Map';
import CulturalSitesList from './CulturalSitesList';
import {
  Box,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const NAVBAR_HEIGHT = 64; // adjust if your navbar is a different height

const MapContainer = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [fabY, setFabY] = useState(0);

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

  // Animate the Fab down when modal opens
  useEffect(() => {
    if (openModal) {
      setTimeout(() => setFabY(80), 10); // animate down 80px
    } else {
      setFabY(0);
    }
  }, [openModal]);

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
      }}
    >
      <Map
        geoJsonData={geoJsonData}
        selectedCoords={selectedCoords}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
      />
      {/* Centered Fab */}
      <Tooltip title="Search Cultural Sites">
        <Fab
          color="primary"
          sx={{
            position: "absolute",
            left: "50%",
            transform: `translate(-50%, ${fabY}px)`,
            top: 16,
            zIndex: 1200,
            width: 56,
            height: 56,
            boxShadow: 4,
            transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
          onClick={() => setOpenModal(true)}
          aria-label="search-sites"
        >
          <SearchIcon fontSize="large" />
          {loading && (
            <CircularProgress
              size={24}
              color="inherit"
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 1300,
              }}
            />
          )}
        </Fab>
      </Tooltip>
      {/* Modal for CulturalSitesList */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { backgroundColor: "rgba(30,41,59,0.25)" },
          },
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95vw", md: 900 },
              maxHeight: { xs: "80vh", sm: 600 },
              bgcolor: "background.paper",
              borderRadius: 4,
              boxShadow: 24,
              p: { xs: 2, sm: 4 },
              outline: "none",
              overflowY: "auto",
            }}
          >
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <CulturalSitesList
                onSiteClick={coords => {
                  setSelectedCoords(coords);
                  setOpenModal(false);
                }}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default MapContainer;