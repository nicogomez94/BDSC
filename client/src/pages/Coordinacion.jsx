import { Link } from 'react-router-dom';
import './SectionLanding.css';

const sectionGroups = [
  {
    id: 'operacion',
    title: 'Operación',
    description: 'Seguimiento de la operación diaria de planteles y logística.',
    items: [
      { name: 'Planteles' },
      { name: 'Asistencia' },
      { name: 'Reunión de padres' },
      { name: 'Distribución de espacios' },
    ],
  },
  {
    id: 'competencia',
    title: 'Competencia',
    description: 'Bloque dedicado al rendimiento competitivo y análisis de rivales.',
    items: [
      { name: 'Categoría E1' },
      { name: 'Categoría 4ta B' },
      { name: 'Fixture' },
      { name: 'Videos de partidos' },
      { name: 'Videos de rivales' },
    ],
  },
  {
    id: 'temporada-2026',
    title: 'Temporada 2026',
    description: 'Planificación macro del inicio y desarrollo de temporada.',
    items: [
      { name: 'Plan de pretemporada' },
      { name: 'Inicio de actividades' },
      { name: 'Pretemporada de febrero' },
    ],
  },
  {
    id: 'gestion-interna',
    title: 'Gestión interna',
    description: 'Recursos humanos, soporte interno y documentación operativa.',
    items: [
      {
        name: 'Coordinadores',
        path: '/coordinacion/gestion-interna/coordinadores',
      },
      { name: 'Árbitros' },
      { name: 'Fotos' },
      { name: 'Capacitaciones' },
    ],
  },
];

const Coordinacion = () => {
  return (
    <div className="section-landing">
      <header className="section-landing-hero">
        <div className="container">
          <h1>Coordinación</h1>
          <p>
            Centro operativo del sistema. Cada frente de trabajo queda organizado en
            sub-secciones para simplificar gestión, seguimiento y crecimiento.
          </p>

          <nav className="section-top-nav" aria-label="Subsecciones de coordinación">
            {sectionGroups.map((group) => (
              <a key={group.id} href={`#${group.id}`} className="section-chip">
                {group.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="container">
        {sectionGroups.map((group) => (
          <section key={group.id} id={group.id} className="section-block">
            <h2>{group.title}</h2>
            <p>{group.description}</p>

            <div className="section-item-grid">
              {group.items.map((item) => (
                <article key={item.name} className="section-item-card">
                  <h3 className="section-item-title">{item.name}</h3>
                  {item.path ? (
                    <Link to={item.path} className="section-item-action">
                      Abrir sección
                    </Link>
                  ) : (
                    <span className="section-item-placeholder">Contenido en armado</span>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Coordinacion;
