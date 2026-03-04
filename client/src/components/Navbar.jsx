import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo_sm.png" alt="Logo pequeño" className="navbar-logo-img" style={{ verticalAlign: 'middle', marginRight: '8px',marginTop: '-8px', height: '50px' }} />
          BDSC Hockey
        </Link>
        
        <ul className="navbar-menu">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/hockey">Hockey BDSC</Link></li>
          <li><Link to="/entrenadores">Entrenadores</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
          
          {isAuthenticated ? (
            <>
              <li>
                <Link to={user.role === 'COORDINADOR' ? '/admin' : '/panel'}>
                  Panel
                </Link>
              </li>
              <li>
                <button onClick={logout} className="btn-logout">
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login" className="btn-login">Acceso entrenadores</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
