import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Belgrano Day School Club (BDSC)</h1>
          <h2>Hockey</h2>
          <p>Tradición, excelencia y formación integral en hockey</p>
          <Link to="/entrenadores" className="btn-hero">
            Conocé a nuestros entrenadores
          </Link>
        </div>
      </section>

      <section className="about">
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

      <section className="trainers-preview">
        <div className="container">
          <h2>Nuestros Entrenadores</h2>
          <p className="section-subtitle">
            Conocé al equipo de profesionales que lidera el hockey en BDSC
          </p>
          <Link to="/entrenadores" className="btn-secondary">
            Ver todos los entrenadores
          </Link>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <h2>Información y Categorías</h2>
          <div className="categories-grid">
            <div className="category-card">
              <h3>Mini Hockey</h3>
              <p>4-6 años</p>
            </div>
            <div className="category-card">
              <h3>Infantiles</h3>
              <p>7-12 años</p>
            </div>
            <div className="category-card">
              <h3>Juveniles</h3>
              <p>13-18 años</p>
            </div>
            <div className="category-card">
              <h3>Primera</h3>
              <p>Mayores</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>¿Querés ser parte de BDSC Hockey?</h2>
          <Link to="/contacto" className="btn-cta">
            Contactanos
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
