import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="home-header">
        <div className="container">
          <h1>Inicio</h1>
          <p>
            Portal central de coordinación de hockey. Accedé rápido a operación,
            planificación y seguimiento interno.
          </p>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <h2>Accesos rápidos</h2>
          <div className="home-grid home-grid-links">
            <Link to="/coordinacion" className="home-card home-card-link">
              <h3>Coordinación</h3>
              <p>Operación, competencia, temporada 2026 y gestión interna.</p>
            </Link>
            <Link to="/recursos" className="home-card home-card-link">
              <h3>Recursos</h3>
              <p>Planificación deportiva y herramientas de entrenamiento.</p>
            </Link>
            <Link to="/contacto" className="home-card home-card-link">
              <h3>Contacto</h3>
              <p>Canales de consulta y comunicación interna.</p>
            </Link>
            <Link to="/panel" className="home-card home-card-link">
              <h3>Panel</h3>
              <p>Acceso al espacio privado por rol de usuario.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section home-section-soft">
        <div className="container">
          <h2>Resumen</h2>
          <div className="home-grid">
            <article className="home-card">
              <h3>Operación diaria</h3>
              <p>Control de planteles, asistencia y distribución de espacios.</p>
            </article>
            <article className="home-card">
              <h3>Competencia</h3>
              <p>Seguimiento por categorías, fixture y análisis en video.</p>
            </article>
            <article className="home-card">
              <h3>Temporada 2026</h3>
              <p>Estado de pretemporada y cronograma de inicio de actividades.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <h2>Novedades</h2>
          <div className="home-updates">
            <article className="home-update">
              <h3>Distribución de espacios</h3>
              <p>Publicar asignación semanal de canchas y horarios de entrenamiento.</p>
            </article>
            <article className="home-update">
              <h3>Reunión de padres</h3>
              <p>Definir fecha por categorías para primera reunión del ciclo.</p>
            </article>
            <article className="home-update">
              <h3>Pretemporada febrero</h3>
              <p>Completar carga de objetivos y seguimiento por grupo.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
