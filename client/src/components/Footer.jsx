import { Link } from 'react-router-dom';
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
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/hockey">Hockey BDSC</Link></li>
            <li><a href="#" onClick={e => {e.preventDefault(); alert('Sitio en construcción');}}>Entrenadores</a></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <ul className="footer-contact">
            <li>📧 hockey@bdsc.com</li>
            <li>📞 (011) 4567-8900</li>
            <li>📍 Av. Belgrano 1234, Buenos Aires</li>
            <li>🕐 Lun-Vie: 9:00-18:00</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 BDSC Hockey. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
