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
          <li><Link to="/coordinacion">Coordinación</Link></li>
          <li><Link to="/recursos">Recursos</Link></li>
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
