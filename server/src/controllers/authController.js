import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[auth] ${req.method} ${req.originalUrl} - start`, { email });

    if (!validateEmail(email)) {
      console.warn(`[auth] ${req.method} ${req.originalUrl} - invalid email format`, { email });
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!password) {
      console.warn(`[auth] ${req.method} ${req.originalUrl} - missing password`, { email });
      return res.status(400).json({ error: 'Contraseña requerida' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { trainer: true },
    });

    if (!user) {
      console.warn(`[auth] ${req.method} ${req.originalUrl} - user not found`, { email });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      console.warn(`[auth] ${req.method} ${req.originalUrl} - invalid password`, { email, userId: user.id });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...userWithoutPassword } = user;
    console.log(`[auth] ${req.method} ${req.originalUrl} - ok`, { userId: user.id, role: user.role });

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(`[auth] ${req.method} ${req.originalUrl} - error`, {
      email: req.body?.email,
      message: error.message,
      code: error.code,
      name: error.name,
    });
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    console.log(`[auth] ${req.method} ${req.originalUrl} - start`, { userId: req.user?.id });
    const { passwordHash, ...userWithoutPassword } = req.user;
    console.log(`[auth] ${req.method} ${req.originalUrl} - ok`, { userId: userWithoutPassword.id });
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(`[auth] ${req.method} ${req.originalUrl} - error`, {
      userId: req.user?.id,
      message: error.message,
      code: error.code,
      name: error.name,
    });
    next(error);
  }
};
