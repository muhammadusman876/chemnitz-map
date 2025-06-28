import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MapContainer from './components/map/MapContainer';
import Landing from './pages/Landing';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute';
import { useEffect } from 'react';
import { backgroundLoader } from './services/backgroundLoader';
import { backgroundDataLoader } from './services/ackgroundLoader';


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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
