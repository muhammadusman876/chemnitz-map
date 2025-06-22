import React from "react";
import { Box, Typography, Button, Container, Stack, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import ExploreIcon from "@mui/icons-material/Explore";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MapIcon from "@mui/icons-material/Map";

const Landing: React.FC = () => {
    return (
        <Box
            sx={{
                minHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
                py: 8,
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={8}
                    sx={{
                        borderRadius: 5,
                        p: { xs: 3, sm: 6 },
                        textAlign: "center",
                        background: "rgba(255,255,255,0.95)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    }}
                >
                    <ExploreIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                    <Typography
                        variant="h2"
                        fontWeight={900}
                        color="primary"
                        sx={{ mb: 2, letterSpacing: 1, fontSize: { xs: "2.2rem", sm: "3rem" } }}
                    >
                        Discover Chemnitz's Cultural Sites
                    </Typography>
                    <Typography
                        variant="h5"
                        color="text.secondary"
                        sx={{ mb: 4, fontWeight: 400 }}
                    >
                        Explore museums, historical landmarks, and hidden gems. Earn badges as you visit new places and track your cultural journey across the city!
                    </Typography>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="center"
                        sx={{ mb: 3 }}
                    >
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            size="large"
                            color="primary"
                            startIcon={<EmojiEventsIcon />}
                            sx={{
                                fontWeight: 700,
                                px: 4,
                                borderRadius: 3,
                                fontSize: "1.1rem",
                                boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.10)",
                                textTransform: "none",
                            }}
                        >
                            Get Started
                        </Button>
                        <Button
                            component={Link}
                            to="/cultureSite"
                            variant="outlined"
                            size="large"
                            color="primary"
                            startIcon={<MapIcon />}
                            sx={{
                                fontWeight: 700,
                                px: 4,
                                borderRadius: 3,
                                fontSize: "1.1rem",
                                textTransform: "none",
                            }}
                        >
                            Explore Map
                        </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Already have an account?{" "}
                        <Button
                            component={Link}
                            to="/login"
                            color="primary"
                            sx={{ fontWeight: 600, textTransform: "none", p: 0, minWidth: 0 }}
                        >
                            Sign in
                        </Button>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Landing;