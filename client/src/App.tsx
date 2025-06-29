import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MapContainer from './components/map/MapContainer';
import Landing from './pages/Landing';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useEffect } from 'react';
import { backgroundLoader } from './services/backgroundLoader';
import { backgroundDataLoader } from './services/ackgroundLoader'; // Fixed typo
import { Toaster } from 'react-hot-toast';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeModeProvider } from './context/ThemeContext'; // Use YOUR ThemeModeProvider


function App() {
  useEffect(() => {
    // Start preloading after app mounts
    backgroundDataLoader.preloadData();
  }, []);

  useEffect(() => {
    // Start preloading district data immediately when app loads
    backgroundLoader.preloadDistrictData();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeModeProvider> {/* Changed from ThemeProvider to ThemeModeProvider */}
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public route - Landing page */}
              <Route index element={<Landing />} />

              {/* Guest-only routes - redirect to dashboard if already logged in */}
              <Route
                path="register"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                }
              />
              <Route
                path="login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes - require authentication */}
              <Route
                path="cultureSite"
                element={
                  <ProtectedRoute>
                    <MapContainer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes (example) */}
            </Route>
          </Routes>

          {/* Add the Toaster component */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Default options for all toasts
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              // Default options for success toasts
              success: {
                duration: 4000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              // Default options for error toasts
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
              // Default options for loading toasts
              loading: {
                iconTheme: {
                  primary: '#3B82F6',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
