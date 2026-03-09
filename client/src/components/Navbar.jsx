import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faRightToBracket,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const panelPath = isAuthenticated && user?.role === 'COORDINADOR' ? '/admin' : '/panel';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setOpenDropdown(null); // Reset dropdowns when closing menu
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleDropdownClick = (e, dropdownName) => {
    // En mobile, prevenir navegación y toggle el dropdown
    if (window.innerWidth <= 982) {
      e.preventDefault();
      setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    }
  };

  return (
    <nav className="navbar">
      {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo_sm.png" alt="Logo pequeño" className="navbar-logo-img" style={{ verticalAlign: 'middle', marginRight: '8px',marginTop: '-8px', height: '50px' }} />
          BDSC Hockey
        </Link>

        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <FontAwesomeIcon icon={faBars} />
        </button>
        
        <div className={`navbar-menu-wrapper ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-menu-header">
            <Link to="/" className="navbar-logo-mobile" onClick={closeMenu}>
              <img src="/logo_sm.png" alt="Logo pequeño" style={{ height: '40px', marginRight: '10px' }} />
              BDSC Hockey
            </Link>
            <button className="navbar-close" onClick={closeMenu} aria-label="Close menu">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <ul className="navbar-menu">
            <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
            
            <li className={`dropdown ${openDropdown === 'coordinacion' ? 'active' : ''}`}>
              <Link to="/coordinacion" onClick={(e) => handleDropdownClick(e, 'coordinacion')}>Coordinación</Link>
              <ul className="dropdown-menu">
                <li className="dropdown-group-title">Operación</li>
                <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Planteles</Link></li>
                <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Asistencia</Link></li>
                <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Reunión de padres</Link></li>
                <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Distribución de espacios</Link></li>
                
                <li className="dropdown-divider"></li>
                <li className="dropdown-group-title">Competencia</li>
                <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Categoría E1</Link></li>
                <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Categoría 4ta B</Link></li>
                <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Fixture</Link></li>
                <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Videos de partidos</Link></li>
                <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Videos de rivales</Link></li>
                
                <li className="dropdown-divider"></li>
                <li className="dropdown-group-title">Temporada 2026</li>
                <li><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>Plan de pretemporada</Link></li>
                <li><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>Inicio de actividades</Link></li>
                <li><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>Pretemporada de febrero</Link></li>
                
                <li className="dropdown-divider"></li>
                <li className="dropdown-group-title">Gestión interna</li>
                <li><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>Entrenadores</Link></li>
                <li><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>Árbitros</Link></li>
                <li><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>Fotos</Link></li>
                <li><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>Capacitaciones</Link></li>
              </ul>
            </li>
            
            <li className={`dropdown ${openDropdown === 'recursos' ? 'active' : ''}`}>
              <Link to="/recursos" onClick={(e) => handleDropdownClick(e, 'recursos')}>Recursos</Link>
              <ul className="dropdown-menu">
                <li className="dropdown-group-title">Planificación deportiva</li>
                <li><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Modelo de juego</Link></li>
                <li><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Fases de la planificación</Link></li>
                <li><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Plan de acción - Diagnóstico</Link></li>
                <li><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Plan de acción - Objetivos</Link></li>
                
                <li className="dropdown-divider"></li>
                <li className="dropdown-group-title">Entrenamientos</li>
                <li><Link to="/recursos#entrenamientos" onClick={closeMenu}>Simbología</Link></li>
                <li><Link to="/recursos#entrenamientos" onClick={closeMenu}>Planilla de entrenamiento</Link></li>
                <li><Link to="/recursos#entrenamientos" onClick={closeMenu}>Planilla de partido</Link></li>
                <li><Link to="/recursos#entrenamientos" onClick={closeMenu}>Guía de gestos técnicos</Link></li>
              </ul>
            </li>
            
            <li><Link to="/contacto" onClick={closeMenu}>Contacto</Link></li>
            <li><Link to={panelPath} onClick={closeMenu}>Panel</Link></li>
          </ul>

          <div className="navbar-actions-mobile">
            {isAuthenticated ? (
              <button onClick={() => { logout(); closeMenu(); }} className="btn-logout">
                <FontAwesomeIcon icon={faSignOutAlt} />
                &nbsp;Cerrar sesión
              </button>
            ) : (
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                <FontAwesomeIcon icon={faRightToBracket} />
                &nbsp;Acceso cuerpo técnico
              </Link>
            )}
          </div>
        </div>

        <div className="navbar-actions-desktop">
          {isAuthenticated ? (
            <button onClick={logout} className="btn-logout">
              <FontAwesomeIcon icon={faSignOutAlt} />
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="btn-login"><FontAwesomeIcon icon={faRightToBracket} />Acceso cuerpo técnico</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
