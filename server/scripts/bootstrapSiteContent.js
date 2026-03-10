import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SITE_SECTION_KEYS = {
  COORDINACION: 'COORDINACION',
  RECURSOS: 'RECURSOS',
};

const DEFAULTS = {
  [SITE_SECTION_KEYS.COORDINACION]: [
    {
      name: 'Operación',
      slug: 'operacion',
      description: 'Seguimiento de la operación diaria de planteles y logística.',
      sortOrder: 1,
      pages: [
        { title: 'Planteles', slug: 'planteles', sortOrder: 1 },
        { title: 'Asistencia', slug: 'asistencia', sortOrder: 2 },
        { title: 'Reunión de padres', slug: 'reunion-de-padres', sortOrder: 3 },
        { title: 'Distribución de espacios', slug: 'distribucion-de-espacios', sortOrder: 4 },
      ],
    },
    {
      name: 'Competencia',
      slug: 'competencia',
      description: 'Bloque dedicado al rendimiento competitivo y análisis de rivales.',
      sortOrder: 2,
      pages: [
        { title: 'Categoría E1', slug: 'categoria-e1', sortOrder: 1 },
        { title: 'Categoría 4ta B', slug: 'categoria-4ta-b', sortOrder: 2 },
        { title: 'Fixture', slug: 'fixture', sortOrder: 3 },
        { title: 'Videos de partidos', slug: 'videos-de-partidos', sortOrder: 4 },
        { title: 'Videos de rivales', slug: 'videos-de-rivales', sortOrder: 5 },
      ],
    },
    {
      name: 'Temporada 2026',
      slug: 'temporada-2026',
      description: 'Planificación macro del inicio y desarrollo de temporada.',
      sortOrder: 3,
      pages: [
        { title: 'Plan de pretemporada', slug: 'plan-de-pretemporada', sortOrder: 1 },
        { title: 'Inicio de actividades', slug: 'inicio-de-actividades', sortOrder: 2 },
        { title: 'Pretemporada de febrero', slug: 'pretemporada-de-febrero', sortOrder: 3 },
      ],
    },
    {
      name: 'Gestión interna',
      slug: 'gestion-interna',
      description: 'Recursos humanos, soporte interno y documentación operativa.',
      sortOrder: 4,
      pages: [
        { title: 'Entrenadores', slug: 'entrenadores', sortOrder: 1 },
        { title: 'Preparadores físicos', slug: 'preparadores-fisicos', sortOrder: 2 },
        { title: 'Árbitros', slug: 'arbitros', sortOrder: 3 },
        { title: 'Fotos', slug: 'fotos', sortOrder: 4 },
        { title: 'Capacitaciones', slug: 'capacitaciones', sortOrder: 5 },
      ],
    },
  ],
  [SITE_SECTION_KEYS.RECURSOS]: [
    {
      name: 'Planificación deportiva',
      slug: 'planificacion-deportiva',
      description: 'Marco conceptual y herramientas para orientar el proceso formativo.',
      sortOrder: 1,
      pages: [
        { title: 'Modelo de juego', slug: 'modelo-de-juego', sortOrder: 1 },
        { title: 'Fases de la planificación', slug: 'fases-de-la-planificacion', sortOrder: 2 },
        { title: 'Plan de acción - Diagnóstico', slug: 'plan-de-accion-diagnostico', sortOrder: 3 },
        { title: 'Plan de acción - Objetivos', slug: 'plan-de-accion-objetivos', sortOrder: 4 },
      ],
    },
    {
      name: 'Entrenamientos',
      slug: 'entrenamientos',
      description: 'Material operativo para diseño y ejecución de entrenamientos.',
      sortOrder: 2,
      pages: [
        { title: 'Simbología', slug: 'simbologia', sortOrder: 1 },
        { title: 'Planilla de entrenamiento', slug: 'planilla-de-entrenamiento', sortOrder: 2 },
        { title: 'Planilla de partido', slug: 'planilla-de-partido', sortOrder: 3 },
        { title: 'Guía de gestos técnicos', slug: 'guia-de-gestos-tecnicos', sortOrder: 4 },
      ],
    },
  ],
};

const ensureSiteContent = async () => {
  for (const [sectionKey, subdivisions] of Object.entries(DEFAULTS)) {
    for (const subdivisionData of subdivisions) {
      const existingSubdivision = await prisma.siteSubdivision.findUnique({
        where: {
          sectionKey_slug: {
            sectionKey,
            slug: subdivisionData.slug,
          },
        },
      });

      const subdivision = existingSubdivision
        ? existingSubdivision
        : await prisma.siteSubdivision.create({
            data: {
              sectionKey,
              name: subdivisionData.name,
              slug: subdivisionData.slug,
              description: subdivisionData.description,
              sortOrder: subdivisionData.sortOrder,
            },
          });

      for (const pageData of subdivisionData.pages) {
        const existingPage = await prisma.sitePage.findUnique({
          where: {
            subdivisionId_slug: {
              subdivisionId: subdivision.id,
              slug: pageData.slug,
            },
          },
        });

        if (!existingPage) {
          await prisma.sitePage.create({
            data: {
              subdivisionId: subdivision.id,
              title: pageData.title,
              slug: pageData.slug,
              sortOrder: pageData.sortOrder,
            },
          });
        }
      }
    }
  }
};

const main = async () => {
  console.log('Bootstrapping site content...');
  await ensureSiteContent();
  console.log('Site content bootstrap completed.');
};

main()
  .catch((error) => {
    console.error('Site content bootstrap failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
