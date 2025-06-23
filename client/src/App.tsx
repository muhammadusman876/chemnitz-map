import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MapContainer from './components/map/MapContainer';
import Landing from './pages/Landing';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="cultureSite" element={<MapContainer />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* Add more nested routes here if needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
