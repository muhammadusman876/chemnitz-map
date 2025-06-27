import React from "react";
import { Box, Typography, Button, Container, Stack, Paper, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import ExploreIcon from "@mui/icons-material/Explore";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MapIcon from "@mui/icons-material/Map";

const Landing: React.FC = () => {
    const theme = useTheme();

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

            <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, px: 3 }}>
                <Paper
                    elevation={24}
                    sx={{
                        borderRadius: 4,
                        p: { xs: 4, sm: 6 },
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
                            px: 3,
                            py: 1,
                            borderRadius: 25,
                            mb: 3,
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            boxShadow: "0 4px 16px rgba(255, 107, 53, 0.3)",
                        }}
                    >
                        🎉 Chemnitz 2025 - European Capital of Culture
                    </Box>

                    <ExploreIcon
                        sx={{
                            fontSize: 70,
                            color: "primary.main",
                            mb: 2,
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                        }}
                    />

                    <Typography
                        variant="h1"
                        fontWeight={900}
                        sx={{
                            mb: 2,
                            letterSpacing: 1,
                            fontSize: { xs: "2.2rem", sm: "2.8rem" },
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
                            mb: 2,
                            fontWeight: 400,
                            color: "text.primary",
                            fontSize: { xs: "1.1rem", sm: "1.3rem" }
                        }}
                    >
                        Explore Cultural Heritage
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            mb: 3.5,
                            fontWeight: 400,
                            lineHeight: 1.6,
                            maxWidth: "600px",
                            mx: "auto",
                            fontSize: { xs: "1rem", sm: "1.1rem" }
                        }}
                    >
                        Embark on a cultural journey through Chemnitz's museums, historical landmarks, and hidden gems.
                        Earn exclusive badges and track your progress as you explore our vibrant cultural landscape!
                    </Typography>

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={3}
                        justifyContent="center"
                        sx={{ mb: 4 }}
                    >
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            size="large"
                            startIcon={<EmojiEventsIcon />}
                            sx={{
                                fontWeight: 600,
                                px: 5,
                                py: 1.8,
                                borderRadius: 3,
                                fontSize: "1.1rem",
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
                            Start Your Journey
                        </Button>

                        <Button
                            component={Link}
                            to="/cultureSite"
                            variant="outlined"
                            size="large"
                            startIcon={<MapIcon />}
                            sx={{
                                fontWeight: 600,
                                px: 5,
                                py: 1.8,
                                borderRadius: 3,
                                fontSize: "1.1rem",
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
                            Explore Interactive Map
                        </Button>
                    </Stack>

                    {/* Feature highlights */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={4}
                        justifyContent="center"
                        sx={{ mb: 3 }}
                    >
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ fontSize: "1rem" }}>
                                🏛️ 50+ Sites
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                                Museums & Landmarks
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ fontSize: "1rem" }}>
                                🏆 Achievement System
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                                Collect Unique Badges
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ fontSize: "1rem" }}>
                                📍 Interactive Map
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                                Real-time Navigation
                            </Typography>
                        </Box>
                    </Stack>

                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: "0.95rem" }}>
                        Already exploring with us?{" "}
                        <Button
                            component={Link}
                            to="/login"
                            sx={{
                                fontWeight: 600,
                                textTransform: "none",
                                p: 0,
                                minWidth: 0,
                                fontSize: "0.95rem",
                                textDecoration: "underline",
                                "&:hover": {
                                    textDecoration: "underline",
                                    backgroundColor: "transparent"
                                }
                            }}
                        >
                            Sign in here
                        </Button>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Landing;