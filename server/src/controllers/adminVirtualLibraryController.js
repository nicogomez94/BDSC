import prisma from '../utils/prisma.js';
import { generateSlug, validateRequired } from '../utils/validation.js';

const parseSortOrder = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getVirtualLibraryAdminData = async (req, res, next) => {
  try {
    const sections = await prisma.virtualLibrarySection.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        categories: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            videos: {
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            },
          },
        },
      },
    });

    res.json(sections);
  } catch (error) {
    next(error);
  }
};

export const createVirtualLibrarySection = async (req, res, next) => {
  try {
    const { name, sortOrder } = req.body;
    const errors = validateRequired(['name'], { name });
    if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });

    const section = await prisma.virtualLibrarySection.create({
      data: {
        name,
        slug: generateSlug(name),
        sortOrder: parseSortOrder(sortOrder),
      },
    });

    res.status(201).json(section);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una subdivisión con ese nombre' });
    next(error);
  }
};

export const updateVirtualLibrarySection = async (req, res, next) => {
  try {
    const sectionId = Number(req.params.id);
    const { name, sortOrder } = req.body;
    const data = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = generateSlug(name);
    }
    if (sortOrder !== undefined) data.sortOrder = parseSortOrder(sortOrder);

    const section = await prisma.virtualLibrarySection.update({
      where: { id: sectionId },
      data,
    });

    res.json(section);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una subdivisión con ese nombre' });
    next(error);
  }
};

export const deleteVirtualLibrarySection = async (req, res, next) => {
  try {
    const sectionId = Number(req.params.id);
    await prisma.virtualLibrarySection.delete({ where: { id: sectionId } });
    res.json({ message: 'Subdivisión eliminada' });
  } catch (error) {
    next(error);
  }
};

export const createVirtualLibraryCategory = async (req, res, next) => {
  try {
    const { sectionId, name, sortOrder } = req.body;
    const errors = validateRequired(['sectionId', 'name'], { sectionId, name });
    if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });

    const category = await prisma.virtualLibraryCategory.create({
      data: {
        sectionId: Number(sectionId),
        name,
        slug: generateSlug(name),
        sortOrder: parseSortOrder(sortOrder),
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe esa categoría en la subdivisión' });
    next(error);
  }
};

export const updateVirtualLibraryCategory = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    const { name, sortOrder } = req.body;
    const data = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = generateSlug(name);
    }
    if (sortOrder !== undefined) data.sortOrder = parseSortOrder(sortOrder);

    const category = await prisma.virtualLibraryCategory.update({
      where: { id: categoryId },
      data,
    });

    res.json(category);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe esa categoría en la subdivisión' });
    next(error);
  }
};

export const deleteVirtualLibraryCategory = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.id);
    await prisma.virtualLibraryCategory.delete({ where: { id: categoryId } });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    next(error);
  }
};

export const createVirtualLibraryVideo = async (req, res, next) => {
  try {
    const { categoryId, title, url, sortOrder } = req.body;
    const errors = validateRequired(['categoryId', 'title', 'url'], { categoryId, title, url });
    if (errors.length > 0) return res.status(400).json({ error: errors.join(', ') });

    const video = await prisma.virtualLibraryVideo.create({
      data: {
        categoryId: Number(categoryId),
        title,
        url,
        sortOrder: parseSortOrder(sortOrder),
      },
    });

    res.status(201).json(video);
  } catch (error) {
    next(error);
  }
};

export const updateVirtualLibraryVideo = async (req, res, next) => {
  try {
    const videoId = Number(req.params.id);
    const { title, url, sortOrder } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (url !== undefined) data.url = url;
    if (sortOrder !== undefined) data.sortOrder = parseSortOrder(sortOrder);

    const video = await prisma.virtualLibraryVideo.update({
      where: { id: videoId },
      data,
    });

    res.json(video);
  } catch (error) {
    next(error);
  }
};

export const deleteVirtualLibraryVideo = async (req, res, next) => {
  try {
    const videoId = Number(req.params.id);
    await prisma.virtualLibraryVideo.delete({ where: { id: videoId } });
    res.json({ message: 'Video eliminado' });
  } catch (error) {
    next(error);
  }
};
