import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faUsers,
  faPersonRunning,
  faChildReaching,
  faUserGroup,
  faTrophy,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  useEffect(() => {
    // Intersection Observer para animaciones al hacer scroll
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

    // Observar todas las secciones
    const sections = document.querySelectorAll('.scroll-reveal');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  return (
     <div className="home">
      <section className="hero">
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src="/istockphoto-851568932-640_adpp_is.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <img src="/logo2.png" alt="Logo BDSC" className="logo-img" />
            <h1>Belgrano Day School</h1>
          {/* <h2>Hockey</h2> */}
          <p>Tradición, excelencia y formación integral en hockey</p>
          <Link to="/entrenadores" className="btn-hero">
            <FontAwesomeIcon icon={faUsers} />
            Conocé a nuestros entrenadores
          </Link>
        </div>
      </section>

      <section className="about scroll-reveal">
        <div className="container">
          <h2>Sobre el Hockey en BDSC</h2>
          <div className="about-content">
            <p className="lead">
              El hockey en Belgrano Day School Club es una tradición de excelencia, 
              compromiso y formación integral. Nuestro programa está diseñado para 
              desarrollar no solo las habilidades deportivas, sino también los valores 
              de trabajo en equipo, disciplina y respeto.
            </p>
            <p>
              Con más de 20 años de trayectoria, hemos formado jugadores que han 
              representado al club a nivel nacional e internacional. Nuestro equipo 
              de entrenadores especializados trabaja día a día para brindar la mejor 
              experiencia deportiva a cada uno de nuestros jugadores.
            </p>
          </div>
        </div>
      </section>

      <section className="trainers-preview scroll-reveal">
        <div className="container">
          <h2>Nuestros Entrenadores</h2>
          <p className="section-subtitle">
            Conocé al equipo de profesionales que lidera el hockey en BDSC
          </p>
          <Link to="/entrenadores" className="btn-secondary">
            <FontAwesomeIcon icon={faArrowRight} />
            Ver todos los entrenadores
          </Link>
        </div>
      </section>

      <section className="info-section scroll-reveal">
        <div className="container">
          <h2>Información y Categorías</h2>
          <div className="categories-grid">
            <div className="category-card">
              <FontAwesomeIcon className="category-icon" icon={faChildReaching} />
              <h3>Iniciación</h3>
              <p>Décima</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon className="category-icon" icon={faPersonRunning} />
              <h3>Infantiles</h3>
              <p>Novena y octava</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon className="category-icon" icon={faUserGroup} />
              <h3>Juveniles</h3>
              <p>Séptima, sexta y quinta</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon className="category-icon" icon={faTrophy} />
              <h3>Plantel superior</h3>
              <p>Intermedia y primera</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon className="category-icon" icon={faUsers} />
              <h3>Cuarta</h3>
              <p>Más de 35 años</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta scroll-reveal">
        <div className="container">
          <h2>¿Querés ser parte de BDSC Hockey?</h2>
          <Link to="/contacto" className="btn-cta">
            <FontAwesomeIcon icon={faPhone} />
            Contactanos
          </Link>
        </div>
      </section>

      <section className="sponsors scroll-reveal">
        <div className="container">
          <h2>Nuestros Sponsors</h2>
          <p className="section-subtitle sponsors-subtitle">Marcas que acompañan al hockey de BDSC</p>
          <div className="sponsor-image-wrapper">
            <img src="/Zona.jpg" alt="Zona Z" className="sponsor-image" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
