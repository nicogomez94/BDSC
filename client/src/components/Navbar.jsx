import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faRightToBracket,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../services/api';
import { SITE_SECTION_DEFAULTS, SITE_SECTION_KEYS } from '../config/siteContentDefaults';
import './Navbar.css';

const normalizeSiteMenu = (data, fallback) => (Array.isArray(data) && data.length > 0 ? data : fallback);

const getMenuPagePath = (sectionKey, subdivisionSlug, pageSlug) => {
  if (sectionKey === SITE_SECTION_KEYS.COORDINACION && subdivisionSlug === 'gestion-interna' && pageSlug === 'entrenadores') {
    return '/coordinacion/gestion-interna/coordinadores';
  }
  if (sectionKey === SITE_SECTION_KEYS.COORDINACION && subdivisionSlug === 'gestion-interna' && pageSlug === 'preparadores-fisicos') {
    return '/coordinacion/gestion-interna/preparadores-fisicos';
  }
  if (sectionKey === SITE_SECTION_KEYS.COORDINACION && subdivisionSlug === 'operacion' && pageSlug === 'asistencia') {
    return '/coordinacion/operacion/asistencia';
  }
  return `/contenido/${String(sectionKey).toLowerCase()}/${subdivisionSlug}/${pageSlug}`;
};
const getMenuSubpagePath = (sectionKey, subdivisionSlug, pageSlug, subpageSlug) =>
  `${getMenuPagePath(sectionKey, subdivisionSlug, pageSlug)}/${subpageSlug}`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const panelPath = isAuthenticated && user?.role === 'COORDINADOR' ? '/admin' : '/panel';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openNestedDropdowns, setOpenNestedDropdowns] = useState({});
  const [libraryMenu, setLibraryMenu] = useState([]);
  const [coordinacionMenu, setCoordinacionMenu] = useState([]);
  const [recursosMenu, setRecursosMenu] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadMenus = async () => {
      try {
        const [libraryData, coordinacionData, recursosData] = await Promise.all([
          api.library.getMenu(),
          api.siteContent.getBySection(SITE_SECTION_KEYS.COORDINACION),
          api.siteContent.getBySection(SITE_SECTION_KEYS.RECURSOS),
        ]);

        if (mounted) {
          setLibraryMenu(Array.isArray(libraryData) ? libraryData : []);
          setCoordinacionMenu(
            normalizeSiteMenu(coordinacionData, SITE_SECTION_DEFAULTS[SITE_SECTION_KEYS.COORDINACION])
          );
          setRecursosMenu(
            normalizeSiteMenu(recursosData, SITE_SECTION_DEFAULTS[SITE_SECTION_KEYS.RECURSOS])
          );
        }
      } catch (error) {
        if (mounted) {
          setLibraryMenu([]);
          setCoordinacionMenu(SITE_SECTION_DEFAULTS[SITE_SECTION_KEYS.COORDINACION]);
          setRecursosMenu(SITE_SECTION_DEFAULTS[SITE_SECTION_KEYS.RECURSOS]);
        }
      }
    };

    loadMenus();

    return () => {
      mounted = false;
    };
  }, []);

  const defaultLibraryPath = useMemo(() => {
    for (const section of libraryMenu) {
      if (section.categories?.length > 0) {
        return `/biblioteca-virtual/${section.slug}/${section.categories[0].slug}`;
      }
    }
    return '/';
  }, [libraryMenu]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setOpenDropdown(null);
    setOpenNestedDropdowns({});
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
    setOpenNestedDropdowns({});
  };

  const handleDropdownClick = (e, dropdownName) => {
    if (window.innerWidth <= 982) {
      e.preventDefault();
      setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    }
  };

  const handleSubmenuToggle = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenNestedDropdowns((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const renderSiteDropdown = (sectionKey, sectionName, items) => (
    <li className={`dropdown ${openDropdown === sectionName ? 'active' : ''}`}>
      <Link to={`/${sectionName}`} onClick={(e) => handleDropdownClick(e, sectionName)}>
        {sectionName === 'coordinacion' ? 'Coordinación' : 'Recursos'}
      </Link>
      <ul className="dropdown-menu">
        {items.map((subdivision, subdivisionIndex) => (
          <li key={subdivision.id}>
            <span className="dropdown-group-title">{subdivision.name}</span>
            {(subdivision.pages || []).map((page) => {
              const hasSubpages = Array.isArray(page.subpages) && page.subpages.length > 0;
              const nestedKey = `${sectionName}-${subdivision.id}-${page.id}`;

              return (
                <div
                  key={page.id}
                  className={`dropdown-page-item ${hasSubpages ? 'has-submenu' : ''} ${openNestedDropdowns[nestedKey] ? 'submenu-open' : ''}`}
                >
                  <div className="dropdown-page-main">
                    <Link
                      className="dropdown-page-link"
                      to={getMenuPagePath(sectionKey, subdivision.slug, page.slug)}
                      onClick={closeMenu}
                    >
                      {page.title}
                    </Link>
                    {hasSubpages && (
                      <button
                        type="button"
                        className="dropdown-submenu-toggle"
                        onClick={(e) => handleSubmenuToggle(e, nestedKey)}
                        aria-label={`Mostrar subpáginas de ${page.title}`}
                      >
                        +
                      </button>
                    )}
                  </div>

                  {hasSubpages && (
                    <ul className="dropdown-submenu">
                      {page.subpages.map((subpage) => (
                        <li key={subpage.id}>
                          <Link
                            className="dropdown-submenu-link"
                            to={getMenuSubpagePath(sectionKey, subdivision.slug, page.slug, subpage.slug)}
                            onClick={closeMenu}
                          >
                            {subpage.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            {subdivisionIndex < items.length - 1 && <span className="dropdown-divider dropdown-divider-inline"></span>}
          </li>
        ))}
      </ul>
    </li>
  );

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

            {isAuthenticated && renderSiteDropdown(SITE_SECTION_KEYS.COORDINACION, 'coordinacion', coordinacionMenu)}
            {isAuthenticated && renderSiteDropdown(SITE_SECTION_KEYS.RECURSOS, 'recursos', recursosMenu)}

            {isAuthenticated && (
              <li className={`dropdown ${openDropdown === 'biblioteca-virtual' ? 'active' : ''}`}>
                <Link to={defaultLibraryPath} onClick={(e) => handleDropdownClick(e, 'biblioteca-virtual')}>
                  Biblioteca virtual
                </Link>
                <ul className="dropdown-menu">
                  {libraryMenu.length === 0 && <li><span className="dropdown-empty">Sin contenido aún</span></li>}
                  {libraryMenu.map((section, sectionIndex) => (
                    <li key={section.id}>
                      <span className="dropdown-group-title">{section.name}</span>
                      {section.categories?.map((category) => (
                        <Link
                          key={category.id}
                          to={`/biblioteca-virtual/${section.slug}/${category.slug}`}
                          onClick={closeMenu}
                        >
                          {category.name}
                        </Link>
                      ))}
                      {sectionIndex < libraryMenu.length - 1 && <span className="dropdown-divider dropdown-divider-inline"></span>}
                    </li>
                  ))}
                </ul>
              </li>
            )}
            
            <li><Link to="/contacto" onClick={closeMenu}>Contacto</Link></li>
            {isAuthenticated && <li><Link to={panelPath} onClick={closeMenu}>Panel</Link></li>}
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
