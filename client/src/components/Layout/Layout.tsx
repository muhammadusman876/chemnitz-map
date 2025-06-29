import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    ListItemText,
    Chip,
    Stack,
    useTheme,
    CircularProgress
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ExploreIcon from "@mui/icons-material/Explore";
import MapIcon from "@mui/icons-material/Map";
import LogoutIcon from "@mui/icons-material/Logout";
import { useThemeMode } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { backgroundLoader } from '../../services/backgroundLoader';

const Layout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode, toggleTheme } = useThemeMode();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [backgroundLoading, setBackgroundLoading] = useState(false);

    // Check for pages that need special layout treatment
    const isMapPage = location.pathname === "/cultureSite";
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
    const isDashboardPage = location.pathname === "/dashboard";
    const isLandingPage = location.pathname === "/";

    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
        handleClose();
    };

    useEffect(() => {
        const checkBackgroundLoading = () => {
            if (!backgroundLoader.isDataReady()) {
                setBackgroundLoading(true);
                backgroundLoader.preloadDistrictData().then(() => {
                    setBackgroundLoading(false);
                });
            }
        };

        checkBackgroundLoading();
    }, []);

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                }}
            >
                <Toolbar sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
                        <ExploreIcon sx={{ fontSize: 28, color: "#fff" }} />
                        <Box>
                            <Typography
                                variant="h6"
                                component={Link}
                                to="/"
                                sx={{
                                    color: "#fff",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    fontSize: "1.3rem",
                                    background: "linear-gradient(45deg, #fff 30%, #e0e7ff 90%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                        transition: "transform 0.2s ease"
                                    },
                                    display: "block",
                                    lineHeight: 1.2
                                }}
                            >
                                Chemnitz Uncovered
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "rgba(255, 255, 255, 0.8)",
                                    fontFamily: "monospace",
                                    textTransform: "uppercase",
                                    fontSize: "0.7rem",
                                    fontWeight: 500,
                                    display: "block",
                                    lineHeight: 1
                                }}
                            >
                                _C_the_Unseen_
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        {/* Only show Home button if not on landing page */}
                        {!isLandingPage && (
                            <Button
                                color="inherit"
                                component={Link}
                                to="/"
                                startIcon={<ExploreIcon />}
                                sx={{
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1,
                                    textTransform: "none",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        bgcolor: "rgba(255, 255, 255, 0.1)",
                                        transform: "translateY(-1px)",
                                    }
                                }}
                            >
                                Home
                            </Button>
                        )}

                        <Button
                            color="inherit"
                            component={Link}
                            to="/cultureSite"
                            startIcon={<MapIcon />}
                            sx={{
                                fontWeight: location.pathname === "/cultureSite" ? 700 : 600,
                                borderRadius: 3,
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                bgcolor: location.pathname === "/cultureSite" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 0.1)",
                                    transform: "translateY(-1px)",
                                }
                            }}
                        >
                            Explore Map
                        </Button>

                        <IconButton
                            color="inherit"
                            onClick={toggleTheme}
                            sx={{
                                ml: 1,
                                borderRadius: 2,
                                p: 1.2,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 0.1)",
                                    transform: "rotate(180deg)",
                                }
                            }}
                        >
                            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>

                        {/* Profile Menu */}
                        <IconButton
                            onClick={handleProfileClick}
                            sx={{
                                ml: 1,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.1)",
                                }
                            }}
                        >
                            <Avatar
                                src={user?.avatar ? `http://localhost:5000${user.avatar}` : undefined}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: "blur(10px)",
                                    border: "2px solid rgba(255,255,255,0.3)",
                                    fontSize: "1.1rem",
                                    fontWeight: 600
                                }}
                            >
                                {!user?.avatar && user?.username ? user.username.charAt(0).toUpperCase() : <AccountCircleIcon />}
                            </Avatar>
                        </IconButton>
                    </Stack>

                    {/* Enhanced Dark Mode Aware Dropdown Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 24,
                            sx: {
                                mt: 2,
                                minWidth: 280,
                                borderRadius: 3,
                                // Theme-aware background
                                background: theme.palette.mode === 'dark'
                                    ? "linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(33, 33, 33, 0.95) 100%)"
                                    : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                                backdropFilter: "blur(20px)",
                                // Theme-aware border
                                border: theme.palette.mode === 'dark'
                                    ? "1px solid rgba(255,255,255,0.1)"
                                    : "1px solid rgba(255,255,255,0.3)",
                                // Theme-aware box shadow
                                boxShadow: theme.palette.mode === 'dark'
                                    ? "0 20px 40px rgba(0,0,0,0.8)"
                                    : "0 20px 40px rgba(0,0,0,0.15)",
                                '& .MuiMenuItem-root': {
                                    borderRadius: 2,
                                    mx: 1.5,
                                    my: 0.5,
                                    py: 1.5,
                                    px: 2,
                                    transition: "all 0.2s ease",
                                    // Theme-aware hover colors
                                    "&:hover": {
                                        bgcolor: theme.palette.mode === 'dark'
                                            ? "rgba(59, 130, 246, 0.2)"
                                            : "rgba(59, 130, 246, 0.1)",
                                        transform: "translateX(4px)",
                                    }
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {user && (
                            <>
                                <Box sx={{
                                    px: 2,
                                    py: 1.5,
                                    borderBottom: theme.palette.mode === 'dark'
                                        ? "1px solid rgba(255,255,255,0.1)"
                                        : "1px solid rgba(0,0,0,0.1)"
                                }}>
                                    <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                                        Welcome back, {user?.username || 'User'}!
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                    {user?.location && (
                                        <Typography variant="caption" color="text.secondary">
                                            📍 {
                                                typeof user.location === 'string'
                                                    ? user.location
                                                    : user.location?.address ||
                                                    (user.location?.lat && user.location?.lng
                                                        ? `${user.location.lat.toFixed(2)}, ${user.location.lng.toFixed(2)}`
                                                        : 'Chemnitz')
                                            }
                                        </Typography>
                                    )}
                                </Box>

                                <MenuItem
                                    component={Link}
                                    to="/dashboard"
                                    sx={{
                                        bgcolor: location.pathname === "/dashboard"
                                            ? theme.palette.mode === 'dark'
                                                ? "rgba(59, 130, 246, 0.2)"
                                                : "rgba(59, 130, 246, 0.1)"
                                            : "transparent"
                                    }}
                                >
                                    <ListItemIcon>
                                        <DashboardIcon fontSize="small" color="primary" />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1" fontWeight={600}>
                                            Dashboard
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            View your progress
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>

                                <Divider sx={{
                                    my: 1,
                                    mx: 1.5,
                                    borderColor: theme.palette.mode === 'dark'
                                        ? "rgba(255,255,255,0.1)"
                                        : "rgba(0,0,0,0.1)"
                                }} />

                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1" fontWeight={600} color="error.main">
                                            Sign Out
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                            </>
                        )}

                        {!user && (
                            <>
                                <Box sx={{
                                    px: 2,
                                    py: 1.5,
                                    borderBottom: theme.palette.mode === 'dark'
                                        ? "1px solid rgba(255,255,255,0.1)"
                                        : "1px solid rgba(0,0,0,0.1)"
                                }}>
                                    <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                                        Join the Adventure!
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Start exploring Chemnitz
                                    </Typography>
                                </Box>

                                <MenuItem component={Link} to="/login">
                                    <ListItemIcon>
                                        <LoginIcon fontSize="small" color="primary" />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1" fontWeight={600}>
                                            Sign In
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Access your account
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>

                                <MenuItem component={Link} to="/register">
                                    <ListItemIcon>
                                        <PersonAddIcon fontSize="small" color="success" />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1" fontWeight={600}>
                                            Sign Up
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Create new account
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                            </>
                        )}
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box sx={{
                minHeight: "calc(100vh - 64px)",
                background: (isAuthPage || isDashboardPage || isLandingPage) ? "transparent" : theme.palette.background.default,
                py: (isMapPage || isAuthPage || isDashboardPage || isLandingPage) ? 0 : 4
            }}>
                {(isMapPage || isAuthPage || isDashboardPage || isLandingPage) ? (
                    <Outlet />
                ) : (
                    <Container maxWidth="lg">
                        <Outlet />
                    </Container>
                )}
            </Box>

            {/* Background Data Loading Indicator */}
            {backgroundLoading && (
                <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
                    <Chip
                        icon={<CircularProgress size={16} />}
                        label="Loading map data..."
                        variant="outlined"
                        size="small"
                    />
                </Box>
            )}
        </>
    );
};

export default Layout;
