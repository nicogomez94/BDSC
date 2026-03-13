import prisma from '../utils/prisma.js';
import { generateSlug, validateRequired } from '../utils/validation.js';
import { sanitizeSitePageContent } from '../utils/siteContentHtml.js';

const normalizeSectionKey = (value) => String(value || '').toUpperCase();
const normalizeSlug = (value) => String(value || '').trim().toLowerCase();
const SYSTEM_PAGE_LOCK_ERROR = 'Página de sistema no editable';
const SYSTEM_SUBDIVISION_LOCK_ERROR = 'Subdivisión con páginas de sistema no editable';
const SYSTEM_SUBPAGE_LOCK_ERROR = 'No se pueden gestionar subpáginas en páginas de sistema';
const PROTECTED_SYSTEM_PAGES = [
  { sectionKey: 'COORDINACION', subdivisionSlug: 'gestion-interna', pageSlug: 'entrenadores' },
  { sectionKey: 'COORDINACION', subdivisionSlug: 'gestion-interna', pageSlug: 'preparadores-fisicos' },
  { sectionKey: 'COORDINACION', subdivisionSlug: 'operacion', pageSlug: 'asistencia' },
];

const parseSortOrder = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isProtectedSystemPage = (sectionKey, subdivisionSlug, pageSlug) => {
  const normalizedSectionKey = normalizeSectionKey(sectionKey);
  const normalizedSubdivisionSlug = normalizeSlug(subdivisionSlug);
  const normalizedPageSlug = normalizeSlug(pageSlug);
  return PROTECTED_SYSTEM_PAGES.some(
    (item) =>
      item.sectionKey === normalizedSectionKey &&
      item.subdivisionSlug === normalizedSubdivisionSlug &&
      item.pageSlug === normalizedPageSlug
  );
};

const isProtectedSystemSubdivision = (sectionKey, subdivisionSlug, pages = []) =>
  pages.some((page) => isProtectedSystemPage(sectionKey, subdivisionSlug, page.slug));

const resolvePublicBaseUrl = (req) => {
  const configured = String(process.env.PUBLIC_BASE_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '');

  const protoHeader = String(req.get('x-forwarded-proto') || '').split(',')[0].trim();
  const protocol = protoHeader || req.protocol;
  return `${protocol}://${req.get('host')}`;
};

export const getSiteContentAdminData = async (req, res, next) => {
  try {
    const data = await prisma.siteSubdivision.findMany({
      orderBy: [{ sectionKey: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        pages: {
          orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
          include: {
            subpages: {
              orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
            },
          },
        },
      },
    });

    const normalized = data.map((subdivision) => {
      const normalizedPages = (subdivision.pages || []).map((page) => {
        const isSystemPage = isProtectedSystemPage(subdivision.sectionKey, subdivision.slug, page.slug);
        return {
          ...page,
          content: sanitizeSitePageContent(page.content),
          subpages: (page.subpages || []).map((subpage) => ({
            ...subpage,
            content: sanitizeSitePageContent(subpage.content),
            isSystemPage,
            isReadOnly: isSystemPage,
          })),
          isSystemPage,
          isReadOnly: isSystemPage,
        };
      });

      const isReadOnly = isProtectedSystemSubdivision(subdivision.sectionKey, subdivision.slug, subdivision.pages);

      return {
        ...subdivision,
        pages: normalizedPages,
        isReadOnly,
      };
    });

    res.json(normalized);
  } catch (error) {
    next(error);
  }
};

export const createSiteSubdivision = async (req, res, next) => {
  try {
    const { sectionKey, name, description, sortOrder } = req.body;
    const normalizedSectionKey = normalizeSectionKey(sectionKey);
    const errors = validateRequired(['sectionKey', 'name'], { sectionKey: normalizedSectionKey, name });
    if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });
    if (!['COORDINACION', 'RECURSOS'].includes(normalizedSectionKey)) {
      return res.status(400).json({ error: 'sectionKey inválido' });
    }

    const subdivision = await prisma.siteSubdivision.create({
      data: {
        sectionKey: normalizedSectionKey,
        name,
        slug: generateSlug(name),
        description: description || null,
        sortOrder: parseSortOrder(sortOrder),
      },
    });

    res.status(201).json(subdivision);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una subdivisión con ese nombre' });
    next(error);
  }
};

