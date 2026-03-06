import './SectionLanding.css';

const resourcesGroups = [
  {
    id: 'planificacion-deportiva',
    title: 'Planificación deportiva',
    description: 'Marco conceptual y herramientas para orientar el proceso formativo.',
    items: [
      { name: 'Modelo de juego' },
      { name: 'Fases de la planificación' },
      { name: 'Plan de acción - Diagnóstico' },
      { name: 'Plan de acción - Objetivos' },
    ],
  },
  {
    id: 'entrenamientos',
    title: 'Entrenamientos',
    description: 'Material operativo para diseño y ejecución de entrenamientos.',
    items: [
      { name: 'Simbología' },
      { name: 'Planilla de entrenamiento' },
      { name: 'Planilla de partido' },
      { name: 'Guía de gestos técnicos' },
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
                {group.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="container">
        {resourcesGroups.map((group) => (
          <section key={group.id} id={group.id} className="section-block">
            <h2>{group.title}</h2>
            <p>{group.description}</p>

            <div className="section-item-grid">
              {group.items.map((item) => (
                <article key={item.name} className="section-item-card">
                  <h3 className="section-item-title">{item.name}</h3>
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
