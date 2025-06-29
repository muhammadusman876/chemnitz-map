import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Container, Stack, Paper, useTheme, Card, CardContent, Avatar, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import ExploreIcon from "@mui/icons-material/Explore";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MapIcon from "@mui/icons-material/Map";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonIcon from "@mui/icons-material/Person";

interface LeaderboardUser {
    username: string;
    avatar?: string;
    monthlyVisits: number;
    visitedSites: number;
    latestVisitDate: string;
    joinDate: string;
}

const Landing: React.FC = () => {
    const theme = useTheme();
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [currentMonth, setCurrentMonth] = useState<string>("");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/progress/leaderboard');
                const data = await response.json();
                setLeaderboard(data.leaderboard.slice(0, 5)); // Top 5 for landing page
                setCurrentMonth(data.month);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <Box
            sx={{
                height: "calc(100vh - 64px)", // Fixed height to prevent scrolling
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                // Background image with blur
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: "url('https://b1858814.smushcdn.com/1858814/wp-content/uploads/2024/11/Chemnitz2025.jpg?lossy=1&strip=1&webp=1')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    filter: "blur(3px)",
                    transform: "scale(1.1)",
                    zIndex: -2,
                },
                // Dark overlay for better text readability - proper dark mode colors
                "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: theme.palette.mode === 'dark'
                        ? "linear-gradient(135deg, rgba(18, 18, 18, 0.85) 0%, rgba(33, 33, 33, 0.8) 100%)" // Proper dark colors
                        : "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)",
                    zIndex: -1,
                },
            }}
        >
            {/* Image Credit - Top Right Corner */}
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    background: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(8px)",
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: "white",
                        fontSize: "0.7rem",
                        opacity: 0.8,
                        "& a": {
                            color: "white",
                            textDecoration: "none",
                            "&:hover": {
                                textDecoration: "underline",
                            }
                        }
                    }}
                >
                    Image: <a href="https://www.eisloewen.de/2024/11/18/gemeinsam-fuer-sachsen-kultur-und-sport-vereint/" target="_blank" rel="noopener noreferrer">Eislöwen Chemnitz</a>
                </Typography>
            </Box>

            {/* Monthly Leaderboard - Top Left Corner */}
            {leaderboard.length > 0 && (
                <Card
                    sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        zIndex: 10,
                        width: 280,
                        background: theme.palette.mode === 'dark'
                            ? "rgba(18, 18, 18, 0.95)"
                            : "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: theme.palette.mode === 'dark'
                            ? "1px solid rgba(255, 255, 255, 0.1)"
                            : "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <TrendingUpIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight={600}>
                                {currentMonth} Leaders
                            </Typography>
                        </Stack>

                        <Stack spacing={1}>
                            {leaderboard.map((user, index) => (
                                <Box
                                    key={user.username}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        backgroundColor: index === 0
                                            ? (theme.palette.mode === 'dark' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.1)')
                                            : 'transparent',
                                        border: index === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : 'none',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            minWidth: 20,
                                            textAlign: "center",
                                            color: index === 0 ? '#FFD700' : 'text.secondary'
                                        }}
                                    >
                                        {index === 0 ? '👑' : `#${index + 1}`}
                                    </Typography>

                                    <Avatar sx={{ width: 24, height: 24 }}>
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.username} />
                                        ) : (
                                            <PersonIcon fontSize="small" />
                                        )}
                                    </Avatar>

                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {user.username}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={user.monthlyVisits}
                                        size="small"
                                        color="primary"
                                        sx={{ fontSize: "0.7rem", height: 20 }}
                                    />
                                </Box>
                            ))}
                        </Stack>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", textAlign: "center", mt: 1 }}
                        >
                            Sites visited this month
                        </Typography>
                    </CardContent>
                </Card>
            )}

            <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, px: 100, maxHeight: 600 }}>
                <Paper
                    elevation={24}
                    sx={{
                        borderRadius: 4,
                        p: 2, // set padding to 2px all around
                        textAlign: "center",
                        background: theme.palette.mode === 'dark'
                            ? "rgba(18, 18, 18, 0.95)" // Match dashboard dark background
                            : "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        boxShadow: theme.palette.mode === 'dark'
                            ? "0 32px 64px 0 rgba(0, 0, 0, 0.7)" // Darker shadow for dark mode
                            : "0 32px 64px 0 rgba(0, 0, 0, 0.2)",
                        border: theme.palette.mode === 'dark'
                            ? "1px solid rgba(255, 255, 255, 0.05)" // Subtle border for dark mode
                            : "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                >
                    {/* Chemnitz 2025 Badge */}
                    <Box
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
                            color: "white",
                            px: 2,
                            py: 0.7,
                            borderRadius: 25,
                            mb: 2,
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            boxShadow: "0 4px 16px rgba(255, 107, 53, 0.3)",
                        }}
                    >
                        🎉 Chemnitz 2025 - European Capital of Culture
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            mb: 1.5,
                        }}
                    >
                        <ExploreIcon
                            sx={{
                                fontSize: 60,
                                color: "primary.main",
                                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                                mb: { xs: 0.5, sm: 1 },
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h1"
                        fontWeight={900}
                        sx={{
                            mb: 1.5,
                            letterSpacing: 1,
                            fontSize: { xs: "2rem", sm: "2.5rem" },
                            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        }}
                    >
                        Discover Chemnitz
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            mb: 1.2,
                            fontWeight: 400,
                            color: "text.primary",
                            fontSize: { xs: "1rem", sm: "1.2rem" }
                        }}
                    >
                        Explore Cultural Heritage
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            mb: 2.2,
                            fontWeight: 400,
                            lineHeight: 1.6,
                            maxWidth: "600px",
                            mx: "auto",
                            fontSize: { xs: "0.98rem", sm: "1.05rem" }
                        }}
                    >
                        Embark on a cultural journey through Chemnitz's museums, historical landmarks, and hidden gems.
                        Earn exclusive badges and track your progress as you explore our vibrant cultural landscape!
                    </Typography>

                    {/* Auth Buttons - Login & Register side by side */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        justifyContent="center"
                        sx={{ mb: 1.5 }}
                    >
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            size="large"
                            startIcon={<PersonIcon />}
                            sx={{
                                fontWeight: 600,
                                px: 4,
                                py: 1.3,
                                borderRadius: 3,
                                fontSize: "1.05rem",
                                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                                boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)",
                                textTransform: "none",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                }
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            variant="outlined"
                            size="large"
                            startIcon={<EmojiEventsIcon />}
                            sx={{
                                fontWeight: 600,
                                px: 4,
                                py: 1.3,
                                borderRadius: 3,
                                fontSize: "1.05rem",
                                borderWidth: 2,
                                textTransform: "none",
                                borderColor: "primary.main",
                                color: "primary.main",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    borderWidth: 2,
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.2)",
                                    backgroundColor: "primary.main",
                                    color: "white",
                                }
                            }}
                        >
                            Register
                        </Button>
                    </Stack>

                    {/* Explore Interactive Map button below auth buttons */}
                    <Button
                        component={Link}
                        to="/cultureSite"
                        variant="outlined"
                        size="large"
                        startIcon={<MapIcon />}
                        sx={{
                            fontWeight: 600,
                            px: 4,
                            py: 1.3,
                            borderRadius: 3,
                            fontSize: "1.05rem",
                            borderWidth: 2,
                            textTransform: "none",
                            borderColor: "primary.main",
                            color: "primary.main",
                            mt: 0.5,
                            mb: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                borderWidth: 2,
                                transform: "translateY(-2px)",
                                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.2)",
                                backgroundColor: "primary.main",
                                color: "white",
                            }
                        }}
                    >
                        Explore Interactive Map
                    </Button>

                    {/* Feature highlights */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 1.5, sm: 2.5 }}
                        justifyContent="center"
                        alignItems="stretch"
                        sx={{ mb: 2, width: '100%' }}
                    >
                        <Box sx={{ textAlign: "center", flex: 1, minWidth: 0, mb: { xs: 1.5, sm: 0 } }}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ fontSize: { xs: "0.95rem", sm: "0.98rem" } }}>
                                🏛️ 50+ Sites
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.78rem", sm: "0.8rem" } }}>
                                Museums & Landmarks
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ fontSize: { xs: "0.95rem", sm: "0.98rem" } }}>
                                🏆 Achievement System
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.78rem", sm: "0.8rem" } }}>
                                Collect Unique Badges
                            </Typography>
                        </Box>
                    </Stack>


                </Paper>
            </Container>
        </Box>
    );
};

export default Landing;