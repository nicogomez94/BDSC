import bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';
import { validateEmail, validatePassword, validateRequired, generateSlug } from '../utils/validation.js';

// CRUD Entrenadores
export const getAllAdminTrainers = async (req, res, next) => {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        user: {
          select: {
            role: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(trainers);
  } catch (error) {
    next(error);
  }
};

export const createTrainer = async (req, res, next) => {
  try {
    const { name, type, bio, specialty, photoUrl, cvUrl, email, password } = req.body;
    const normalizedType = (type || 'ENTRENADOR').toUpperCase();
    const mappedRole = normalizedType === 'PREPARADOR_FISICO' ? 'PREPARADOR_FISICO' : 'ENTRENADOR';

    // Validar campos requeridos
    const errors = validateRequired(['name'], { name });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    if (!['ENTRENADOR', 'PREPARADOR_FISICO'].includes(normalizedType)) {
      return res.status(400).json({ error: 'Tipo de perfil inválido' });
    }

    // Validar email y password ANTES de crear el entrenador
    if (email && password) {
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está en uso' });
      }
    }

    const slug = generateSlug(name);

    const existingTrainer = await prisma.trainer.findUnique({
      where: { slug },
    });

    if (existingTrainer) {
      return res.status(409).json({ error: 'Ya existe un entrenador con ese nombre' });
    }

    // Crear el entrenador solo después de todas las validaciones
    const trainer = await prisma.trainer.create({
      data: {
        name,
        type: normalizedType,
        slug,
        bio,
        specialty,
        photoUrl,
        cvUrl,
      },
    });

    // Crear usuario si se proporcionaron credenciales
    if (email && password) {
      const passwordHash = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: mappedRole,
          trainerId: trainer.id,
        },
      });
    }

    res.status(201).json(trainer);
  } catch (error) {
    next(error);
  }
};

export const updateTrainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, bio, specialty, photoUrl, cvUrl, email, password } = req.body;
    const trainerId = parseInt(id);
    const emailInput = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const hasEmailInput = emailInput.length > 0;
    const hasPasswordInput = typeof password === 'string' && password.length > 0;

    const existingTrainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });

    if (!existingTrainer) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }

    if (hasEmailInput && !validateEmail(emailInput)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (hasPasswordInput && !validatePassword(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (hasEmailInput) {
      const emailOwner = await prisma.user.findUnique({
        where: { email: emailInput },
      });
      if (emailOwner && emailOwner.trainerId !== trainerId) {
        return res.status(409).json({ error: 'El email ya está en uso' });
      }
    }
    if (!existingTrainer.user && ((hasEmailInput && !hasPasswordInput) || (!hasEmailInput && hasPasswordInput))) {
      return res.status(400).json({ error: 'Para crear credenciales nuevas debés completar email y contraseña' });
    }

    const data = {};
    if (name) {
      data.name = name;
      data.slug = generateSlug(name);
    }
    if (type !== undefined) {
      const normalizedType = type.toUpperCase();
      if (!['ENTRENADOR', 'PREPARADOR_FISICO'].includes(normalizedType)) {
        return res.status(400).json({ error: 'Tipo de perfil inválido' });
      }
      data.type = normalizedType;
    }
    if (bio !== undefined) data.bio = bio;
    if (specialty !== undefined) data.specialty = specialty;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;
    if (cvUrl !== undefined) data.cvUrl = cvUrl;

    const trainer = await prisma.trainer.update({
      where: { id: trainerId },
      data,
    });

    const mappedRole = trainer.type === 'PREPARADOR_FISICO' ? 'PREPARADOR_FISICO' : 'ENTRENADOR';
    if (existingTrainer.user) {
      const userData = {};
      if (type !== undefined) userData.role = mappedRole;
      if (hasEmailInput) userData.email = emailInput;
      if (hasPasswordInput) userData.passwordHash = await bcrypt.hash(password, 10);

      if (Object.keys(userData).length > 0) {
        await prisma.user.update({
          where: { id: existingTrainer.user.id },
          data: userData,
        });
      }
    } else if (hasEmailInput && hasPasswordInput) {
      await prisma.user.create({
        data: {
          email: emailInput,
          passwordHash: await bcrypt.hash(password, 10),
          role: mappedRole,
          trainerId,
        },
      });
    }

    res.json(trainer);
  } catch (error) {
    next(error);
  }
};

export const deleteTrainer = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.trainer.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Entrenador eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

// Secciones
export const createSection = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const errors = validateRequired(['title', 'content'], { title, content });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    const section = await prisma.section.create({
      data: { title, content },
    });

    res.status(201).json(section);
  } catch (error) {
    next(error);
  }
};

export const getAllSections = async (req, res, next) => {
  try {
    const sections = await prisma.section.findMany({
      include: {
        sectionAccess: {
          include: {
            trainer: true,
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

export const updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const data = {};
    if (title) data.title = title;
    if (content !== undefined) data.content = content;

    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(section);
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.section.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Sección eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

// Accesos a secciones
export const grantSectionAccess = async (req, res, next) => {
  try {
    const { sectionId, trainerId } = req.body;

    const errors = validateRequired(['sectionId', 'trainerId'], { sectionId, trainerId });
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    const access = await prisma.sectionAccess.create({
      data: {
        sectionId: parseInt(sectionId),
        trainerId: parseInt(trainerId),
      },
    });

    res.status(201).json(access);
  } catch (error) {
    next(error);
  }
};

export const revokeSectionAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.sectionAccess.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Acceso revocado correctamente' });
  } catch (error) {
    next(error);
  }
};
