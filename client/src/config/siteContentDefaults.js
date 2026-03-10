export const SITE_SECTION_KEYS = {
  COORDINACION: 'COORDINACION',
  RECURSOS: 'RECURSOS',
};

export const SITE_SECTION_LABELS = {
  [SITE_SECTION_KEYS.COORDINACION]: 'Coordinación',
  [SITE_SECTION_KEYS.RECURSOS]: 'Recursos',
};

export const SITE_SECTION_DEFAULTS = {
  [SITE_SECTION_KEYS.COORDINACION]: [
    {
      id: 'default-coord-operacion',
      sectionKey: SITE_SECTION_KEYS.COORDINACION,
      name: 'Operación',
      slug: 'operacion',
      description: 'Seguimiento de la operación diaria de planteles y logística.',
      sortOrder: 1,
      pages: [
        { id: 'default-coord-operacion-1', title: 'Planteles', slug: 'planteles', summary: '', content: '', sortOrder: 1 },
        { id: 'default-coord-operacion-2', title: 'Asistencia', slug: 'asistencia', summary: '', content: '', sortOrder: 2 },
        { id: 'default-coord-operacion-3', title: 'Reunión de padres', slug: 'reunion-de-padres', summary: '', content: '', sortOrder: 3 },
        { id: 'default-coord-operacion-4', title: 'Distribución de espacios', slug: 'distribucion-de-espacios', summary: '', content: '', sortOrder: 4 },
      ],
    },
    {
      id: 'default-coord-competencia',
      sectionKey: SITE_SECTION_KEYS.COORDINACION,
      name: 'Competencia',
      slug: 'competencia',
      description: 'Bloque dedicado al rendimiento competitivo y análisis de rivales.',
      sortOrder: 2,
      pages: [
        { id: 'default-coord-competencia-1', title: 'Categoría E1', slug: 'categoria-e1', summary: '', content: '', sortOrder: 1 },
        { id: 'default-coord-competencia-2', title: 'Categoría 4ta B', slug: 'categoria-4ta-b', summary: '', content: '', sortOrder: 2 },
        { id: 'default-coord-competencia-3', title: 'Fixture', slug: 'fixture', summary: '', content: '', sortOrder: 3 },
        { id: 'default-coord-competencia-4', title: 'Videos de partidos', slug: 'videos-de-partidos', summary: '', content: '', sortOrder: 4 },
        { id: 'default-coord-competencia-5', title: 'Videos de rivales', slug: 'videos-de-rivales', summary: '', content: '', sortOrder: 5 },
      ],
    },
    {
      id: 'default-coord-temporada',
      sectionKey: SITE_SECTION_KEYS.COORDINACION,
      name: 'Temporada 2026',
      slug: 'temporada-2026',
      description: 'Planificación macro del inicio y desarrollo de temporada.',
      sortOrder: 3,
      pages: [
        { id: 'default-coord-temporada-1', title: 'Plan de pretemporada', slug: 'plan-de-pretemporada', summary: '', content: '', sortOrder: 1 },
        { id: 'default-coord-temporada-2', title: 'Inicio de actividades', slug: 'inicio-de-actividades', summary: '', content: '', sortOrder: 2 },
        { id: 'default-coord-temporada-3', title: 'Pretemporada de febrero', slug: 'pretemporada-de-febrero', summary: '', content: '', sortOrder: 3 },
      ],
    },
    {
      id: 'default-coord-gestion',
      sectionKey: SITE_SECTION_KEYS.COORDINACION,
      name: 'Gestión interna',
      slug: 'gestion-interna',
      description: 'Recursos humanos, soporte interno y documentación operativa.',
      sortOrder: 4,
      pages: [
        { id: 'default-coord-gestion-1', title: 'Entrenadores', slug: 'entrenadores', summary: '', content: '', sortOrder: 1 },
        { id: 'default-coord-gestion-2', title: 'Preparadores físicos', slug: 'preparadores-fisicos', summary: '', content: '', sortOrder: 2 },
        { id: 'default-coord-gestion-3', title: 'Árbitros', slug: 'arbitros', summary: '', content: '', sortOrder: 3 },
        { id: 'default-coord-gestion-4', title: 'Fotos', slug: 'fotos', summary: '', content: '', sortOrder: 4 },
        { id: 'default-coord-gestion-5', title: 'Capacitaciones', slug: 'capacitaciones', summary: '', content: '', sortOrder: 5 },
      ],
    },
  ],
  [SITE_SECTION_KEYS.RECURSOS]: [
    {
      id: 'default-rec-planificacion',
      sectionKey: SITE_SECTION_KEYS.RECURSOS,
      name: 'Planificación deportiva',
      slug: 'planificacion-deportiva',
      description: 'Marco conceptual y herramientas para orientar el proceso formativo.',
      sortOrder: 1,
      pages: [
        { id: 'default-rec-planificacion-1', title: 'Modelo de juego', slug: 'modelo-de-juego', summary: '', content: '', sortOrder: 1 },
        { id: 'default-rec-planificacion-2', title: 'Fases de la planificación', slug: 'fases-de-la-planificacion', summary: '', content: '', sortOrder: 2 },
        { id: 'default-rec-planificacion-3', title: 'Plan de acción - Diagnóstico', slug: 'plan-de-accion-diagnostico', summary: '', content: '', sortOrder: 3 },
        { id: 'default-rec-planificacion-4', title: 'Plan de acción - Objetivos', slug: 'plan-de-accion-objetivos', summary: '', content: '', sortOrder: 4 },
      ],
    },
    {
      id: 'default-rec-entrenamientos',
      sectionKey: SITE_SECTION_KEYS.RECURSOS,
      name: 'Entrenamientos',
      slug: 'entrenamientos',
      description: 'Material operativo para diseño y ejecución de entrenamientos.',
      sortOrder: 2,
      pages: [
        { id: 'default-rec-entrenamientos-1', title: 'Simbología', slug: 'simbologia', summary: '', content: '', sortOrder: 1 },
        { id: 'default-rec-entrenamientos-2', title: 'Planilla de entrenamiento', slug: 'planilla-de-entrenamiento', summary: '', content: '', sortOrder: 2 },
        { id: 'default-rec-entrenamientos-3', title: 'Planilla de partido', slug: 'planilla-de-partido', summary: '', content: '', sortOrder: 3 },
        { id: 'default-rec-entrenamientos-4', title: 'Guía de gestos técnicos', slug: 'guia-de-gestos-tecnicos', summary: '', content: '', sortOrder: 4 },
      ],
    },
  ],
};
