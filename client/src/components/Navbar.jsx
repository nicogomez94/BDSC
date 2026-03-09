import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faRightToBracket,
  faBars,
  faTimes,
  faChevronRight,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const panelPath = isAuthenticated && user?.role === 'COORDINADOR' ? '/admin' : '/panel';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSections, setOpenSections] = useState({
    general: false,
    ps: false,
    pretemporada: false,
    ahba: false,
    herramientas: false,
    material: false,
    materialPlanificacion: false,
    materialGuia: false,
    archivos: false,
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setOpenDropdown(null); // Reset dropdowns when closing menu
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleSection = (key) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
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
            
            <li className={`dropdown ${openDropdown === 'bdsc' ? 'active' : ''}`}>
              <Link to="/coordinacion" onClick={(e) => handleDropdownClick(e, 'bdsc')}>BDSC</Link>
              <ul className="dropdown-menu">
                <li className="dropdown-accordion">
                  <button type="button" className="dropdown-section-toggle" onClick={() => toggleSection('general')}>
                    <FontAwesomeIcon icon={openSections.general ? faChevronDown : faChevronRight} />
                    BDSC General 2026
                  </button>
                  {openSections.general && (
                    <ul className="dropdown-submenu">
                      <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Staff Hockey</Link></li>
                      <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Planteles</Link></li>
                      <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Distribución de los espacios</Link></li>
                      <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Asistencia</Link></li>
                      <li><Link to="/coordinacion#operacion" onClick={closeMenu}>Reunión de padres</Link></li>
                    </ul>
                  )}
                </li>

                <li className="dropdown-accordion">
                  <button type="button" className="dropdown-section-toggle" onClick={() => toggleSection('ps')}>
                    <FontAwesomeIcon icon={openSections.ps ? faChevronDown : faChevronRight} />
                    BDSC PS 2026
                  </button>
                  {openSections.ps && (
                    <ul className="dropdown-submenu">
                      <li><Link to="/coordinacion#operacion" onClick={closeMenu}>PS - Código de convivencia</Link></li>
                      <li><Link to="/coordinacion#operacion" onClick={closeMenu}>PS - Tercer estímulo</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#operacion" onClick={closeMenu}>actividades</Link></li>
                    </ul>
                  )}
                </li>

                <li className="dropdown-accordion">
                  <button type="button" className="dropdown-section-toggle" onClick={() => toggleSection('pretemporada')}>
                    <FontAwesomeIcon icon={openSections.pretemporada ? faChevronDown : faChevronRight} />
                    Pretemporada 2026
                  </button>
                  {openSections.pretemporada && (
                    <ul className="dropdown-submenu">
                      <li><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>Plan de pretemporada</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>novena</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>octava</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>etc (hasta cuarta)</Link></li>
                      <li><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>Inicio de actividades</Link></li>
                      <li><Link to="/coordinacion#temporada-2026" onClick={closeMenu}>Pretemporada de febrero</Link></li>
                    </ul>
                  )}
                </li>

                <li className="dropdown-accordion">
                  <button type="button" className="dropdown-section-toggle" onClick={() => toggleSection('ahba')}>
                    <FontAwesomeIcon icon={openSections.ahba ? faChevronDown : faChevronRight} />
                    AHBA 2026
                  </button>
                  {openSections.ahba && (
                    <ul className="dropdown-submenu">
                      <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Categoría E1</Link></li>
                      <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Categoría 4ta B</Link></li>
                      <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Fixture</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#competencia" onClick={closeMenu}>e1</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#competencia" onClick={closeMenu}>4ta B</Link></li>
                      <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Videos de partidos amistosos</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#competencia" onClick={closeMenu}>novena</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#competencia" onClick={closeMenu}>octava</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#competencia" onClick={closeMenu}>etc (hasta cuarta)</Link></li>
                      <li><Link to="/coordinacion#competencia" onClick={closeMenu}>Videos de rivales</Link></li>
                    </ul>
                  )}
                </li>

                <li className="dropdown-accordion">
                  <button type="button" className="dropdown-section-toggle" onClick={() => toggleSection('herramientas')}>
                    <FontAwesomeIcon icon={openSections.herramientas ? faChevronDown : faChevronRight} />
                    Herramientas para entrenadores
                  </button>
                  {openSections.herramientas && (
                    <ul className="dropdown-submenu">
                      <li><Link to="/recursos#entrenamientos" onClick={closeMenu}>Simbología</Link></li>
                      <li><Link to="/recursos#entrenamientos" onClick={closeMenu}>Planilla de entrenamiento</Link></li>
                      <li><Link to="/recursos#entrenamientos" onClick={closeMenu}>Planilla de partido</Link></li>
                    </ul>
                  )}
                </li>

                <li className="dropdown-accordion">
                  <button type="button" className="dropdown-section-toggle" onClick={() => toggleSection('material')}>
                    <FontAwesomeIcon icon={openSections.material ? faChevronDown : faChevronRight} />
                    Material para entrenadores
                  </button>
                  {openSections.material && (
                    <ul className="dropdown-submenu">
                      <li><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Modelo de Juego</Link></li>
                      <li>
                        <button type="button" className="dropdown-section-toggle nested" onClick={() => toggleSection('materialPlanificacion')}>
                          <FontAwesomeIcon icon={openSections.materialPlanificacion ? faChevronDown : faChevronRight} />
                          Planificación
                        </button>
                      </li>
                      {openSections.materialPlanificacion && (
                        <>
                          <li className="dropdown-subitem"><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Fases de la planificación</Link></li>
                          <li className="dropdown-subitem"><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Plan de acción - Diagnóstico</Link></li>
                          <li className="dropdown-subitem"><Link to="/recursos#planificacion-deportiva" onClick={closeMenu}>Plan de acción - Objetivos</Link></li>
                        </>
                      )}
                      <li>
                        <button type="button" className="dropdown-section-toggle nested" onClick={() => toggleSection('materialGuia')}>
                          <FontAwesomeIcon icon={openSections.materialGuia ? faChevronDown : faChevronRight} />
                          Guía de gestos técnicos
                        </button>
                      </li>
                      {openSections.materialGuia && (
                        <>
                          <li className="dropdown-subitem dropdown-subsubitem"><Link to="/recursos#entrenamientos" onClick={closeMenu}>Empuñaduras</Link></li>
                          <li className="dropdown-subitem dropdown-subsubitem"><Link to="/recursos#entrenamientos" onClick={closeMenu}>Conducciones</Link></li>
                          <li className="dropdown-subitem dropdown-subsubitem"><Link to="/recursos#entrenamientos" onClick={closeMenu}>Cómo conducir para tomar buenas decisiones</Link></li>
                          <li className="dropdown-subitem dropdown-subsubitem"><Link to="/recursos#entrenamientos" onClick={closeMenu}>Posturas</Link></li>
                        </>
                      )}
                    </ul>
                  )}
                </li>

                <li className="dropdown-accordion">
                  <button type="button" className="dropdown-section-toggle" onClick={() => toggleSection('archivos')}>
                    <FontAwesomeIcon icon={openSections.archivos ? faChevronDown : faChevronRight} />
                    Archivos de coordinación
                  </button>
                  {openSections.archivos && (
                    <ul className="dropdown-submenu">
                      <li><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>Árbitros</Link></li>
                      <li><Link to="/coordinacion/gestion-interna/coordinadores" onClick={closeMenu}>Coordinadores</Link></li>
                      <li><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>Fotos</Link></li>
                      <li className="dropdown-subitem"><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>2026</Link></li>
                      <li><Link to="/coordinacion#gestion-interna" onClick={closeMenu}>Capacitaciones</Link></li>
                    </ul>
                  )}
                </li>
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
