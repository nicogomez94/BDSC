import prisma from '../utils/prisma.js';
import { sanitizeSitePageContent } from '../utils/siteContentHtml.js';
import { listDivisions, getDivisionAttendanceMatrix } from '../services/attendanceService.js';

const normalizeSectionKey = (value) => String(value || '').toUpperCase();

export const getSiteContentBySection = async (req, res, next) => {
  try {
    const sectionKey = normalizeSectionKey(req.params.sectionKey);
    if (!['COORDINACION', 'RECURSOS'].includes(sectionKey)) {
      return res.status(400).json({ error: 'sectionKey inválido' });
    }

    const subdivisions = await prisma.siteSubdivision.findMany({
      where: { sectionKey },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        pages: {
          orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        },
      },
    });

    res.json(
      subdivisions.map((subdivision) => ({
        ...subdivision,
        pages: (subdivision.pages || []).map((page) => ({
          ...page,
          content: sanitizeSitePageContent(page.content),
        })),
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const getSitePage = async (req, res, next) => {
  try {
    const sectionKey = normalizeSectionKey(req.params.sectionKey);
    const { subdivisionSlug, pageSlug } = req.params;

    if (!['COORDINACION', 'RECURSOS'].includes(sectionKey)) {
      return res.status(400).json({ error: 'sectionKey inválido' });
    }

    const subdivision = await prisma.siteSubdivision.findFirst({
      where: { sectionKey, slug: subdivisionSlug },
      include: {
        pages: {
          orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        },
      },
    });

    if (!subdivision) {
      return res.status(404).json({ error: 'Subdivisión no encontrada' });
    }

    const normalizedPages = (subdivision.pages || []).map((item) => ({
      ...item,
      content: sanitizeSitePageContent(item.content),
    }));

    const normalizedPage = normalizedPages.find((item) => item.slug === pageSlug);
    if (!normalizedPage) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    res.json({
      sectionKey,
      subdivision: {
        id: subdivision.id,
        name: subdivision.name,
        slug: subdivision.slug,
        description: subdivision.description,
      },
      page: normalizedPage,
      pages: normalizedPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicAttendanceDivisions = async (req, res, next) => {
  try {
    const divisions = await listDivisions(req.query);
    res.json(divisions);
  } catch (error) {
    next(error);
  }
};

export const getPublicAttendanceMatrix = async (req, res, next) => {
  try {
    const divisionId = req.query.divisionId;
    if (!divisionId) {
      return res.status(400).json({ error: 'divisionId es requerido' });
    }

    const matrix = await getDivisionAttendanceMatrix(divisionId, req.query, null);
    res.json(matrix);
  } catch (error) {
    next(error);
  }
};
