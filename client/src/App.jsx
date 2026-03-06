import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Trainers from './pages/Trainers';
import Coordinacion from './pages/Coordinacion';
import Recursos from './pages/Recursos';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import TrainerPanel from './pages/TrainerPanel';
import './styles/global.css';

const Panel = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return user.role === 'COORDINADOR' ? <AdminPanel /> : <TrainerPanel />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/coordinacion" element={<Coordinacion />} />
              <Route path="/coordinacion/gestion-interna/coordinadores" element={<Trainers />} />
              <Route path="/recursos" element={<Recursos />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/panel"
                element={
                  <ProtectedRoute>
                    <Panel />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="COORDINADOR">
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              <Route path="/hockey" element={<Navigate to="/coordinacion" replace />} />
              <Route
                path="/entrenadores"
                element={<Navigate to="/coordinacion/gestion-interna/coordinadores" replace />}
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
