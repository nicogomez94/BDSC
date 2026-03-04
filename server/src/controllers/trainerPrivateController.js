import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import { validatePassword } from '../utils/validation.js';

export const getTrainerSections = async (req, res, next) => {
  try {
    if (!req.user.trainerId) {
      return res.status(403).json({ error: 'No tienes un perfil de entrenador asociado' });
    }

    const sections = await prisma.section.findMany({
      where: {
        sectionAccess: {
          some: {
            trainerId: req.user.trainerId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sections);
  } catch (error) {
    next(error);
  }
};

export const updateTrainerProfile = async (req, res, next) => {
  try {
    if (!req.user.trainerId) {
      return res.status(403).json({ error: 'No tienes un perfil de entrenador asociado' });
    }

    const { bio, specialty, photoUrl, password } = req.body;

    const data = {};
    if (bio !== undefined) data.bio = bio;
    if (specialty !== undefined) data.specialty = specialty;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;

    const trainer = await prisma.trainer.update({
      where: { id: req.user.trainerId },
      data,
    });

    // Si se proporciona nueva contraseña
    if (password) {
      if (!validatePassword(password)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash },
      });
    }

    res.json(trainer);
  } catch (error) {
    next(error);
  }
};
