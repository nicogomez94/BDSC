import prisma from '../utils/prisma.js';
import { generateSlug, validateRequired } from '../utils/validation.js';
import { sanitizeSitePageContent } from '../utils/siteContentHtml.js';

const normalizeSectionKey = (value) => String(value || '').toUpperCase();
const parseSortOrder = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getSiteContentAdminData = async (req, res, next) => {
  try {
    const data = await prisma.siteSubdivision.findMany({
      orderBy: [{ sectionKey: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        pages: {
          orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        },
      },
    });

    const normalized = data.map((subdivision) => ({
      ...subdivision,
      pages: (subdivision.pages || []).map((page) => ({
        ...page,
        content: sanitizeSitePageContent(page.content),
      })),
    }));

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

    const subdivision = await prisma.siteSubdivision.update({
      where: { id: subdivisionId },
      data,
    });

    res.json(subdivision);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una subdivisión con ese nombre' });
    next(error);
  }
};

export const deleteSiteSubdivision = async (req, res, next) => {
  try {
    const subdivisionId = Number(req.params.id);
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

    const page = await prisma.sitePage.create({
      data: {
        subdivisionId: Number(subdivisionId),
        title,
        slug: generateSlug(title),
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

export const updateSitePage = async (req, res, next) => {
  try {
    const pageId = Number(req.params.id);
    const { title, summary, content, sortOrder } = req.body;
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

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/site-content/${req.file.filename}`;
    res.status(201).json({ url: imageUrl });
  } catch (error) {
    next(error);
  }
};

export const deleteSitePage = async (req, res, next) => {
  try {
    const pageId = Number(req.params.id);
    await prisma.sitePage.delete({ where: { id: pageId } });
    res.json({ message: 'Página eliminada' });
  } catch (error) {
    next(error);
  }
};
