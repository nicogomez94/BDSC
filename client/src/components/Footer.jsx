import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>BDSC Hockey</h3>
          <p>Belgrano Day School Club</p>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: hockey@bdsc.com</p>
          <p>Tel: (011) 4567-8900</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces</h4>
          <p><a href="/">Inicio</a></p>
          <p><a href="/hockey">Hockey BDSC</a></p>
          <p><a href="/entrenadores">Entrenadores</a></p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 BDSC Hockey. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
