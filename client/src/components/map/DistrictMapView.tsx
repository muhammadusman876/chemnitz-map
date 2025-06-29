import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import axios from 'axios';
import { simpleCache } from '../../utils/simpleCache';
import { backgroundLoader } from '../../services/backgroundLoader';

interface DistrictMapViewProps {
    progressData: any;
    onDistrictClick: (district: string) => void;
    themeMode?: "light" | "dark";
}

interface DistrictData {
    name: string;
    siteCount: number;
}

const DistrictMapView: React.FC<DistrictMapViewProps> = ({
    progressData,
    onDistrictClick,
    themeMode = "light"
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const loadingControlRef = useRef<L.Control | null>(null);
    const [districtGeoJson, setDistrictGeoJson] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [mapLoading, setMapLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [districts, setDistricts] = useState<DistrictData[]>([]);

    // Professional loading spinner component
    const LoadingSpinner = () => (
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: themeMode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                zIndex: 1000,
                borderRadius: '8px',
            }}
        >
            <CircularProgress
                size={60}
                thickness={4}
                sx={{
                    color: themeMode === 'dark' ? '#90caf9' : '#1976d2',
                    mb: 2,
                }}
            />
            <Typography
                variant="h6"
                sx={{
                    color: themeMode === 'dark' ? '#ffffff' : '#333333',
                    fontWeight: 500,
                    textAlign: 'center',
                }}
            >
                Loading Districts
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: themeMode === 'dark' ? '#b0b0b0' : '#666666',
                    mt: 1,
                    textAlign: 'center',
                }}
            >
                Please wait while we load the map data...
            </Typography>
        </Box>
    );

    // Use callback ref for map element
    const mapElementRef = useCallback((node: HTMLDivElement) => {
        if (node !== null && !mapRef.current) {
            mapRef.current = L.map(node).setView([50.83, 12.92], 12);

            const tileUrl = themeMode === "dark"
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

            const tileOptions: any = {
                maxZoom: 19,
                attribution: themeMode === "dark"
                    ? '&copy; <a href="https://carto.com/">CartoDB</a>'
                    : '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            };

            if (themeMode === "dark") {
                tileOptions.subdomains = "abcd";
            }

            tileLayerRef.current = L.tileLayer(tileUrl, tileOptions).addTo(mapRef.current);

            // Set map loading to false once map is initialized
            setMapLoading(false);
        }
    }, [themeMode]);

    // Update tile layer on theme change
    useEffect(() => {
        if (!mapRef.current || !tileLayerRef.current) return;

        mapRef.current.removeLayer(tileLayerRef.current);

        const tileUrl = themeMode === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        const tileOptions: any = {
            maxZoom: 19,
            attribution: themeMode === "dark"
                ? '&copy; <a href="https://carto.com/">CartoDB</a>'
                : '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        };

        if (themeMode === "dark") {
            tileOptions.subdomains = "abcd";
        }

        tileLayerRef.current = L.tileLayer(tileUrl, tileOptions).addTo(mapRef.current);
    }, [themeMode]);

    // Fetch district geojson and list with caching
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // First, check if background loader has data ready
                const cachedData = backgroundLoader.getCachedDistrictData();

                if (cachedData.geoJson && cachedData.districts) {
                    console.log('✅ Using preloaded district data');
                    setDistrictGeoJson(cachedData.geoJson);
                    setDistricts(cachedData.districts);
                    setError(null);
                    setLoading(false);
                    return;
                }

                console.log('🔄 Waiting for background loading or fetching fresh data...');

                // If not ready, ensure background loading is started and wait for it
                await backgroundLoader.preloadDistrictData();

                // Check again after background loading
                const freshCachedData = backgroundLoader.getCachedDistrictData();

                if (freshCachedData.geoJson && freshCachedData.districts) {
                    console.log('✅ Using background-loaded district data');
                    setDistrictGeoJson(freshCachedData.geoJson);
                    setDistricts(freshCachedData.districts);
                    setError(null);
                } else {
                    // Fallback: try manual loading
                    console.log('⚠️ Background loading incomplete, trying manual fetch...');
                    await fallbackDataFetch();
                }

            } catch (err: any) {
                console.error('❌ Failed to load district data:', err);
                setError(`Failed to load district map data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        const fallbackDataFetch = async () => {
            try {
                // Manual fallback loading
                const [geoResponse, listResponse] = await Promise.allSettled([
                    axios.get('http://localhost:5000/api/districts/geojson', {
                        timeout: 20000,
                        withCredentials: true
                    }),
                    axios.get('http://localhost:5000/api/districts/list', {
                        timeout: 10000,
                        withCredentials: true
                    })
                ]);

                if (geoResponse.status === 'fulfilled' && listResponse.status === 'fulfilled') {
                    setDistrictGeoJson(geoResponse.value.data);
                    setDistricts(listResponse.value.data);

                    // Cache for next time
                    simpleCache.set('district-geojson', geoResponse.value.data, 60 * 60 * 1000);
                    simpleCache.set('districts-list', listResponse.value.data, 15 * 60 * 1000);

                    setError(null);
                    console.log('✅ Fallback loading successful');
                } else {
                    throw new Error('Fallback loading failed');
                }
            } catch (fallbackError) {
                console.error('❌ Fallback loading failed:', fallbackError);
                setError('Unable to load district map data. Please try refreshing the page.');
            }
        };

        fetchData();
    }, []);

    // Add district GeoJSON layer when data is loaded
    useEffect(() => {
        if (!mapRef.current || !districtGeoJson || !progressData || !districts.length) return;

        // Remove loading control if it exists
        if (loadingControlRef.current) {
            mapRef.current.removeControl(loadingControlRef.current);
            loadingControlRef.current = null;
        }

        // Remove previous geoJson layer if exists
        if (geoJsonLayerRef.current) {
            mapRef.current.removeLayer(geoJsonLayerRef.current);
        }

        // Use requestAnimationFrame to avoid blocking the UI
        requestAnimationFrame(() => {
            // Style function for districts
            const getDistrictStyle = (feature: any) => {
                const districtName = feature.properties.STADTTNAME;
                const districtData = districts.find(d => d.name === districtName);
                const districtProgress = progressData?.districtProgress?.find(
                    (d: any) => d.district === districtName
                );

                let visitedCount = 0;
                let totalSites = districtData?.siteCount || 0;

                if (districtProgress) {
                    visitedCount = districtProgress.visitedSites?.length || 0;
                    if (districtProgress.totalSites > 0) {
                        totalSites = districtProgress.totalSites;
                    }
                } else {
                    visitedCount = progressData?.recentVisits?.filter(
                        (visit: any) => visit.site?.district === districtName
                    )?.length || 0;

                    if (progressData?.categoryProgress) {
                        progressData.categoryProgress.forEach((category: any) => {
                            category.visitedSites.forEach((site: any) => {
                                const siteDistrict = typeof site === 'object' ? site.district : undefined;
                                if (siteDistrict === districtName) {
                                    visitedCount += 1;
                                }
                            });
                        });
                    }
                }

                const isCompleted = districtProgress?.completed || (totalSites > 0 && visitedCount >= totalSites);
                const percentage = totalSites > 0 ? (visitedCount / totalSites) : (visitedCount > 0 ? 0.3 : 0);

                let fillColor = '#CCCCCC';
                if (isCompleted) {
                    fillColor = '#4CAF50';
                } else if (percentage > 0.6) {
                    fillColor = '#FFC107';
                } else if (percentage > 0.3) {
                    fillColor = '#2196F3';
                } else if (percentage > 0) {
                    fillColor = '#9C27B0';
                }

                return {
                    fillColor,
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            };

            // Create GeoJSON layer
            geoJsonLayerRef.current = L.geoJSON(districtGeoJson, {
                style: getDistrictStyle,
                onEachFeature: (feature, layer) => {
                    const originalDistrictName = feature.properties.STADTTNAME?.trim();
                    const districtName = originalDistrictName.toLowerCase();

                    // Tooltip and click
                    const districtData = districts.find(
                        d => d.name.trim().toLowerCase() === districtName
                    );
                    const districtProgress = progressData?.districtProgress?.find(
                        (d: any) => d.district.trim().toLowerCase() === districtName
                    );
                    let visitedCount = districtProgress?.visitedSites?.length || 0;
                    let totalSites = districtData?.siteCount || 0;

                    if (!districtProgress || visitedCount === 0) {
                        const recentVisitsInDistrict = progressData?.recentVisits?.filter(
                            (visit: any) => visit.site?.district && visit.site?.district.trim().toLowerCase() === districtName
                        )?.length || 0;
                        visitedCount = Math.max(visitedCount, recentVisitsInDistrict);
                    }

                    layer.bindTooltip(
                        `<strong>${districtData?.name || originalDistrictName}</strong><br>
                        Explored: ${visitedCount}/${totalSites > 0 ? totalSites : '?'} sites`
                    );

                    layer.on('click', () => {
                        onDistrictClick(originalDistrictName);
                    });
                }
            });

            // Add to map in next frame
            requestAnimationFrame(() => {
                if (mapRef.current && geoJsonLayerRef.current) {
                    geoJsonLayerRef.current.addTo(mapRef.current);

                    // Fit bounds after layer is added
                    setTimeout(() => {
                        try {
                            const bounds = geoJsonLayerRef.current!.getBounds();
                            if (bounds.isValid()) {
                                mapRef.current!.fitBounds(bounds, {
                                    padding: [20, 20],
                                    maxZoom: 14,
                                    animate: true,
                                    duration: 0.5
                                });
                            }
                        } catch {
                            mapRef.current!.setView([50.83, 12.92], 12);
                        }
                    }, 100);
                }
            });
        });
    }, [districtGeoJson, progressData, onDistrictClick, districts]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (loadingControlRef.current && mapRef.current) {
                mapRef.current.removeControl(loadingControlRef.current);
                loadingControlRef.current = null;
            }
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Show loading state
    if (loading || mapLoading) {
        return (
            <Box sx={{ height: '100vh', width: '100%', mb: 2, position: 'relative' }}>
                <div ref={mapElementRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />
                <Fade in={loading || mapLoading} timeout={300}>
                    <div>
                        <LoadingSpinner />
                    </div>
                </Fade>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', width: '100%', mb: 2, position: 'relative' }}>
            <div ref={mapElementRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />
        </Box>
    );
};

export default DistrictMapView;