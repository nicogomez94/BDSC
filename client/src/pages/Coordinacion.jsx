import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faTrophy,
  faCalendarDays,
  faUsersGear,
  faUsers,
  faUserCheck,
  faPeopleRoof,
  faMapLocationDot,
  faFutbol,
  faVideo,
  faPersonWalkingLuggage,
  faPlay,
  faUserTie,
  faGavel,
  faCamera,
  faChalkboardUser
} from '@fortawesome/free-solid-svg-icons';
import './SectionLanding.css';

const sectionGroups = [
  {
    id: 'operacion',
    title: 'Operación',
    icon: faClipboardList,
    description: 'Seguimiento de la operación diaria de planteles y logística.',
    items: [
      { name: 'Planteles', icon: faUsers },
      { name: 'Asistencia', icon: faUserCheck },
      { name: 'Reunión de padres', icon: faPeopleRoof },
      { name: 'Distribución de espacios', icon: faMapLocationDot },
    ],
  },
  {
    id: 'competencia',
    title: 'Competencia',
    icon: faTrophy,
    description: 'Bloque dedicado al rendimiento competitivo y análisis de rivales.',
    items: [
      { name: 'Categoría E1', icon: faFutbol },
      { name: 'Categoría 4ta B', icon: faFutbol },
      { name: 'Fixture', icon: faCalendarDays },
      { name: 'Videos de partidos', icon: faVideo },
      { name: 'Videos de rivales', icon: faVideo },
    ],
  },
  {
    id: 'temporada-2026',
    title: 'Temporada 2026',
    icon: faCalendarDays,
    description: 'Planificación macro del inicio y desarrollo de temporada.',
    items: [
      { name: 'Plan de pretemporada', icon: faPersonWalkingLuggage },
      { name: 'Inicio de actividades', icon: faPlay },
      { name: 'Pretemporada de febrero', icon: faCalendarDays },
    ],
  },
  {
    id: 'gestion-interna',
    title: 'Gestión interna',
    icon: faUsersGear,
    description: 'Recursos humanos, soporte interno y documentación operativa.',
    items: [
      {
        name: 'Entrenadores',
        icon: faUserTie,
        path: '/coordinacion/gestion-interna/coordinadores',
      },
      { name: 'Árbitros', icon: faGavel },
      { name: 'Fotos', icon: faCamera },
      { name: 'Capacitaciones', icon: faChalkboardUser },
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
                <FontAwesomeIcon icon={group.icon} />
                {group.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="container">
        {sectionGroups.map((group) => (
          <section key={group.id} id={group.id} className="section-block">
            <h2 className="section-block-title">
              <FontAwesomeIcon icon={group.icon} />
              {group.title}
            </h2>
            <p>{group.description}</p>

            <div className="section-item-grid">
              {group.items.map((item) => (
                <article key={item.name} className="section-item-card">
                  <h3 className="section-item-title">
                    <FontAwesomeIcon icon={item.icon} />
                    {item.name}
                  </h3>
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
