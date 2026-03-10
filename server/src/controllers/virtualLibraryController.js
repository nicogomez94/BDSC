import prisma from '../utils/prisma.js';

export const getVirtualLibraryMenu = async (req, res, next) => {
  try {
    const sections = await prisma.virtualLibrarySection.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        categories: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    res.json(sections);
  } catch (error) {
    next(error);
  }
};

export const getVirtualLibraryCategoryPage = async (req, res, next) => {
  try {
    const { sectionSlug, categorySlug } = req.params;

    const section = await prisma.virtualLibrarySection.findUnique({
      where: { slug: sectionSlug },
      include: {
        categories: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!section) {
      return res.status(404).json({ error: 'Subdivisión no encontrada' });
    }

    const category = await prisma.virtualLibraryCategory.findFirst({
      where: {
        sectionId: section.id,
        slug: categorySlug,
      },
      include: {
        videos: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({
      section: {
        id: section.id,
        name: section.name,
        slug: section.slug,
      },
      category,
      categories: section.categories,
    });
  } catch (error) {
    next(error);
  }
};
