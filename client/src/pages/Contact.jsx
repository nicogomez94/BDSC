import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { DEBUG_MODE, DEBUG_PREFILL } from '../config/debug';
import './Contact.css';

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT;
const CONTACT_RECIPIENTS = ['Deportivo', 'Administración'];

const Contact = () => {
  const [formData, setFormData] = useState(
    DEBUG_MODE
      ? { ...DEBUG_PREFILL.contact }
      : {
          name: '',
          email: '',
          recipient: '',
          message: ''
        }
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    // Scroll reveal
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.scroll-reveal');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!FORMSPREE_ENDPOINT) {
      setSubmitError('Falta configurar VITE_FORMSPREE_ENDPOINT en el frontend.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          recipient: formData.recipient,
          message: formData.message,
          _subject: `Nuevo contacto (${formData.recipient}) de ${formData.name}`,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar el mensaje.');
      }

      setSubmitSuccess('Gracias por tu mensaje. Te contactaremos pronto.');
      setFormData(
        DEBUG_MODE ? { ...DEBUG_PREFILL.contact } : { name: '', email: '', recipient: '', message: '' }
      );
    } catch (error) {
      setSubmitError(error.message || 'Ocurrió un error al enviar.');
    } finally {
      setSubmitting(false);
    }
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
          <div className="contact-info scroll-reveal">
            <h2>Información de Contacto</h2>
            
            <div className="info-item">
              <div className="info-icon"><FontAwesomeIcon icon={faLocationDot} /></div>
              <h3>Dirección</h3>
              <p>Av. Belgrano 1234<br/>Buenos Aires, Argentina</p>
            </div>

            <div className="info-item">
              <div className="info-icon"><FontAwesomeIcon icon={faPhone} /></div>
              <h3>Teléfono</h3>
              <p>(011) 4567-8900</p>
            </div>

            <div className="info-item">
              <div className="info-icon"><FontAwesomeIcon icon={faEnvelope} /></div>
              <h3>Email</h3>
              <p>hockey@bdsc.com</p>
            </div>

            <div className="info-item">
              <div className="info-icon"><FontAwesomeIcon icon={faClock} /></div>
              <h3>Horarios de atención</h3>
              <p>Lunes a Viernes: 9:00 - 18:00<br/>Sábados: 9:00 - 13:00</p>
            </div>
          </div>

          <div className="contact-form scroll-reveal">
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
                <label htmlFor="recipient">Dirigido a</label>
                <select
                  id="recipient"
                  value={formData.recipient}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar destinatario</option>
                  {CONTACT_RECIPIENTS.map((recipient) => (
                    <option key={recipient} value={recipient}>
                      {recipient}
                    </option>
                  ))}
                </select>
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

              <button type="submit" className="btn-submit" disabled={submitting}>
                <FontAwesomeIcon icon={faPaperPlane} />
                {submitting ? 'Enviando...' : 'Enviar mensaje'}
              </button>

              {submitError && <div className="contact-status contact-status-error">{submitError}</div>}
              {submitSuccess && (
                <div className="contact-status contact-status-success">{submitSuccess}</div>
              )}

              <div className="contact-placeholder">
                <h3>Info adicional</h3>
                <p>
                  Respondemos consultas en menos de 24 horas hábiles.
                </p>
                <p>
                  Si tu consulta es urgente, comunicate por teléfono al
                  (011) 4567-8900.
                </p>
                <p>
                  También podés visitarnos de lunes a viernes de 9:00 a 18:00.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
