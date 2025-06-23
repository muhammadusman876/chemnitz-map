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
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAuth } from "../hooks/useAuth";

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

const Dashboard = () => {
    const {user} = useAuth();
    const [loading, setLoading] = useState(false);


    if (loading)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );

    if (!user)
        return (
            <Box textAlign="center" mt={8}>
                <Typography variant="h5" color="error">
                    User not found or not logged in.
                </Typography>
            </Box>
        );

    const visitedCount = user.visitedSites?.length || 0;
    const favoriteCount = user.favorites?.length || 0;
    const rank = getRank(visitedCount);

    return (
        <Box maxWidth="md" mx="auto" mt={4} px={2}>
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
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Achievements
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={1}>
                                <Typography>
                                    <b>Sites Visited:</b> {visitedCount}
                                </Typography>
                                <Typography>
                                    <b>Favorites:</b> {favoriteCount}
                                </Typography>
                                <Typography>
                                    <b>Rank:</b> {rank.label}
                                </Typography>
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
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Profile Settings
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography>
                                <b>Theme:</b> {user.settings?.theme || "Default"}
                            </Typography>
                            <Typography>
                                <b>Language:</b> {user.settings?.language || "en"}
                            </Typography>
                            {/* Add more settings as needed */}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;