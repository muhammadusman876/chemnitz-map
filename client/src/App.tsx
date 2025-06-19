import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'
import MapContainer from './components/map/MapContainer'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <h1>My Map Application</h1>
        <MapContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
