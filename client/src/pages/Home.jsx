import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>BDSC Hockey</h1>
          <p>Belgrano Day School Club - Excelencia en Hockey</p>
          <Link to="/entrenadores" className="btn-primary">
            Conoce a nuestros entrenadores
          </Link>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h2>Sobre el Hockey en BDSC</h2>
          <p>
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
      </section>

      <section className="cta">
        <div className="container">
          <h2>¿Querés ser parte de BDSC Hockey?</h2>
          <Link to="/contacto" className="btn-secondary">
            Contactanos
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
