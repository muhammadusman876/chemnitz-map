import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

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
    const [districtGeoJson, setDistrictGeoJson] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [districts, setDistricts] = useState<DistrictData[]>([]);

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

    // Fetch district geojson and list
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [geoJsonResponse, districtsResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/districts/geojson'),
                    axios.get('http://localhost:5000/api/districts/list')
                ]);
                setDistrictGeoJson(geoJsonResponse.data);
                setDistricts(districtsResponse.data);
                setError(null);
            } catch (err) {
                setError('Failed to load district map data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Add district GeoJSON layer when data is loaded
    useEffect(() => {
        if (!mapRef.current || !districtGeoJson || !progressData || !districts.length) return;

        // Remove previous geoJson layer if exists
        if (geoJsonLayerRef.current) {
            mapRef.current.removeLayer(geoJsonLayerRef.current);
        }

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
                    (visit: any) => visit.site.district === districtName
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
                        (visit: any) => visit.site.district && visit.site.district.trim().toLowerCase() === districtName
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
        }).addTo(mapRef.current);

        // Fit map to districts
        try {
            const bounds = geoJsonLayerRef.current.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, {
                    padding: [20, 20],
                    maxZoom: 14
                });
            }
        } catch {
            mapRef.current.setView([50.83, 12.92], 12);
        }
    }, [districtGeoJson, progressData, onDistrictClick, districts]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
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
        <Box sx={{ height: '100vh', width: '100%', mb: 2 }}>
            <div ref={mapElementRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />
        </Box>
    );
};

export default DistrictMapView;