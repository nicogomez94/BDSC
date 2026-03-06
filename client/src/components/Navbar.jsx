import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const panelPath = isAuthenticated && user?.role === 'COORDINADOR' ? '/admin' : '/panel';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo_sm.png" alt="Logo pequeño" className="navbar-logo-img" style={{ verticalAlign: 'middle', marginRight: '8px',marginTop: '-8px', height: '50px' }} />
          BDSC Hockey
        </Link>
        
        <ul className="navbar-menu">
          <li><Link to="/">Inicio</Link></li>
          
          <li className="dropdown">
            <Link to="/coordinacion">Coordinación</Link>
            <ul className="dropdown-menu">
              <li className="dropdown-group-title">Operación</li>
              <li><Link to="/coordinacion#operacion">Planteles</Link></li>
              <li><Link to="/coordinacion#operacion">Asistencia</Link></li>
              <li><Link to="/coordinacion#operacion">Reunión de padres</Link></li>
              <li><Link to="/coordinacion#operacion">Distribución de espacios</Link></li>
              
              <li className="dropdown-divider"></li>
              <li className="dropdown-group-title">Competencia</li>
              <li><Link to="/coordinacion#competencia">Categoría E1</Link></li>
              <li><Link to="/coordinacion#competencia">Categoría 4ta B</Link></li>
              <li><Link to="/coordinacion#competencia">Fixture</Link></li>
              <li><Link to="/coordinacion#competencia">Videos de partidos</Link></li>
              <li><Link to="/coordinacion#competencia">Videos de rivales</Link></li>
              
              <li className="dropdown-divider"></li>
              <li className="dropdown-group-title">Temporada 2026</li>
              <li><Link to="/coordinacion#temporada-2026">Plan de pretemporada</Link></li>
              <li><Link to="/coordinacion#temporada-2026">Inicio de actividades</Link></li>
              <li><Link to="/coordinacion#temporada-2026">Pretemporada de febrero</Link></li>
              
              <li className="dropdown-divider"></li>
              <li className="dropdown-group-title">Gestión interna</li>
              <li><Link to="/coordinacion#gestion-interna">Entrenadores</Link></li>
              <li><Link to="/coordinacion#gestion-interna">Árbitros</Link></li>
              <li><Link to="/coordinacion#gestion-interna">Fotos</Link></li>
              <li><Link to="/coordinacion#gestion-interna">Capacitaciones</Link></li>
            </ul>
          </li>
          
          <li className="dropdown">
            <Link to="/recursos">Recursos</Link>
            <ul className="dropdown-menu">
              <li className="dropdown-group-title">Planificación deportiva</li>
              <li><Link to="/recursos#planificacion-deportiva">Modelo de juego</Link></li>
              <li><Link to="/recursos#planificacion-deportiva">Fases de la planificación</Link></li>
              <li><Link to="/recursos#planificacion-deportiva">Plan de acción - Diagnóstico</Link></li>
              <li><Link to="/recursos#planificacion-deportiva">Plan de acción - Objetivos</Link></li>
              
              <li className="dropdown-divider"></li>
              <li className="dropdown-group-title">Entrenamientos</li>
              <li><Link to="/recursos#entrenamientos">Simbología</Link></li>
              <li><Link to="/recursos#entrenamientos">Planilla de entrenamiento</Link></li>
              <li><Link to="/recursos#entrenamientos">Planilla de partido</Link></li>
              <li><Link to="/recursos#entrenamientos">Guía de gestos técnicos</Link></li>
            </ul>
          </li>
          
          <li><Link to="/contacto">Contacto</Link></li>
          <li><Link to={panelPath}>Panel</Link></li>
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <button onClick={logout} className="btn-logout">
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="btn-login">Acceso entrenadores</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
