import { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se implementaría el envío del formulario
    console.log('Formulario enviado:', formData);
    alert('Gracias por tu mensaje. Te contactaremos pronto.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contacto</h1>
        <p className="contact-subtitle">
          Estamos aquí para responder tus consultas
        </p>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Información de Contacto</h2>
            
            <div className="info-item">
              <div className="info-icon">📍</div>
              <h3>Dirección</h3>
              <p>Av. Belgrano 1234<br/>Buenos Aires, Argentina</p>
            </div>

            <div className="info-item">
              <div className="info-icon">📞</div>
              <h3>Teléfono</h3>
              <p>(011) 4567-8900</p>
            </div>

            <div className="info-item">
              <div className="info-icon">✉️</div>
              <h3>Email</h3>
              <p>hockey@bdsc.com</p>
            </div>

            <div className="info-item">
              <div className="info-icon">🕐</div>
              <h3>Horarios de atención</h3>
              <p>Lunes a Viernes: 9:00 - 18:00<br/>Sábados: 9:00 - 13:00</p>
            </div>
          </div>

          <div className="contact-form">
            <h2>Envianos un mensaje</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Mensaje</label>
                <textarea 
                  id="message" 
                  rows="6" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Escribí tu consulta aquí..."
                ></textarea>
              </div>

              <button type="submit" className="btn-submit">
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
