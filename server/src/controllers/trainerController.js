import prisma from '../utils/prisma.js';

export const getAllTrainers = async (req, res, next) => {
  try {
    const trainers = await prisma.trainer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(trainers);
  } catch (error) {
    next(error);
  }
};

export const getTrainerBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const trainer = await prisma.trainer.findUnique({
      where: { slug },
    });

    if (!trainer) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }

    res.json(trainer);
  } catch (error) {
    next(error);
  }
};
