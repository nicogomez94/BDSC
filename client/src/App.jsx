import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Trainers from './pages/Trainers';
import PhysicalTrainers from './pages/PhysicalTrainers';
import Coordinacion from './pages/Coordinacion';
import Recursos from './pages/Recursos';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import TrainerPanel from './pages/TrainerPanel';
import VirtualLibraryCategory from './pages/VirtualLibraryCategory';
import SiteContentPage from './pages/SiteContentPage';
import AttendanceSystemPage from './pages/AttendanceSystemPage';
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
              <Route
                path="/coordinacion"
                element={
                  <ProtectedRoute>
                    <Coordinacion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coordinacion/operacion/asistencia"
                element={
                  <ProtectedRoute>
                    <AttendanceSystemPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coordinacion/gestion-interna/coordinadores"
                element={
                  <ProtectedRoute>
                    <Trainers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coordinacion/gestion-interna/preparadores-fisicos"
                element={
                  <ProtectedRoute>
                    <PhysicalTrainers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recursos"
                element={
                  <ProtectedRoute>
                    <Recursos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contenido/coordinacion/operacion/asistencia"
                element={<Navigate to="/coordinacion/operacion/asistencia" replace />}
              />
              <Route
                path="/contenido/:sectionKeySlug/:subdivisionSlug/:pageSlug/:subpageSlug"
                element={
                  <ProtectedRoute>
                    <SiteContentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contenido/:sectionKeySlug/:subdivisionSlug/:pageSlug"
                element={
                  <ProtectedRoute>
                    <SiteContentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/biblioteca-virtual/:sectionSlug/:categorySlug"
                element={
                  <ProtectedRoute>
                    <VirtualLibraryCategory />
                  </ProtectedRoute>
                }
              />
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
              <Route
                path="/preparadores-fisicos"
                element={<Navigate to="/coordinacion/gestion-interna/preparadores-fisicos" replace />}
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
