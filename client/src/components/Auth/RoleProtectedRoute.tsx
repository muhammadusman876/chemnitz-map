import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, Typography, Paper, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[]; // ['admin', 'moderator', etc.]
    fallbackPath?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
    children,
    allowedRoles,
    fallbackPath = '/dashboard'
}) => {
    const { user, isAuthenticated, loading } = useAuth();

    // First check if user is authenticated
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    const hasRequiredRole = user && allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
                p={4}
            >
                <Paper
                    sx={{
                        textAlign: 'center',
                        p: 6,
                        maxWidth: 500,
                        borderRadius: 3,
                    }}
                >
                    <LockIcon
                        sx={{
                            fontSize: 64,
                            color: 'error.main',
                            mb: 2
                        }}
                    />
                    <Typography variant="h5" color="error" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        You don't have permission to access this page.
                        Required role: {allowedRoles.join(' or ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Your current role: {user?.role || 'Unknown'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.history.back()}
                        sx={{ mr: 2 }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="outlined"
                        href={fallbackPath}
                    >
                        Go to Dashboard
                    </Button>
                </Paper>
            </Box>
        );
    }

    return <>{children}</>;
};

export default RoleProtectedRoute;