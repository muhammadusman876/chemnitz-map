import React from "react";
import LoginForm from "../components/Auth/LoginForm";
import {
    Box,
    Container,
    Paper,
    Typography,
    Link as MuiLink,
    useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

const Login: React.FC = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 64px)",
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgb(37, 47, 63) 0%, rgba(37, 47, 63, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgb(255, 227, 187) 0%, rgb(255, 166, 115) 100%)',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        p: { xs: 4, sm: 6 },
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                            : '0 8px 32px rgba(0, 0, 0, 0.1)',
                        position: "relative",
                        maxWidth: 480,
                        mx: 'auto',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Logo/Icon */}
                        <Avatar
                            sx={{
                                m: 1,
                                bgcolor: 'primary.main',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <LockOutlinedIcon sx={{ fontSize: 28 }} />
                        </Avatar>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            align="center"
                            fontWeight={600}
                            gutterBottom
                            sx={{
                                color: theme.palette.text.primary,
                                mb: 1,
                                letterSpacing: '-0.025em',
                            }}
                        >
                            Welcome Back
                        </Typography>

                        {/* Subtitle */}
                        <Typography
                            variant="body1"
                            align="center"
                            color="text.secondary"
                            sx={{ mb: 4, maxWidth: 320 }}
                        >
                            Sign in to your account to continue exploring cultural sites
                        </Typography>

                        {/* Form */}
                        <Box sx={{ width: '100%' }}>
                            <LoginForm />
                        </Box>

                        {/* Register Link */}
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{" "}
                                <MuiLink
                                    component={Link}
                                    to="/register"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        textDecoration: "none",
                                        "&:hover": {
                                            textDecoration: "underline",
                                        }
                                    }}
                                >
                                    Create Account
                                </MuiLink>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;