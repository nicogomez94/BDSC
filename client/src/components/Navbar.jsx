import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
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
