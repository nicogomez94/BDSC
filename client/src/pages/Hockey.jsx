import './Hockey.css';

const Hockey = () => {
  return (
    <div className="hockey-page">
      <div className="hockey-hero">
        <h1>Hockey en BDSC</h1>
        <p className="hockey-intro">
          Tradición, excelencia y pasión por el hockey sobre césped
        </p>
      </div>

      <div className="container">
        <section className="hockey-section">
          <h2>Nuestra Historia</h2>
          <p>
            El hockey en Belgrano Day School Club comenzó hace más de dos décadas 
            con un grupo pequeño de apasionados por este deporte. Desde entonces, 
            hemos crecido hasta convertirnos en una de las instituciones más 
            reconocidas en el ámbito del hockey argentino.
          </p>
          <p>
            Nuestro compromiso con la formación integral de deportistas ha sido 
            el pilar fundamental de nuestro crecimiento, combinando excelencia 
            técnica con valores deportivos de la más alta calidad.
          </p>
        </section>

        <section className="hockey-section categories-section">
          <h2>Categorías</h2>
          <div className="categories-list">
            <div className="category-item">
              <h3>Mini Hockey</h3>
              <p className="age">4-6 años</p>
              <p>Iniciación al deporte en un ambiente lúdico y divertido</p>
            </div>
            <div className="category-item">
              <h3>Pre-Infantiles</h3>
              <p className="age">7-9 años</p>
              <p>Desarrollo de técnicas básicas y fundamentos del juego</p>
            </div>
            <div className="category-item">
              <h3>Infantiles</h3>
              <p className="age">10-12 años</p>
              <p>Consolidación técnica y primeras competencias</p>
            </div>
            <div className="category-item">
              <h3>Menores</h3>
              <p className="age">13-15 años</p>
              <p>Competencia regional y desarrollo táctico avanzado</p>
            </div>
            <div className="category-item">
              <h3>Juveniles</h3>
              <p className="age">16-18 años</p>
              <p>Alta competencia y formación de jugadores de élite</p>
            </div>
            <div className="category-item">
              <h3>Primera División</h3>
              <p className="age">Mayores</p>
              <p>Nivel profesional y representación del club</p>
            </div>
          </div>
        </section>

        <section className="hockey-section">
          <h2>Instalaciones</h2>
          <div className="facilities-grid">
            <div className="facility-item">
              <h3>🏑 Canchas de Césped Sintético</h3>
              <p>Superficies de última generación que cumplen con estándares internacionales</p>
            </div>
            <div className="facility-item">
              <h3>👕 Vestuarios Equipados</h3>
              <p>Espacios cómodos y modernos para jugadores y entrenadores</p>
            </div>
            <div className="facility-item">
              <h3>💪 Sala de Musculación</h3>
              <p>Gimnasio equipado para preparación física específica</p>
            </div>
            <div className="facility-item">
              <h3>📊 Sala de Análisis</h3>
              <p>Espacio para análisis táctico y video con tecnología moderna</p>
            </div>
          </div>
        </section>

        <section className="hockey-section achievements">
          <h2>Logros Destacados</h2>
          <div className="achievements-list">
            <div className="achievement-item">
              <span className="achievement-icon">🏆</span>
              <p>Campeones Torneo Metropolitano 2024</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">🥈</span>
              <p>Subcampeones Torneo Federal 2023</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">⭐</span>
              <p>10 jugadores en selecciones nacionales juveniles</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">🎓</span>
              <p>Más de 50 jugadores en equipos universitarios</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Hockey;

