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
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ExploreIcon from '@mui/icons-material/Explore';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import BadgeShowcase from "../components/badges/BadgeShowcase";
import DistrictMapView from '../components/map/DistrictMapView';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const rankConfig = [
    { min: 0, label: "Explorer", color: "default", icon: <EmojiEventsIcon /> },
    { min: 5, label: "Adventurer", color: "primary", icon: <EmojiEventsIcon color="primary" /> },
    { min: 15, label: "Trailblazer", color: "success", icon: <EmojiEventsIcon color="success" /> },
    { min: 30, label: "Cultural Hero", color: "warning", icon: <EmojiEventsIcon color="warning" /> },
    { min: 50, label: "Legend", color: "error", icon: <EmojiEventsIcon color="error" /> },
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
    }>;
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
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [districts, setDistricts] = useState<DistrictData[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [districtSites, setDistrictSites] = useState<SiteData[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const navigate = useNavigate();

    // Fetch user progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/progress/progress', {
                    withCredentials: true
                });
                console.log("Progress data:", response.data);
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
                console.log("Districts data:", response.data);
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
            console.log("District sites:", response.data);
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box textAlign="center" mt={8}>
                <Typography variant="h5" color="error">
                    User not found or not logged in.
                </Typography>
            </Box>
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
        <Box maxWidth="md" mx="auto" mt={4} px={2}>
            {/* User Profile Card */}
            <Card sx={{ mb: 4, p: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
                    <Avatar
                        src={user.avatar}
                        alt={user.username}
                        sx={{ width: 96, height: 96, fontSize: 40, bgcolor: "primary.main" }}
                    >
                        {user.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="h4" fontWeight={700}>
                            {user.username}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {user.email}
                        </Typography>
                        <Stack direction="row" spacing={2} mt={2}>
                            <Chip
                                icon={rank.icon}
                                label={rank.label}
                                color={rank.color}
                                sx={{ fontWeight: 600, fontSize: 16 }}
                            />
                            <Chip
                                icon={<LocationOnIcon color="action" />}
                                label={user.location?.address || "No location set"}
                                variant="outlined"
                            />
                            <Chip
                                label={user.role === "admin" ? "Admin" : "User"}
                                color={user.role === "admin" ? "error" : "default"}
                                variant="outlined"
                            />
                        </Stack>
                    </Box>
                </Stack>
            </Card>

            {/* Main Content */}
            <Grid container spacing={3}>
                {/* Achievements Card */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Achievements
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Typography>
                                    <b>Sites Visited:</b> {visitedCount}
                                </Typography>
                                <Typography>
                                    <b>Badges Earned:</b> {badgeCount}
                                </Typography>
                                <Typography>
                                    <b>Favorites:</b> {favoriteCount}
                                </Typography>
                                <Typography>
                                    <b>Rank:</b> {rank.label}
                                </Typography>

                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {visitedCount >= 5 && (
                                        <Chip label="Visited 5+ sites!" color="primary" size="small" />
                                    )}
                                    {visitedCount >= 15 && (
                                        <Chip label="Visited 15+ sites!" color="success" size="small" />
                                    )}
                                    {visitedCount >= 30 && (
                                        <Chip label="Visited 30+ sites!" color="warning" size="small" />
                                    )}
                                    {visitedCount >= 50 && (
                                        <Chip label="Visited 50+ sites!" color="error" size="small" />
                                    )}
                                    {progressData?.categoryProgress?.filter(c => c.completed).map(cat => (
                                        <Chip
                                            key={cat.category}
                                            label={`${cat.category} Expert!`}
                                            color="success"
                                            size="small"
                                            icon={<CategoryIcon />}
                                        />
                                    ))}
                                    {progressData?.districtProgress?.filter(d => d.completed).map(district => (
                                        <Chip
                                            key={district.district}
                                            label={`${district.district} Conqueror!`}
                                            color="warning"
                                            size="small"
                                            icon={<MapIcon />}
                                        />
                                    ))}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Progress Card */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Exploration Progress
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {error ? (
                                <Typography color="error">{error}</Typography>
                            ) : (
                                <Stack spacing={3}>
                                    {/* Category Progress */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            Categories
                                        </Typography>
                                        {progressData?.categoryProgress?.length > 0 ? (
                                            progressData.categoryProgress.map((category) => (
                                                <Box key={category.category} mb={1}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2">
                                                            {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {category.visitedSites.length}/{category.totalSites}
                                                        </Typography>
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={(category.visitedSites.length / Math.max(1, category.totalSites)) * 100}
                                                        color={category.completed ? "success" : "primary"}
                                                        sx={{ height: 8, borderRadius: 1 }}
                                                    />
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No category data available</Typography>
                                        )}
                                    </Box>

                                    {/* District Progress */}
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            Districts
                                        </Typography>
                                        {districtProgress.length > 0 ? (
                                            districtProgress.map((district) => (
                                                <Box
                                                    key={district.name}
                                                    mb={1}
                                                    onClick={() => handleDistrictClick(district.name)}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2">
                                                            {district.name || "Unknown"}
                                                            {district.completed && " ✓"}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {district.visitedCount}/{district.totalSites}
                                                        </Typography>
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={district.percentage}
                                                        color={district.completed ? "success" : "primary"}
                                                        sx={{ height: 8, borderRadius: 1 }}
                                                    />
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No district data available</Typography>
                                        )}
                                    </Box>
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Exploration Map */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                District Exploration Map
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Explore Chemnitz districts and track your progress. Click on a district to see details.
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<MapIcon />}
                                onClick={openDistrictMap}
                                fullWidth
                            >
                                Open District Map
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Badges Showcase */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Badge Collection
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <BadgeShowcase
                                progressData={progressData}
                                visitedCount={visitedCount}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Visits */}
                {progressData?.recentVisits?.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Recent Visits
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List>
                                    {progressData.recentVisits.map((visit) => (
                                        <ListItem key={visit.site._id}>
                                            <ListItemIcon>
                                                <PlaceIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={visit.site.name}
                                                secondary={
                                                    <>
                                                        {visit.site.category} • {visit.site.district || "Unknown district"}
                                                        <br />
                                                        Visited on {new Date(visit.visitDate).toLocaleDateString()}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* District Details Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            {selectedDistrict} District
                        </Typography>
                        <IconButton onClick={() => setDialogOpen(false)}>
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
                                    // Check all possible sources for visited sites
                                    const isVisitedInRecentVisits = progressData?.recentVisits?.some(
                                        visit => visit.site._id === site._id
                                    );

                                    // Check in categoryProgress
                                    const isVisitedInCategories = progressData?.categoryProgress?.some(category =>
                                        category.visitedSites.some((visitedSite: any) => {
                                            // Handle both object and string ID references
                                            if (typeof visitedSite === 'string') {
                                                return visitedSite === site._id;
                                            }
                                            return visitedSite._id === site._id;
                                        })
                                    );

                                    // Check in districtProgress
                                    const isVisitedInDistricts = progressData?.districtProgress?.some(district =>
                                        district.visitedSites.some((visitedSite: any) => {
                                            // Handle both object and string ID references
                                            if (typeof visitedSite === 'string') {
                                                return visitedSite === site._id;
                                            }
                                            return visitedSite._id === site._id;
                                        })
                                    );

                                    // Combined check
                                    const isVisited = isVisitedInRecentVisits || isVisitedInCategories || isVisitedInDistricts;

                                    if (tabValue === 1) return isVisited;
                                    if (tabValue === 2) return !isVisited;
                                    return true; // All sites for tab 0
                                })
                                .map(site => {
                                    // Update the isVisited check here too
                                    const isVisitedInRecentVisits = progressData?.recentVisits?.some(
                                        visit => visit.site._id === site._id
                                    );

                                    const isVisitedInCategories = progressData?.categoryProgress?.some(category =>
                                        category.visitedSites.some((visitedSite: any) => {
                                            // Handle both object and string ID references
                                            if (typeof visitedSite === 'string') {
                                                return visitedSite === site._id;
                                            }
                                            return visitedSite._id === site._id;
                                        })
                                    );

                                    const isVisitedInDistricts = progressData?.districtProgress?.some(district =>
                                        district.visitedSites.some((visitedSite: any) => {
                                            // Handle both object and string ID references
                                            if (typeof visitedSite === 'string') {
                                                return visitedSite === site._id;
                                            }
                                            return visitedSite._id === site._id;
                                        })
                                    );

                                    const isVisited = isVisitedInRecentVisits || isVisitedInCategories || isVisitedInDistricts;

                                    return (
                                        <ListItem key={site._id}>
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
                                                        <Typography>{site.name}</Typography>
                                                        {isVisited && (
                                                            <Chip label="Visited" color="success" size="small" />
                                                        )}
                                                    </Stack>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography variant="body2">
                                                            {site.category}
                                                        </Typography>
                                                        {site.address && (
                                                            <Typography variant="body2">
                                                                {[
                                                                    site.address.street,
                                                                    site.address.housenumber,
                                                                    site.address.postcode,
                                                                    site.address.city
                                                                ].filter(Boolean).join(", ")}
                                                            </Typography>
                                                        )}
                                                        {site.description && (
                                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                                {site.description.substring(0, 100)}
                                                                {site.description.length > 100 ? "..." : ""}
                                                            </Typography>
                                                        )}
                                                    </>
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
        </Box>
    );
};

export default Dashboard;