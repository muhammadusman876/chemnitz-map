import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Import your pages
// import Home from '../pages/Home';
// import Login from '../pages/Login';
import Register from '../pages/Register';
// import Profile from '../pages/Profile';
// import Dashboard from '../pages/Dashboard';
// import NotFound from '../pages/NotFound';

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner/component
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Guest-only route (redirect to dashboard if already logged in)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner/component
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public routes */}
            {/* <Route path="/" element={<Home />} /> */}

            {/* Guest-only routes */}
            {/* <Route
                path="/login"
                element={
                    <GuestRoute>
                        <Login />
                    </GuestRoute>
                }
            /> */}
            <Route
                path="/register"
                element={
                    <GuestRoute>
                        <Register />
                    </GuestRoute>
                }
            />

            {/* Protected routes */}
            {/* <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            /> */}
            {/* <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            /> */}

            {/* 404 - Not Found */}
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
};

export default AppRoutes;