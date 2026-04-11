import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faEnvelope,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { DEBUG_MODE, DEBUG_PREFILL } from '../config/debug';
import './Contact.css';

const CONTACT_SERVICE_ENDPOINT = 'https://contact-form-service-e8aa.onrender.com/api/contact';
const CONTACT_SITE_ID = 'coordinacionhockey.com.ar';
const CONTACT_TO_EMAIL = 'nicolasgomez94@gmail.com';
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

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      setSubmitError('Completá nombre, email y mensaje para continuar.');
      return;
    }

    if (!emailRegex.test(email)) {
      setSubmitError('Ingresá un email válido.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(CONTACT_SERVICE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          to: CONTACT_TO_EMAIL,
          message,
          site: CONTACT_SITE_ID,
          company: '',
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || data?.success !== true) {
        throw new Error('No pudimos enviar tu mensaje en este momento. Intentá nuevamente.');
      }

      setSubmitSuccess('Gracias por tu mensaje. Te contactaremos pronto.');
      setFormData(
        DEBUG_MODE ? { ...DEBUG_PREFILL.contact } : { name: '', email: '', recipient: '', message: '' }
      );
    } catch (error) {
      setSubmitError(error.message || 'Error de red. Verificá tu conexión e intentá nuevamente.');
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
              <p>Marcos Sastre 1855</p>
            </div>

            <div className="info-item">
              <div className="info-icon"><FontAwesomeIcon icon={faLocationDot} /></div>
              <h3>Ubicación</h3>
              <p>
                <a href="https://maps.google.com/?q=-34.468155,-58.672512" target="_blank" rel="noopener noreferrer">
                  https://maps.google.com/?q=-34.468155,-58.672512
                </a>
              </p>
            </div>

            <div className="info-item">
              <div className="info-icon"><FontAwesomeIcon icon={faEnvelope} /></div>
              <h3>Correo</h3>
              <p>lucasalesheadcoach@gmail.com</p>
              <p>Bdschockeycd@gmail.com (Administración)</p>
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
                  También podés escribir a lucasalesheadcoach@gmail.com.
                </p>
                <p>
                  Para temas administrativos: Bdschockeycd@gmail.com.
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