export const updateSiteSubdivision = async (req, res, next) => {
  try {
    const subdivisionId = Number(req.params.id);
    const { sectionKey, name, description, sortOrder } = req.body;

    const subdivision = await prisma.siteSubdivision.findUnique({
      where: { id: subdivisionId },
      include: {
        pages: {
          select: { slug: true },
        },
      },
    });
    if (!subdivision) return res.status(404).json({ error: 'Subdivisión no encontrada' });
    if (isProtectedSystemSubdivision(subdivision.sectionKey, subdivision.slug, subdivision.pages)) {
      return res.status(403).json({ error: SYSTEM_SUBDIVISION_LOCK_ERROR });
    }

    const data = {};

    if (sectionKey !== undefined) {
      const normalizedSectionKey = normalizeSectionKey(sectionKey);
      if (!['COORDINACION', 'RECURSOS'].includes(normalizedSectionKey)) {
        return res.status(400).json({ error: 'sectionKey inválido' });
      }
      data.sectionKey = normalizedSectionKey;
    }

    if (name !== undefined) {
      data.name = name;
      data.slug = generateSlug(name);
    }
    if (description !== undefined) data.description = description || null;
    if (sortOrder !== undefined) data.sortOrder = parseSortOrder(sortOrder);

    const updatedSubdivision = await prisma.siteSubdivision.update({
      where: { id: subdivisionId },
      data,
    });

    res.json(updatedSubdivision);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una subdivisión con ese nombre' });
    next(error);
  }
};

export const deleteSiteSubdivision = async (req, res, next) => {
  try {
    const subdivisionId = Number(req.params.id);
    const subdivision = await prisma.siteSubdivision.findUnique({
      where: { id: subdivisionId },
      include: {
        pages: {
          select: { slug: true },
        },
      },
    });
    if (!subdivision) return res.status(404).json({ error: 'Subdivisión no encontrada' });
    if (isProtectedSystemSubdivision(subdivision.sectionKey, subdivision.slug, subdivision.pages)) {
      return res.status(403).json({ error: SYSTEM_SUBDIVISION_LOCK_ERROR });
    }

    await prisma.siteSubdivision.delete({ where: { id: subdivisionId } });
    res.json({ message: 'Subdivisión eliminada' });
  } catch (error) {
    next(error);
  }
};

export const createSitePage = async (req, res, next) => {
  try {
    const { subdivisionId, title, summary, content, sortOrder } = req.body;
    const errors = validateRequired(['subdivisionId', 'title'], { subdivisionId, title });
    if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });
    const subdivision = await prisma.siteSubdivision.findUnique({
      where: { id: Number(subdivisionId) },
      select: { sectionKey: true, slug: true },
    });
    if (!subdivision) return res.status(404).json({ error: 'Subdivisión no encontrada' });

    const pageSlug = generateSlug(title);
    if (isProtectedSystemPage(subdivision.sectionKey, subdivision.slug, pageSlug)) {
      return res.status(403).json({ error: SYSTEM_PAGE_LOCK_ERROR });
    }

    const page = await prisma.sitePage.create({
      data: {
        subdivisionId: Number(subdivisionId),
        title,
        slug: pageSlug,
        summary: summary || null,
        content: sanitizeSitePageContent(content),
        sortOrder: parseSortOrder(sortOrder),
      },
    });

    res.status(201).json(page);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una página con ese nombre' });
    next(error);
  }
};

export const createSiteSubpage = async (req, res, next) => {
  try {
    const { pageId, title, summary, content, sortOrder } = req.body;
    const errors = validateRequired(['pageId', 'title'], { pageId, title });
    if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });

    const page = await prisma.sitePage.findUnique({
      where: { id: Number(pageId) },
      include: {
        subdivision: {
          select: {
            sectionKey: true,
            slug: true,
          },
        },
      },
    });
    if (!page) return res.status(404).json({ error: 'Página no encontrada' });
    if (isProtectedSystemPage(page.subdivision.sectionKey, page.subdivision.slug, page.slug)) {
      return res.status(403).json({ error: SYSTEM_SUBPAGE_LOCK_ERROR });
    }

    const subpage = await prisma.siteSubpage.create({
      data: {
        pageId: Number(pageId),
        title,
        slug: generateSlug(title),
        summary: summary || null,
        content: sanitizeSitePageContent(content),
        sortOrder: parseSortOrder(sortOrder),
      },
    });

    res.status(201).json(subpage);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una subpágina con ese nombre' });
    next(error);
  }
};

