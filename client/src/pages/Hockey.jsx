import './Hockey.css';

const Hockey = () => {
  return (
    <div className="hockey-page">
      <div className="container">
        <h1>Hockey en BDSC</h1>
        
        <section className="hockey-section">
          <h2>Nuestra Historia</h2>
          <p>
            El hockey en Belgrano Day School Club comenzó hace más de dos décadas 
            con un grupo pequeño de apasionados por este deporte. Desde entonces, 
            hemos crecido hasta convertirnos en una de las instituciones más 
            reconocidas en el ámbito del hockey argentino.
          </p>
        </section>

        <section className="hockey-section">
          <h2>Categorías</h2>
          <ul>
            <li><strong>Mini Hockey (4-6 años):</strong> Iniciación al deporte</li>
            <li><strong>Pre-Infantiles (7-9 años):</strong> Desarrollo de técnicas básicas</li>
            <li><strong>Infantiles (10-12 años):</strong> Consolidación técnica</li>
            <li><strong>Menores (13-15 años):</strong> Competencia regional</li>
            <li><strong>Juveniles (16-18 años):</strong> Alta competencia</li>
            <li><strong>Primera (Mayores):</strong> Nivel profesional</li>
          </ul>
        </section>

        <section className="hockey-section">
          <h2>Instalaciones</h2>
          <p>
            Contamos con canchas de césped sintético de última generación, 
            vestuarios equipados, sala de musculación y espacios de reunión 
            para análisis táctico. Todo pensado para el desarrollo integral 
            de nuestros jugadores.
          </p>
        </section>

        <section className="hockey-section">
          <h2>Logros</h2>
          <ul>
            <li>Campeones torneo metropolitano 2024</li>
            <li>Subcampeones torneo federal 2023</li>
            <li>10 jugadores en selecciones nacionales juveniles</li>
            <li>Más de 50 jugadores en equipos universitarios</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Hockey;
