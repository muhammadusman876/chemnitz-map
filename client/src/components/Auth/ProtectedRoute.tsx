import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean; // true = requires authentication, false = requires no auth (like login/register)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true
}) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while authentication is being verified
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                minHeight="60vh"
                gap={2}
            >
                <CircularProgress size={48} thickness={4} />
                <Typography variant="h6" color="text.secondary">
                    Verifying authentication...
                </Typography>
            </Box>
        );
    }

    // Protect authenticated routes
    if (requireAuth && !isAuthenticated) {
        // Redirect to login with the current location so user can be redirected back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Protect guest-only routes (login/register pages)
    if (!requireAuth && isAuthenticated) {
        // If user is already logged in, redirect to dashboard or intended page
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    // Render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;