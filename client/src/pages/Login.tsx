import React from "react";
import LoginForm from "../components/Auth/LoginForm";
import {
    Box,
    Container,
    Paper,
    Typography,
    Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    width: "150%",
                    height: "150%",
                    background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
                    top: "-25%",
                    left: "-25%",
                }
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        p: { xs: 3, sm: 5 },
                        background: "rgba(255, 255, 255, 0.25)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: "-50%",
                            left: "-50%",
                            width: "200%",
                            height: "200%",
                            background: "linear-gradient(45deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 100%)",
                            transform: "rotate(30deg)",
                            pointerEvents: "none",
                            zIndex: 0,
                        }
                    }}
                >
                    <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Typography
                            variant="h4"
                            align="center"
                            fontWeight={700}
                            gutterBottom
                            sx={{
                                letterSpacing: 1,
                                color: "white",
                                textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                mb: 1,
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            align="center"
                            sx={{ mb: 3, color: "rgba(255,255,255,0.8)" }}
                        >
                            Please log in to your account to continue
                        </Typography>
                        <LoginForm />
                        <Typography variant="body2" align="center" sx={{ mt: 3, color: "rgba(255,255,255,0.85)" }}>
                            Don't have an account?{" "}
                            <MuiLink
                                component={Link}
                                to="/register"
                                sx={{
                                    color: "rgba(255,255,255,0.95)",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    "&:hover": {
                                        textDecoration: "underline",
                                        textShadow: "0 0 8px rgba(255,255,255,0.5)"
                                    }
                                }}
                            >
                                Register
                            </MuiLink>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;