export const updateSitePage = async (req, res, next) => {
  try {
    const pageId = Number(req.params.id);
    const { title, summary, content, sortOrder } = req.body;
    const currentPage = await prisma.sitePage.findUnique({
      where: { id: pageId },
      include: {
        subdivision: {
          select: {
            sectionKey: true,
            slug: true,
          },
        },
      },
    });
    if (!currentPage) return res.status(404).json({ error: 'Página no encontrada' });
    if (isProtectedSystemPage(currentPage.subdivision.sectionKey, currentPage.subdivision.slug, currentPage.slug)) {
      return res.status(403).json({ error: SYSTEM_PAGE_LOCK_ERROR });
    }

    const data = {};
    if (title !== undefined) {
      data.title = title;
      data.slug = generateSlug(title);
    }
    if (summary !== undefined) data.summary = summary || null;
    if (content !== undefined) data.content = sanitizeSitePageContent(content);
    if (sortOrder !== undefined) data.sortOrder = parseSortOrder(sortOrder);

    const page = await prisma.sitePage.update({
      where: { id: pageId },
      data,
    });

    res.json(page);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una página con ese nombre' });
    next(error);
  }
};

export const uploadSiteContentImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar una imagen.' });
    }

    const imageUrl = `${resolvePublicBaseUrl(req)}/uploads/site-content/${req.file.filename}`;
    res.status(201).json({ url: imageUrl });
  } catch (error) {
    next(error);
  }
};

export const uploadSiteContentPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un PDF.' });
    }

    const pdfUrl = `${resolvePublicBaseUrl(req)}/uploads/site-content/${req.file.filename}`;
    res.status(201).json({ url: pdfUrl });
  } catch (error) {
    next(error);
  }
};

export const updateSiteSubpage = async (req, res, next) => {
  try {
    const subpageId = Number(req.params.id);
    const { title, summary, content, sortOrder } = req.body;
    const currentSubpage = await prisma.siteSubpage.findUnique({
      where: { id: subpageId },
      include: {
        page: {
          include: {
            subdivision: {
              select: {
                sectionKey: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    if (!currentSubpage) return res.status(404).json({ error: 'Subpágina no encontrada' });
    if (isProtectedSystemPage(currentSubpage.page.subdivision.sectionKey, currentSubpage.page.subdivision.slug, currentSubpage.page.slug)) {
      return res.status(403).json({ error: SYSTEM_SUBPAGE_LOCK_ERROR });
    }

    const data = {};
    if (title !== undefined) {
      data.title = title;
      data.slug = generateSlug(title);
    }
    if (summary !== undefined) data.summary = summary || null;
    if (content !== undefined) data.content = sanitizeSitePageContent(content);
    if (sortOrder !== undefined) data.sortOrder = parseSortOrder(sortOrder);

    const subpage = await prisma.siteSubpage.update({
      where: { id: subpageId },
      data,
    });

    res.json(subpage);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una subpágina con ese nombre' });
    next(error);
  }
};

export const deleteSitePage = async (req, res, next) => {
  try {
    const pageId = Number(req.params.id);
    const page = await prisma.sitePage.findUnique({
      where: { id: pageId },
      include: {
        subdivision: {
          select: {
            sectionKey: true,
            slug: true,
          },
        },
      },
    });
    if (!page) return res.status(404).json({ error: 'Página no encontrada' });
    if (isProtectedSystemPage(page.subdivision.sectionKey, page.subdivision.slug, page.slug)) {
      return res.status(403).json({ error: SYSTEM_PAGE_LOCK_ERROR });
    }

    await prisma.sitePage.delete({ where: { id: pageId } });
    res.json({ message: 'Página eliminada' });
  } catch (error) {
    next(error);
  }
};

export const deleteSiteSubpage = async (req, res, next) => {
  try {
    const subpageId = Number(req.params.id);
    const subpage = await prisma.siteSubpage.findUnique({
      where: { id: subpageId },
      include: {
        page: {
          include: {
            subdivision: {
              select: {
                sectionKey: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    if (!subpage) return res.status(404).json({ error: 'Subpágina no encontrada' });
    if (isProtectedSystemPage(subpage.page.subdivision.sectionKey, subpage.page.subdivision.slug, subpage.page.slug)) {
      return res.status(403).json({ error: SYSTEM_SUBPAGE_LOCK_ERROR });
    }

    await prisma.siteSubpage.delete({ where: { id: subpageId } });
    res.json({ message: 'Subpágina eliminada' });
  } catch (error) {
    next(error);
  }
};
