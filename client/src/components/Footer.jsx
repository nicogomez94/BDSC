import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLocationDot,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section footer-brand">
          <h3>BDSC Hockey</h3>
          <p className="footer-tagline">Belgrano Day School Club</p>
          <p className="footer-description">
            Tradición, excelencia y formación integral en hockey desde 2000
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Navegación</h4>
          <ul className="footer-links">
            <li><Link to="/"><FontAwesomeIcon icon={faChevronRight} />Inicio</Link></li>
            <li><Link to="/coordinacion"><FontAwesomeIcon icon={faChevronRight} />Coordinación</Link></li>
            <li><Link to="/recursos"><FontAwesomeIcon icon={faChevronRight} />Recursos</Link></li>
            <li><Link to="/contacto"><FontAwesomeIcon icon={faChevronRight} />Contacto</Link></li>
            <li><Link to="/panel"><FontAwesomeIcon icon={faChevronRight} />Panel</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <ul className="footer-contact">
            <li><FontAwesomeIcon icon={faEnvelope} />lucasalesheadcoach@gmail.com</li>
            <li><FontAwesomeIcon icon={faEnvelope} />Bdschockeycd@gmail.com (Administración)</li>
            <li><FontAwesomeIcon icon={faLocationDot} />Marcos Sastre 1855</li>
            <li>
              <FontAwesomeIcon icon={faLocationDot} />
              <a
                href="https://maps.google.com/?q=-34.468155,-58.672512"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://maps.google.com/?q=-34.468155,-58.672512
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 BDSC Hockey. Todos los derechos reservados.</p>
        <p>
          hecho por{' '}
          <a
            href="https://zigodev.com.ar"
            target="_blank"
            rel="noopener noreferrer"
          >
            zigodev.com.ar
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
