import prisma from '../utils/prisma.js';

export const getAllTrainers = async (req, res, next) => {
  try {
    console.log(`[trainers] ${req.method} ${req.originalUrl} - start`);
    const trainers = await prisma.trainer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log(`[trainers] ${req.method} ${req.originalUrl} - ok (${trainers.length} results)`);

    res.json(trainers);
  } catch (error) {
    console.error(`[trainers] ${req.method} ${req.originalUrl} - error`, {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    next(error);
  }
};

export const getTrainerBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    console.log(`[trainers] ${req.method} ${req.originalUrl} - start`, { slug });

    const trainer = await prisma.trainer.findUnique({
      where: { slug },
    });

    if (!trainer) {
      console.warn(`[trainers] ${req.method} ${req.originalUrl} - not found`, { slug });
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }
    console.log(`[trainers] ${req.method} ${req.originalUrl} - ok`, { id: trainer.id, slug: trainer.slug });

    res.json(trainer);
  } catch (error) {
    console.error(`[trainers] ${req.method} ${req.originalUrl} - error`, {
      slug: req.params?.slug,
      message: error.message,
      code: error.code,
      name: error.name,
    });
    next(error);
  }
};
