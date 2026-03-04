import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="container">
        <h1>Contacto</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>Información</h2>
            
            <div className="info-item">
              <h3>Dirección</h3>
              <p>Av. Belgrano 1234, Buenos Aires</p>
            </div>

            <div className="info-item">
              <h3>Teléfono</h3>
              <p>(011) 4567-8900</p>
            </div>

            <div className="info-item">
              <h3>Email</h3>
              <p>hockey@bdsc.com</p>
            </div>

            <div className="info-item">
              <h3>Horarios de atención</h3>
              <p>Lunes a Viernes: 9:00 - 18:00</p>
              <p>Sábados: 9:00 - 13:00</p>
            </div>
          </div>

          <div className="contact-form">
            <h2>Envianos un mensaje</h2>
            <form>
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input type="text" id="name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" required />
              </div>

              <div className="form-group">
                <label htmlFor="message">Mensaje</label>
                <textarea id="message" rows="5" required></textarea>
              </div>

              <button type="submit" className="btn-primary">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
