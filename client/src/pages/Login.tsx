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
                background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={6}
                    sx={{
                        borderRadius: 4,
                        p: { xs: 3, sm: 5 },
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <Typography
                        variant="h4"
                        align="center"
                        fontWeight={800}
                        gutterBottom
                        sx={{
                            letterSpacing: 1,
                            color: "primary.main",
                            mb: 1,
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        align="center"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Please log in to your account to continue
                    </Typography>
                    <LoginForm />
                    <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                        Don't have an account?{" "}
                        <MuiLink
                            component={Link}
                            to="/register"
                            sx={{ color: "#1976d2", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                            Register
                        </MuiLink>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;