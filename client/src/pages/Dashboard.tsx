import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Avatar,
    Chip,
    Stack,
    Card,
    CardContent,
    Grid, // Use Grid2 for better TypeScript support
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Tabs,
    Tab,
    Paper,
    useTheme,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import BadgeShowcase from "../components/badges/BadgeShowcase";
import UserProfileEdit from "../components/profile/UserProfileEdit";
import { simpleCache } from "../utils/simpleCache";

const rankConfig = [
    { min: 0, label: "Explorer", color: "#64748b", icon: <EmojiEventsIcon />, gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" },
    { min: 5, label: "Adventurer", color: "rgb(3, 166, 161)", icon: <EmojiEventsIcon />, gradient: "linear-gradient(135deg, rgb(3, 166, 161) 0%, rgb(77, 182, 172) 100%)" },
    { min: 15, label: "Trailblazer", color: "#10b981", icon: <EmojiEventsIcon />, gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" },
    { min: 30, label: "Cultural Hero", color: "rgb(255, 79, 15)", icon: <EmojiEventsIcon />, gradient: "linear-gradient(135deg, rgb(255, 79, 15) 0%, rgb(255, 166, 115) 100%)" },
    { min: 50, label: "Legend", color: "#ef4444", icon: <EmojiEventsIcon />, gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" },
];

function getRank(visitedCount: number) {
    return (
        rankConfig
            .slice()
            .reverse()
            .find((r) => visitedCount >= r.min) || rankConfig[0]
    );
}

interface ProgressData {
    totalVisits: number;
    totalBadges: number;
    categoryProgress: Array<{
        category: string;
        totalSites: number;
        visitedSites: Array<any>;
        completed: boolean;
    }>;
    districtProgress: Array<{
        district: string;
        totalSites: number;
        visitedSites: Array<any>;
        completed: boolean;
    }>;
    recentVisits: Array<{
        site: {
            _id: string;
            name: string;
            category: string;
            district: string;
        };
        visitDate: string;
        _id?: string;
    }>;
    favoriteSites: Array<SiteData>;
}

interface DistrictData {
    name: string;
    siteCount: number;
}

interface SiteData {
    _id: string;
    name: string;
    category: string;
    district: string;
    description?: string;
    address?: {
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
    };
}

const Dashboard = () => {
    const { user } = useAuth();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [districts, setDistricts] = useState<DistrictData[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [districtSites, setDistrictSites] = useState<SiteData[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
    const [favoriteSites, setFavoriteSites] = useState<SiteData[]>([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [districtProgressLoading, setDistrictProgressLoading] = useState(false);
    const [districtProgressData, setDistrictProgressData] = useState<any[]>([]);
    const [importGeojsonLoading, setImportGeojsonLoading] = useState(false);
    const [importDistrictsLoading, setImportDistrictsLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
    const [assignDistrictsLoading, setAssignDistrictsLoading] = useState(false);
    const [assignDistrictsStatus, setAssignDistrictsStatus] = useState<string | null>(null);

    // Fetch user progress with caching
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null); // Clear previous errors

                // Try cache first
                const cacheKey = `dashboard-progress-${user.id || (user as any)._id}`;
                let cachedProgress = simpleCache.get(cacheKey);

                if (cachedProgress) {
                    ('✅ Using cached dashboard progress');
                    setProgressData(cachedProgress);
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/progress/current-progress', {
                    withCredentials: true
                });

                // Add safety checks for the response data
                const progressData = response.data || {
                    totalVisits: 0,
                    totalBadges: 0,
                    categoryProgress: [],
                    districtProgress: [],
                    recentVisits: [],
                    favoriteSites: []
                };

                setProgressData(progressData);
                simpleCache.set(cacheKey, progressData, 3 * 60 * 1000);
                ('💾 Cached dashboard progress');

            } catch (err) {
                console.error('Failed to fetch progress data:', err);
                setError('Failed to load your exploration progress');

                // Set empty progress data to prevent crashes
                setProgressData({
                    totalVisits: 0,
                    totalBadges: 0,
                    categoryProgress: [],
                    districtProgress: [],
                    recentVisits: [],
                    favoriteSites: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [user]);

    // Fetch all districts with caching
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                let cachedDistricts = simpleCache.get('districts-list');

                if (cachedDistricts) {
                    setDistricts(Array.isArray(cachedDistricts) ? cachedDistricts : []);
                    return;
                }

                ('🔄 Fetching fresh districts list');
                const response = await axios.get('http://localhost:5000/api/districts/list');

                const districts = Array.isArray(response.data) ? response.data : [];
                setDistricts(districts);
                simpleCache.set('districts-list', districts, 15 * 60 * 1000);
                ('💾 Cached districts list');

            } catch (err) {
                console.error('Failed to fetch districts:', err);
                setDistricts([]); // Set empty array to prevent crashes
            }
        };

        fetchDistricts();
    }, []);

    // Fetch sites for a specific district when selected with caching
    const handleDistrictClick = async (districtName: string) => {
        try {
            setSelectedDistrict(districtName);

            // Try cache first
            const cacheKey = `district-sites-${districtName}`;
            let cachedDistrictSites = simpleCache.get(cacheKey);

            if (cachedDistrictSites) {
                setDistrictSites(cachedDistrictSites);
                setDialogOpen(true);
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/districts/${encodeURIComponent(districtName)}`);

            setDistrictSites(response.data);
            setDialogOpen(true);

            // Cache for 10 minutes
            simpleCache.set(cacheKey, response.data, 10 * 60 * 1000);

        } catch (err) {
            console.error(`Failed to fetch sites for district ${districtName}:`, err);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Fetch favorite sites details with caching
    const handleFavoritesClick = async () => {

        if (!user) {
            ('No user, cannot fetch favorites');
            return;
        }

        // Check if we already have favorites data in progressData
        if (progressData?.favoriteSites?.length) {
            setFavoriteSites(progressData.favoriteSites);
            setFavoritesDialogOpen(true);
            return;
        }

        // Try cache first - fix user ID access
        const cacheKey = `user-favorites-${user.id || (user as any)._id}`;
        let cachedFavorites = simpleCache.get(cacheKey);

        if (cachedFavorites) {
            setFavoriteSites(cachedFavorites);
            setFavoritesDialogOpen(true);
            return;
        }

        // If no cached data and no favorites in progressData, fetch fresh
        try {
            setFavoritesLoading(true);
            const response = await axios.get('http://localhost:5000/api/favorites', {
                withCredentials: true
            });

            setFavoriteSites(response.data);

            // Cache for 5 minutes (favorites change moderately often)
            simpleCache.set(cacheKey, response.data, 5 * 60 * 1000);

        } catch (error) {
            console.error('Failed to fetch favorites:', error);
            setFavoriteSites([]);
        } finally {
            setFavoritesLoading(false);
        }

        setFavoritesDialogOpen(true);
    };

    // Calculate district progress
    useEffect(() => {
        const calculateDistrictProgress = async () => {
            // Don't calculate if we don't have the required data
            if (!districts || !Array.isArray(districts) || districts.length === 0 || !progressData) {
                setDistrictProgressData([]);
                setDistrictProgressLoading(false);
                return;
            }

            setDistrictProgressLoading(true);

            try {
                const cacheKey = `district-progress-${user?.id || (user as any)?._id}-${districts.length}-${progressData.totalVisits}`;
                let cachedDistrictProgress = simpleCache.get(cacheKey);

                if (cachedDistrictProgress && Array.isArray(cachedDistrictProgress)) {
                    setDistrictProgressData(cachedDistrictProgress);
                    setDistrictProgressLoading(false);
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 100));

                const calculatedProgress = districts.map(district => {
                    if (!district || !district.name) {
                        return {
                            name: "Unknown District",
                            visitedCount: 0,
                            totalSites: 0,
                            completed: false,
                            percentage: 0
                        };
                    }

                    const userDistrictProgress = progressData?.districtProgress?.find(
                        d => d && d.district === district.name
                    );

                    let visitedCount = 0;

                    if (userDistrictProgress?.visitedSites && Array.isArray(userDistrictProgress.visitedSites)) {
                        visitedCount = userDistrictProgress.visitedSites.length;
                    } else {
                        // Count from recent visits
                        const visitedSitesInDistrict = progressData?.recentVisits?.filter(
                            visit => visit && visit.site && visit.site.district === district.name
                        )?.length || 0;

                        // Count from category progress
                        const visitedFromCategories = progressData?.categoryProgress?.reduce((count, category) => {
                            if (!category || !Array.isArray(category.visitedSites)) return count;

                            const sitesByDistrict = category.visitedSites.filter((site: any) => {
                                if (!site) return false;
                                return (site.district === district.name) ||
                                    (site.district && site.district === district.name);
                            });

                            return count + sitesByDistrict.length;
                        }, 0) || 0;

                        visitedCount = Math.max(visitedSitesInDistrict, visitedFromCategories);
                    }

                    const totalSites = userDistrictProgress?.totalSites || district.siteCount || 0;
                    const completed = userDistrictProgress?.completed || (totalSites > 0 && visitedCount >= totalSites);

                    return {
                        name: district.name,
                        visitedCount,
                        totalSites,
                        completed,
                        percentage: totalSites > 0 ? (visitedCount / totalSites) * 100 : 0
                    };
                });

                setDistrictProgressData(calculatedProgress);
                simpleCache.set(cacheKey, calculatedProgress, 5 * 60 * 1000);

            } catch (error) {
                console.error('Error calculating district progress:', error);
                setDistrictProgressData([]);
            } finally {
                setDistrictProgressLoading(false);
            }
        };

        calculateDistrictProgress();
    }, [districts, progressData, user]);

    // Import GeoJSON data
    const handleImportGeojson = async () => {
        if (user?.role !== 'admin') {
            setImportStatus('Unauthorized: Admin access required');
            return;
        }

        try {
            setImportGeojsonLoading(true);
            setImportStatus('Importing GeoJSON data...');

            const response = await axios.post(
                'http://localhost:5000/api/culturalsites/import-geojson',
                {},
                { withCredentials: true }
            );

            setImportStatus(response.data.message);

            // Clear cache to force fresh data
            simpleCache.clear();

            // Refresh data
            setTimeout(() => window.location.reload(), 2000);

        } catch (error: any) {
            console.error('Import failed:', error);
            setImportStatus(
                error.response?.data?.error || 'Failed to import GeoJSON data'
            );
        } finally {
            setImportGeojsonLoading(false);
            // Clear status after 10 seconds
            setTimeout(() => setImportStatus(null), 10000);
        }
    };

    // Delete all cultural sites
    const handleDeleteAllSites = async () => {
        if (user?.role !== 'admin') {
            setDeleteStatus('Unauthorized: Admin access required');
            return;
        }

        const confirmed = window.confirm(
            '⚠️ WARNING: This will permanently delete ALL cultural sites data!\n\n' +
            'This action cannot be undone. Are you absolutely sure?'
        );

        if (!confirmed) return;

        const doubleConfirmed = window.confirm(
            '🚨 FINAL WARNING: You are about to delete ALL cultural sites!\n\n' +
            'Type "DELETE" in your mind and click OK to proceed, or Cancel to abort.'
        );

        if (!doubleConfirmed) return;

        try {
            setDeleteLoading(true);
            setDeleteStatus('Deleting all cultural sites...');

            const response = await axios.delete(
                'http://localhost:5000/api/culturalsites/sites',
                { withCredentials: true }
            );

            setDeleteStatus(response.data.message || 'Sites deleted successfully');

            // Clear all cache and reset state
            simpleCache.clear();

            // Reset all data to empty states
            setProgressData({
                totalVisits: 0,
                totalBadges: 0,
                categoryProgress: [],
                districtProgress: [],
                recentVisits: [],
                favoriteSites: []
            });
            setDistricts([]);
            setDistrictProgressData([]);
            setDistrictSites([]);
            setFavoriteSites([]);

            // Show success message
            setTimeout(() => {
                setDeleteStatus('All sites deleted successfully. The page will refresh.');
                setTimeout(() => window.location.reload(), 1000);
            }, 1000);

        } catch (error: any) {
            console.error('Delete failed:', error);
            setDeleteStatus(
                error.response?.data?.error || 'Failed to delete cultural sites'
            );
        } finally {
            setDeleteLoading(false);
            setTimeout(() => setDeleteStatus(null), 10000);
        }
    };

    // Import Districts data
    const handleImportDistricts = async () => {
        if (user?.role !== 'admin') {
            setImportStatus('Unauthorized: Admin access required');
            return;
        }

        try {
            setImportDistrictsLoading(true);
            setImportStatus('Importing districts data...');

            const response = await axios.post(
                'http://localhost:5000/api/districts/import',
                {},
                { withCredentials: true }
            );

            setImportStatus(response.data.message);

            // Clear cache to force fresh data
            simpleCache.clear();

            // Refresh data
            setTimeout(() => window.location.reload(), 2000);

        } catch (error: any) {
            console.error('Districts import failed:', error);
            setImportStatus(
                error.response?.data?.error || 'Failed to import districts data'
            );
        } finally {
            setImportDistrictsLoading(false);
            // Clear status after 10 seconds
            setTimeout(() => setImportStatus(null), 10000);
        }
    };

    // Assign districts to sites
    const handleAssignDistricts = async () => {
        if (user?.role !== 'admin') {
            setAssignDistrictsStatus('Unauthorized: Admin access required');
            return;
        }
        try {
            setAssignDistrictsLoading(true);
            setAssignDistrictsStatus('Assigning districts to sites...');
            const response = await axios.post(
                'http://localhost:5000/api/districts/assign-districts',
                {},
                { withCredentials: true }
            );
            setAssignDistrictsStatus(response.data.message || 'Districts assigned successfully');
            simpleCache.clear();
            setTimeout(() => window.location.reload(), 2000);
        } catch (error: any) {
            console.error('Assign districts failed:', error);
            setAssignDistrictsStatus(
                error.response?.data?.error || 'Failed to assign districts'
            );
        } finally {
            setAssignDistrictsLoading(false);
            setTimeout(() => setAssignDistrictsStatus(null), 10000);
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="70vh"
                flexDirection="column"
                gap={2}
            >
                <CircularProgress size={48} thickness={4} />
                <Typography variant="h6" color="text.secondary">
                    Loading your exploration data...
                </Typography>
            </Box>
        );
    }

    if (!user) {
        return (
            <Paper
                sx={{
                    textAlign: "center",
                    p: 6,
                    mt: 4,
                    maxWidth: 500,
                    mx: "auto",
                    borderRadius: 3,
                }}
            >
                <Typography variant="h5" color="error" gutterBottom>
                    Access Denied
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Please sign in to view your dashboard.
                </Typography>
            </Paper>
        );
    }

    // Use progressData for badges if available, otherwise fallback to user data
    const visitedCount = progressData?.totalVisits || 0;
    const favoriteCount = progressData?.favoriteSites?.length || 0;
    const badgeCount = progressData?.totalBadges || 0;
    const rank = getRank(visitedCount);

    return (
        <Box sx={{
            width: '100%',
            p: { xs: 1, sm: 2, md: 4 },
            bgcolor: 'background.default',
            minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
            boxSizing: 'border-box',
        }}>
            {/* Content container with max width */}
            <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 0.5, sm: 2 } }}>
                {/* Header Section */}
                <Box sx={{ mb: { xs: 2, sm: 4 } }}>
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        textAlign="center"
                        sx={{
                            mb: { xs: 1, sm: 2 },
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Your Cultural Journey
                    </Typography>

                    <Typography
                        variant="h6"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                        Track your exploration progress and discover new cultural sites
                    </Typography>
                </Box>

                {/* User Profile or Admin Section */}
                <Box sx={{ mb: 4 }}>
                    {user?.role === 'admin' ? (
                        <Card sx={{
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                            color: 'white'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                        <AdminPanelSettingsIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700}>
                                            Admin Dashboard
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                            Manage cultural sites data
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Grid container spacing={3}>
                                    {/* Admin Status */}
                                    <Grid xs={12} md={3}>
                                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <AdminPanelSettingsIcon sx={{ fontSize: 40, mb: 1, color: 'white' }} />
                                                <Typography variant="h4" fontWeight={700} color="white">
                                                    Admin
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    Administrator Panel
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Import GeoJSON Section */}
                                    <Grid xs={12} md={3}>
                                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={importGeojsonLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                                    onClick={handleImportGeojson}
                                                    disabled={importGeojsonLoading || importDistrictsLoading || deleteLoading}
                                                    sx={{
                                                        bgcolor: 'rgba(16, 185, 129, 0.9)',
                                                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 1)' },
                                                        '&:disabled': { bgcolor: 'rgba(100, 100, 100, 0.5)' },
                                                        mb: 1,
                                                        minWidth: 150
                                                    }}
                                                >
                                                    {importGeojsonLoading ? 'Importing...' : 'Import Sites'}
                                                </Button>
                                                <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                                    Import cultural sites from GeoJSON
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Import Districts Section */}
                                    <Grid xs={12} md={3}>
                                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={importDistrictsLoading ? <CircularProgress size={20} color="inherit" /> : <MapIcon />}
                                                    onClick={handleImportDistricts}
                                                    disabled={importGeojsonLoading || importDistrictsLoading || deleteLoading}
                                                    sx={{
                                                        bgcolor: 'rgba(59, 130, 246, 0.9)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 1)' },
                                                        '&:disabled': { bgcolor: 'rgba(100, 100, 100, 0.5)' },
                                                        mb: 1,
                                                        minWidth: 150
                                                    }}
                                                >
                                                    {importDistrictsLoading ? 'Importing...' : 'Import Districts'}
                                                </Button>
                                                <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                                    Import districts from sites data
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Delete Section */}
                                    <Grid xs={12} md={3}>
                                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                                    onClick={handleDeleteAllSites}
                                                    disabled={importGeojsonLoading || importDistrictsLoading || deleteLoading}
                                                    sx={{
                                                        bgcolor: 'rgba(239, 68, 68, 0.9)',
                                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 1)' },
                                                        '&:disabled': { bgcolor: 'rgba(100, 100, 100, 0.5)' },
                                                        mb: 1,
                                                        minWidth: 150
                                                    }}
                                                >
                                                    {deleteLoading ? 'Deleting...' : 'Delete All'}
                                                </Button>
                                                <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                                    ⚠️ Permanently delete all sites
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Assign Districts Section */}
                                    <Grid xs={12} md={3}>
                                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={assignDistrictsLoading ? <CircularProgress size={20} color="inherit" /> : <MapIcon />}
                                                    onClick={handleAssignDistricts}
                                                    disabled={importGeojsonLoading || importDistrictsLoading || deleteLoading || assignDistrictsLoading}
                                                    sx={{
                                                        bgcolor: 'rgba(59, 130, 246, 0.9)',
                                                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 1)' },
                                                        '&:disabled': { bgcolor: 'rgba(100, 100, 100, 0.5)' },
                                                        mb: 1,
                                                        minWidth: 150
                                                    }}
                                                >
                                                    {assignDistrictsLoading ? 'Assigning...' : 'Assign Districts'}
                                                </Button>
                                                <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                                    Assign districts to all sites
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

                                {/* Status Messages */}
                                {(importStatus || deleteStatus || assignDistrictsStatus) && (
                                    <Box sx={{ mt: 3 }}>
                                        {importStatus && (
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    mb: 2,
                                                    bgcolor: importStatus.includes('failed') || importStatus.includes('Unauthorized')
                                                        ? 'rgba(239, 68, 68, 0.1)'
                                                        : 'rgba(16, 185, 129, 0.1)',
                                                    border: importStatus.includes('failed') || importStatus.includes('Unauthorized')
                                                        ? '1px solid rgba(239, 68, 68, 0.3)'
                                                        : '1px solid rgba(16, 185, 129, 0.3)',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    📁 Import Status: {importStatus}
                                                </Typography>
                                            </Paper>
                                        )}
                                        {deleteStatus && (
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    bgcolor: deleteStatus.includes('failed') || deleteStatus.includes('Unauthorized')
                                                        ? 'rgba(239, 68, 68, 0.1)'
                                                        : 'rgba(245, 158, 11, 0.1)',
                                                    border: deleteStatus.includes('failed') || deleteStatus.includes('Unauthorized')
                                                        ? '1px solid rgba(239, 68, 68, 0.3)'
                                                        : '1px solid rgba(245, 158, 11, 0.3)',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    🗑️ Delete Status: {deleteStatus}
                                                </Typography>
                                            </Paper>
                                        )}
                                        {assignDistrictsStatus && (
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    bgcolor: assignDistrictsStatus.includes('failed') || assignDistrictsStatus.includes('Unauthorized')
                                                        ? 'rgba(239, 68, 68, 0.1)'
                                                        : 'rgba(59, 130, 246, 0.1)',
                                                    border: assignDistrictsStatus.includes('failed') || assignDistrictsStatus.includes('Unauthorized')
                                                        ? '1px solid rgba(239, 68, 68, 0.3)'
                                                        : '1px solid rgba(59, 130, 246, 0.3)',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    🗺️ Assign Districts: {assignDistrictsStatus}
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        // Regular user profile section - simplified without location

                        <Stack direction="row" alignItems="center" spacing={2}>

                            <UserProfileEdit />
                        </Stack>

                    )}
                </Box>

                {/* Stats Overview Cards - Fix Grid item prop */}
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
                    {/* Rank Card */}
                    <Grid xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: rank.gradient,
                                color: 'white',
                                borderRadius: 3,
                                height: '100%',
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: 'rgba(22, 199, 179, 0.31)',
                                    }}
                                >
                                    <EmojiEventsIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="h6" fontWeight={600}>
                                    {rank.label}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Current Rank
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sites Visited */}
                    <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: 'primary.main',
                                    }}
                                >
                                    <PlaceIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="h4" fontWeight={700} color="primary.main">
                                    {visitedCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Sites Visited
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Badges Earned */}
                    <Grid xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: 'secondary.main',
                                    }}
                                >
                                    <StarIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="h4" fontWeight={700} color="secondary.main">
                                    {badgeCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Badges Earned
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Favorites */}
                    <Grid xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 4px 20px rgba(0,0,0,0.3)'
                                        : '0 4px 20px rgba(0,0,0,0.1)',
                                }
                            }}
                            onClick={handleFavoritesClick}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: 'warning.main',
                                    }}
                                >
                                    <LocationOnIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Typography variant="h4" fontWeight={700} color="warning.main">
                                    {favoriteCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Favorites
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Progress Section */}
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
                    {/* Category Progress */}
                    <Grid xs={12} md={6}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                    <CategoryIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Category Progress
                                    </Typography>
                                </Stack>

                                {error ? (
                                    <Typography color="error">{error}</Typography>
                                ) : loading ? (
                                    <Box textAlign="center" py={4}>
                                        <CircularProgress size={40} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            Loading category data...
                                        </Typography>
                                    </Box>
                                ) : progressData?.categoryProgress &&
                                    Array.isArray(progressData.categoryProgress) &&
                                    progressData.categoryProgress.length > 0 ? (
                                    <Stack spacing={3}>
                                        {progressData.categoryProgress.map((category) => {
                                            if (!category || !category.category) return null;
                                            return (
                                                <Box key={category.category}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                        <Typography variant="body1" fontWeight={500}>
                                                            {category.category.charAt(0).toUpperCase() + category.category.slice(1).replace(/_/g, ' ')}
                                                        </Typography>
                                                        <Chip
                                                            label={`${category.visitedSites?.length || 0}/${category.totalSites || 0}`}
                                                            size="small"
                                                            color={category.completed ? "success" : "default"}
                                                            variant={category.completed ? "filled" : "outlined"}
                                                        />
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={((category.visitedSites?.length || 0) / Math.max(1, category.totalSites || 0)) * 100}
                                                        color={category.completed ? "success" : "primary"}
                                                        sx={{
                                                            height: 10,
                                                            borderRadius: 2,
                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                ) : (
                                    <Box textAlign="center" py={4}>
                                        <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            No category data available yet
                                        </Typography>
                                        {user?.role === 'admin' && (
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                Import GeoJSON data to populate sites
                                            </Typography>
                                        )}
                                        {user?.role !== 'admin' && (
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                Start exploring cultural sites to see your progress!
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* District Progress */}
                    <Grid xs={12} md={6}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                    <MapIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        District Progress
                                    </Typography>
                                    {districtProgressLoading && (
                                        <CircularProgress size={16} thickness={4} />
                                    )}
                                </Stack>

                                {districtProgressLoading ? (
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        flexDirection="column"
                                        sx={{
                                            py: 6,
                                            minHeight: 200
                                        }}
                                    >
                                        <CircularProgress size={40} thickness={4} />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 2, textAlign: 'center' }}
                                        >
                                            Calculating district progress...
                                        </Typography>
                                    </Box>
                                ) : districtProgressData.length > 0 ? (
                                    <Box
                                        sx={{
                                            maxHeight: 400,
                                            overflowY: 'auto',
                                            pr: 1,
                                            '&::-webkit-scrollbar': {
                                                width: '6px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                borderRadius: '3px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: theme.palette.primary.main,
                                                borderRadius: '3px',
                                                '&:hover': {
                                                    background: theme.palette.primary.dark,
                                                },
                                            },
                                        }}
                                    >
                                        <Stack spacing={3}>
                                            {districtProgressData.map((district) => (
                                                <Box
                                                    key={district.name}
                                                    onClick={() => handleDistrictClick(district.name)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        p: 1,
                                                        borderRadius: 1,
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                        }
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                        <Typography variant="body1" fontWeight={500}>
                                                            {district.name || "Unknown"}
                                                        </Typography>
                                                        <Chip
                                                            label={`${district.visitedCount}/${district.totalSites}`}
                                                            size="small"
                                                            color={district.completed ? "success" : "default"}
                                                            variant={district.completed ? "filled" : "outlined"}
                                                        />
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={district.percentage}
                                                        color={district.completed ? "success" : "primary"}
                                                        sx={{
                                                            height: 10,
                                                            borderRadius: 2,
                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                ) : !loading && !districtProgressLoading ? (
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        flexDirection="column"
                                        sx={{
                                            py: 4,
                                            minHeight: 150
                                        }}
                                    >
                                        <MapIcon
                                            sx={{
                                                fontSize: 48,
                                                color: 'text.secondary',
                                                mb: 1
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            No district data available
                                        </Typography>
                                    </Box>
                                ) : null}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Achievements Section */}
                <Card sx={{ borderRadius: 3, mb: { xs: 2, sm: 4 } }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                            <TrendingUpIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Achievements Unlocked
                            </Typography>
                        </Stack>

                        {/* Check if there are any achievements */}
                        {visitedCount < 5 &&
                            (!progressData?.categoryProgress?.some(c => c.completed)) &&
                            (!progressData?.districtProgress?.some(d => d.completed)) ? (
                            // No achievements unlocked
                            <Box textAlign="center" py={3}>
                                <EmojiEventsIcon
                                    sx={{
                                        fontSize: 48,
                                        color: 'text.secondary',
                                        mb: 1,
                                        opacity: 0.5
                                    }}
                                />
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                    No achievements unlocked yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Visit more sites to unlock achievements!
                                </Typography>
                            </Box>
                        ) : (
                            // Show achievements
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {visitedCount >= 5 && (
                                    <Chip
                                        label="Explorer Badge - 5+ sites!"
                                        color="primary"
                                        icon={<EmojiEventsIcon />}
                                        sx={{ mb: 1 }}
                                    />
                                )}
                                {visitedCount >= 15 && (
                                    <Chip
                                        label="Adventurer Badge - 15+ sites!"
                                        color="success"
                                        icon={<EmojiEventsIcon />}
                                        sx={{ mb: 1 }}
                                    />
                                )}
                                {visitedCount >= 30 && (
                                    <Chip
                                        label="Cultural Hero - 30+ sites!"
                                        color="warning"
                                        icon={<EmojiEventsIcon />}
                                        sx={{ mb: 1 }}
                                    />
                                )}
                                {visitedCount >= 50 && (
                                    <Chip
                                        label="Legend Status - 50+ sites!"
                                        color="error"
                                        icon={<EmojiEventsIcon />}
                                        sx={{ mb: 1 }}
                                    />
                                )}
                                {progressData?.categoryProgress?.filter(c => c.completed).map(cat => (
                                    <Chip
                                        key={cat.category}
                                        label={`${cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} Expert!`}
                                        color="success"
                                        icon={<CategoryIcon />}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                                {progressData?.districtProgress?.filter(d => d.completed).map(district => (
                                    <Chip
                                        key={district.district}
                                        label={`${district.district} Explorer!`}
                                        color="info"
                                        icon={<MapIcon />}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </CardContent>
                </Card>

                {/* Badge Showcase */}
                <Card sx={{ borderRadius: 3, mb: { xs: 2, sm: 4 } }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Badge Collection
                        </Typography>
                        <BadgeShowcase
                            progressData={progressData}
                            visitedCount={visitedCount}
                        />
                    </CardContent>
                </Card>

                {/* Recent Visits - Fix null check */}
                {progressData?.recentVisits && progressData.recentVisits.length > 0 && (
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Recent Visits
                            </Typography>
                            <List sx={{ pt: 0 }}>
                                {progressData.recentVisits
                                    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                                    .slice(0, 3)
                                    .map((visit, index) => (
                                        <ListItem
                                            key={visit._id || `${visit.site._id}-${index}`}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                border: `1px solid ${theme.palette.divider}`,
                                                '&:last-child': { mb: 0 }
                                            }}
                                        >
                                            <ListItemIcon>
                                                <PlaceIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {visit.site?.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {visit.site?.category?.charAt(0).toUpperCase() + visit.site?.category?.slice(1)} • {visit.site?.district || "Unknown district"}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Visited on {new Date(visit?.visitDate).toLocaleDateString()}
                                                        </Typography>
                                                    </Stack>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                            </List>
                        </CardContent>
                    </Card>
                )}

                {/* District Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3, m: { xs: 1, sm: 3 } }
                    }}
                >
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={600}>
                                {selectedDistrict} District
                            </Typography>
                            <IconButton onClick={() => setDialogOpen(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent>
                        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                            <Tab label="All Sites" />
                            <Tab label="Visited" />
                            <Tab label="Not Visited" />
                        </Tabs>

                        <List>
                            {districtSites.length > 0 ? (
                                districtSites
                                    .filter(site => {
                                        const isVisitedInRecentVisits = progressData?.recentVisits?.some(
                                            visit => visit.site._id === site._id
                                        );

                                        const isVisitedInCategories = progressData?.categoryProgress?.some(category =>
                                            category.visitedSites.some((visitedSite: any) => {
                                                if (typeof visitedSite === 'string') {
                                                    return visitedSite === site._id;
                                                }
                                                return visitedSite._id === site._id;
                                            })
                                        );

                                        const isVisitedInDistricts = progressData?.districtProgress?.some(district =>
                                            district.visitedSites.some((visitedSite: any) => {
                                                if (typeof visitedSite === 'string') {
                                                    return visitedSite === site._id;
                                                }
                                                return visitedSite._id === site._id;
                                            })
                                        );

                                        const isVisited = isVisitedInRecentVisits || isVisitedInCategories || isVisitedInDistricts;

                                        if (tabValue === 1) return isVisited;
                                        if (tabValue === 2) return !isVisited;
                                        return true;
                                    })
                                    .map(site => {
                                        const isVisitedInRecentVisits = progressData?.recentVisits?.some(
                                            visit => visit.site._id === site._id
                                        );

                                        const isVisitedInCategories = progressData?.categoryProgress?.some(category =>
                                            category.visitedSites.some((visitedSite: any) => {
                                                if (typeof visitedSite === 'string') {
                                                    return visitedSite === site._id;
                                                }
                                                return visitedSite._id === site._id;
                                            })
                                        );

                                        const isVisitedInDistricts = progressData?.districtProgress?.some(district =>
                                            district.visitedSites.some((visitedSite: any) => {
                                                if (typeof visitedSite === 'string') {
                                                    return visitedSite === site._id;
                                                }
                                                return visitedSite._id === site._id;
                                            })
                                        );

                                        const isVisited = isVisitedInRecentVisits || isVisitedInCategories || isVisitedInDistricts;

                                        return (
                                            <ListItem
                                                key={site._id}
                                                sx={{
                                                    borderRadius: 2,
                                                    mb: 1,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    bgcolor: isVisited ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                                }}
                                            >
                                                <ListItemIcon>
                                                    {isVisited ? (
                                                        <PlaceIcon color="success" />
                                                    ) : (
                                                        <PlaceIcon />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography fontWeight={500}>{site.name}</Typography>
                                                            {isVisited && (
                                                                <Chip label="Visited" color="success" size="small" />
                                                            )}
                                                        </Stack>
                                                    }
                                                    secondary={
                                                        <Stack spacing={0.5}>
                                                            <Typography variant="body2">
                                                                {site.category.charAt(0).toUpperCase() + site.category.slice(1)}
                                                            </Typography>
                                                            {site.address && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {[
                                                                        site.address.street,
                                                                        site.address.housenumber,
                                                                        site.address.postcode,
                                                                        site.address.city
                                                                    ].filter(Boolean).join(", ")}
                                                                </Typography>
                                                            )}
                                                            {site.description && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {site.description.substring(0, 100)}
                                                                    {site.description.length > 100 ? "..." : ""}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })
                            ) : (
                                <Typography color="text.secondary">No sites available for this district</Typography>
                            )}
                        </List>
                    </DialogContent>
                </Dialog>

                {/* Favorites Dialog */}
                <Dialog
                    open={favoritesDialogOpen}
                    onClose={() => setFavoritesDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3, m: { xs: 1, sm: 3 } }
                    }}
                >
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <LocationOnIcon color="warning" />
                                <Typography variant="h6" fontWeight={600}>
                                    Your Favorite Sites ({favoriteCount})
                                </Typography>
                            </Stack>
                            <IconButton onClick={() => setFavoritesDialogOpen(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent>
                        {favoritesLoading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                                <CircularProgress size={40} />
                                <Typography variant="body1" sx={{ ml: 2 }}>
                                    Loading your favorite sites...
                                </Typography>
                            </Box>
                        ) : favoriteCount === 0 ? (
                            <Box textAlign="center" py={4}>
                                <LocationOnIcon
                                    sx={{
                                        fontSize: 64,
                                        color: 'text.secondary',
                                        mb: 2
                                    }}
                                />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No Favorites Yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Start exploring and add sites to your favorites!
                                </Typography>
                            </Box>
                        ) : favoriteSites.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Unable to load favorite sites
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    There was an issue loading your favorite sites. Please try again.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={handleFavoritesClick}
                                    sx={{ mt: 2 }}
                                >
                                    Retry
                                </Button>
                            </Box>
                        ) : (
                            <List>
                                {favoriteSites.map((site) => {
                                    const isVisitedInRecentVisits = progressData?.recentVisits?.some(
                                        visit => visit.site._id === site._id
                                    );

                                    const isVisitedInCategories = progressData?.categoryProgress?.some(category =>
                                        category.visitedSites.some((visitedSite: any) => {
                                            if (typeof visitedSite === 'string') {
                                                return visitedSite === site._id;
                                            }
                                            return visitedSite._id === site._id;
                                        })
                                    );

                                    const isVisitedInDistricts = progressData?.districtProgress?.some(district =>
                                        district.visitedSites.some((visitedSite: any) => {
                                            if (typeof visitedSite === 'string') {
                                                return visitedSite === site._id;
                                            }
                                            return visitedSite._id === site._id;
                                        })
                                    );

                                    const isVisited = isVisitedInRecentVisits || isVisitedInCategories || isVisitedInDistricts;

                                    return (
                                        <ListItem
                                            key={site._id}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                border: `1px solid ${theme.palette.divider}`,
                                                bgcolor: isVisited
                                                    ? theme.palette.mode === 'dark'
                                                        ? 'rgba(76, 175, 80, 0.2)'
                                                        : 'rgba(76, 175, 80, 0.1)'
                                                    : 'transparent',
                                                '&:hover': {
                                                    bgcolor: theme.palette.action.hover,
                                                }
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Stack direction="column" alignItems="center" spacing={0.5}>
                                                    {isVisited ? (
                                                        <PlaceIcon color="success" />
                                                    ) : (
                                                        <PlaceIcon color="warning" />
                                                    )}
                                                    <LocationOnIcon color="warning" sx={{ fontSize: 16 }} />
                                                </Stack>
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="body1" fontWeight={500}>
                                                            {site.name}
                                                        </Typography>
                                                        {isVisited && (
                                                            <Chip
                                                                label="Visited"
                                                                color="success"
                                                                size="small"
                                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                                            />
                                                        )}
                                                        <Chip
                                                            label="❤️ Favorite"
                                                            color="warning"
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {site.category?.charAt(0).toUpperCase() + site.category?.slice(1)} • {site.district || "Unknown district"}
                                                        </Typography>
                                                        {site.address && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                📍 {[
                                                                    site.address.street,
                                                                    site.address.housenumber,
                                                                    site.address.postcode,
                                                                    site.address.city
                                                                ].filter(Boolean).join(", ")}
                                                            </Typography>
                                                        )}
                                                        {site.description && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {site.description.substring(0, 120)}
                                                                {site.description.length > 120 ? "..." : ""}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                }
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </Box>
    );
};

export default Dashboard;