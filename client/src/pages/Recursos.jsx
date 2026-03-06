import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faDumbbell,
  faChessBoard,
  faSitemap,
  faMagnifyingGlassChart,
  faBullseye,
  faPencilRuler,
  faTable,
  faFileLines,
  faPersonChalkboard
} from '@fortawesome/free-solid-svg-icons';
import './SectionLanding.css';

const resourcesGroups = [
  {
    id: 'planificacion-deportiva',
    title: 'Planificación deportiva',
    icon: faBook,
    description: 'Marco conceptual y herramientas para orientar el proceso formativo.',
    items: [
      { name: 'Modelo de juego', icon: faChessBoard },
      { name: 'Fases de la planificación', icon: faSitemap },
      { name: 'Plan de acción - Diagnóstico', icon: faMagnifyingGlassChart },
      { name: 'Plan de acción - Objetivos', icon: faBullseye },
    ],
  },
  {
    id: 'entrenamientos',
    title: 'Entrenamientos',
    icon: faDumbbell,
    description: 'Material operativo para diseño y ejecución de entrenamientos.',
    items: [
      { name: 'Simbología', icon: faPencilRuler },
      { name: 'Planilla de entrenamiento', icon: faTable },
      { name: 'Planilla de partido', icon: faFileLines },
      { name: 'Guía de gestos técnicos', icon: faPersonChalkboard },
    ],
  },
];

const Recursos = () => {
  return (
    <div className="section-landing">
      <header className="section-landing-hero">
        <div className="container">
          <h1>Recursos</h1>
          <p>
            Biblioteca de referencia para entrenadores y coordinación. La estructura
            está lista para incorporar documentación y materiales por etapas.
          </p>

          <nav className="section-top-nav" aria-label="Subsecciones de recursos">
            {resourcesGroups.map((group) => (
              <a key={group.id} href={`#${group.id}`} className="section-chip">
                <FontAwesomeIcon icon={group.icon} />
                {group.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="container">
        {resourcesGroups.map((group) => (
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
                  <span className="section-item-placeholder">Contenido en armado</span>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Recursos;
