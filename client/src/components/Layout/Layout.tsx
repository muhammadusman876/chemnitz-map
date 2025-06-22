import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";

const Layout: React.FC = () => {
    const location = useLocation();

    // Only use Container for non-map pages
    const isMapPage = location.pathname === "/cultureSite";

    return (
        <>
            <AppBar position="static" color="primary" elevation={2}>
                <Toolbar>
                    <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: "#fff", textDecoration: "none" }}>
                        Cultural Explorer
                    </Typography>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/"
                        sx={{ fontWeight: location.pathname === "/" ? 700 : 400 }}
                    >
                        Home
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/cultureSite"
                        sx={{ fontWeight: location.pathname === "/cultureSite" ? 700 : 400 }}
                    >
                        Map
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/login"
                        sx={{ fontWeight: location.pathname === "/login" ? 700 : 400 }}
                    >
                        Login
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/register"
                        sx={{ fontWeight: location.pathname === "/register" ? 700 : 400 }}
                    >
                        Register
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ minHeight: "calc(100vh - 64px)", background: "#f5f6fa", py: isMapPage ? 0 : 4 }}>
                {isMapPage ? (
                    <Outlet />
                ) : (
                    <Container maxWidth="lg">
                        <Outlet />
                    </Container>
                )}
            </Box>
        </>
    );
};

export default Layout;
