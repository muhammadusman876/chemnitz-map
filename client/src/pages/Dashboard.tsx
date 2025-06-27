import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Avatar,
    Chip,
    Stack,
    Card,
    CardContent,
    Grid,
    Divider,
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
import ExploreIcon from '@mui/icons-material/Explore';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import BadgeShowcase from "../components/badges/BadgeShowcase";
import DistrictMapView from '../components/map/DistrictMapView';
import { useNavigate } from 'react-router-dom';
import UserProfileEdit from "../components/profile/UserProfileEdit";

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
    favoriteSites: Array<SiteData>; // Add this line
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
    const navigate = useNavigate();

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

    // Fetch user progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/progress/progress', {
                    withCredentials: true
                });
                setProgressData(response.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch progress data:', err);
                setError('Failed to load your exploration progress');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProgress();
        }
    }, [user]);

    // Fetch all districts
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/districts/list');
                setDistricts(response.data);
            } catch (err) {
                console.error('Failed to fetch districts:', err);
            }
        };

        fetchDistricts();
    }, []);

    // Fetch sites for a specific district when selected
    const handleDistrictClick = async (districtName: string) => {
        try {
            setSelectedDistrict(districtName);
            const response = await axios.get(`http://localhost:5000/api/districts/${encodeURIComponent(districtName)}`);
            setDistrictSites(response.data);
            setDialogOpen(true);
        } catch (err) {
            console.error(`Failed to fetch sites for district ${districtName}:`, err);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const openDistrictMap = () => {
        // Store a preference in sessionStorage that MapContainer should open in district mode
        sessionStorage.setItem('preferredMapMode', 'districts');
        navigate('/map');
    };

    // Fetch favorite sites details
    const handleFavoritesClick = () => {
        console.log('Favorites clicked, favorite sites:', progressData?.favoriteSites); // Debug log

        if (!progressData?.favoriteSites?.length) {
            console.log('No favorites found, opening empty dialog');
            setFavoritesDialogOpen(true);
            return;
        }

        // Use the favorite sites from progress data
        setFavoriteSites(progressData.favoriteSites);
        setFavoritesDialogOpen(true);
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
    const favoriteCount = user.favorites?.length || 0;
    const badgeCount = progressData?.totalBadges || 0;
    const rank = getRank(visitedCount);

    // Calculate district progress
    const districtProgress = districts.map(district => {
        // Find if this district exists in the user's progress
        const userDistrictProgress = progressData?.districtProgress?.find(
            d => d.district === district.name
        );

        // Count sites in this district that have been visited from both places:
        // 1. From district progress if available
        // 2. From recent visits as fallback
        // 3. From all category progress as a second fallback
        let visitedCount = 0;

        if (userDistrictProgress?.visitedSites?.length > 0) {
            // Use district progress data if available
            visitedCount = userDistrictProgress.visitedSites.length;
        } else {
            // Count sites from recent visits that match this district
            const visitedSitesInDistrict = progressData?.recentVisits?.filter(
                visit => visit.site.district === district.name
            )?.length || 0;

            // Also check all category progress for sites in this district
            const visitedFromCategories = progressData?.categoryProgress?.reduce((count, category) => {
                // Skip if no visited sites
                if (!category.visitedSites?.length) return count;

                // Count sites in this category that belong to this district
                const sitesByDistrict = category.visitedSites.filter((site: any) => {
                    // Handle both populated and non-populated cases
                    return (site.district === district.name) ||
                        (site.district && site.district === district.name);
                });

                return count + sitesByDistrict.length;
            }, 0) || 0;

            // Use the highest count found
            visitedCount = Math.max(visitedSitesInDistrict, visitedFromCategories);
        }

        const totalSites = userDistrictProgress?.totalSites || district.siteCount;
        const completed = userDistrictProgress?.completed || (totalSites > 0 && visitedCount >= totalSites);

        return {
            name: district.name,
            visitedCount,
            totalSites,
            completed,
            percentage: totalSites > 0 ? (visitedCount / totalSites) * 100 : 0
        };
    });

    return (
        <Box sx={{
            // Remove maxWidth and use full width
            width: '100%',
            p: { xs: 2, md: 4 },
            bgcolor: 'background.default',
            minHeight: 'calc(100vh - 64px)',
        }}>
            {/* Content container with max width */}
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        gutterBottom
                        sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center',
                            mb: 1
                        }}
                    >
                        Your Cultural Journey
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: 3 }}
                    >
                        Track your exploration progress and discover new cultural sites
                    </Typography>
                </Box>

                {/* User Profile Section */}
                <Box sx={{ mb: 4 }}>

                    <UserProfileEdit />
                </Box>

                {/* Stats Overview Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Rank Card */}
                    <Grid item xs={12} sm={6} md={3}>
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
                                        bgcolor: 'rgba(255,255,255,0.2)',
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Category Progress */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                    <CategoryIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Category Progress
                                    </Typography>
                                </Stack>

                                {error ? (
                                    <Typography color="error">{error}</Typography>
                                ) : progressData?.categoryProgress?.length > 0 ? (
                                    <Stack spacing={3}>
                                        {progressData.categoryProgress.map((category) => (
                                            <Box key={category.category}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {category.category.charAt(0).toUpperCase() + category.category.slice(1).replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Chip
                                                        label={`${category.visitedSites.length}/${category.totalSites}`}
                                                        size="small"
                                                        color={category.completed ? "success" : "default"}
                                                        variant={category.completed ? "filled" : "outlined"}
                                                    />
                                                </Stack>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(category.visitedSites.length / Math.max(1, category.totalSites)) * 100}
                                                    color={category.completed ? "success" : "primary"}
                                                    sx={{
                                                        height: 10,
                                                        borderRadius: 2,
                                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No category data available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* District Progress */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                    <MapIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        District Progress
                                    </Typography>
                                </Stack>

                                {districtProgress.length > 0 ? (
                                    <Box
                                        sx={{
                                            maxHeight: 400, // Fixed height to match category progress
                                            overflowY: 'auto', // Make it scrollable
                                            pr: 1, // Add padding for scrollbar
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
                                            {districtProgress.map((district) => (
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
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No district data available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Achievements Section */}
                <Card sx={{ borderRadius: 3, mb: 4 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                            <TrendingUpIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Achievements Unlocked
                            </Typography>
                        </Stack>

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
                    </CardContent>
                </Card>

                {/* Badge Showcase */}
                <Card sx={{ borderRadius: 3, mb: 4 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Badge Collection
                        </Typography>
                        <BadgeShowcase
                            progressData={progressData}
                            visitedCount={visitedCount}
                        />
                    </CardContent>
                </Card>

                {/* Recent Visits */}
                {progressData?.recentVisits?.length > 0 && (
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Recent Visits
                            </Typography>
                            <List sx={{ pt: 0 }}>
                                {progressData.recentVisits
                                    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()) // Sort by date descending (newest first)
                                    .slice(0, 3) // Take only the 3 most recent
                                    .map((visit, index) => (
                                        <ListItem
                                            key={visit._id || `${visit.site._id}-${index}`} // Use visit ID or fallback
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
                                                        {visit.site.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {visit.site.category?.charAt(0).toUpperCase() + visit.site.category?.slice(1)} • {visit.site.district || "Unknown district"}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Visited on {new Date(visit.visitDate).toLocaleDateString()}
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

                {/* District Dialog - Keep your existing dialog code with minor styling updates */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3 }
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
                        sx: { borderRadius: 3 }
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
                            // Add this case for when we have favorites but no site data loaded
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
                                    // Check if this site has been visited using the correct data structure
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