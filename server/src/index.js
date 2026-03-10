import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import trainerRoutes from './routes/trainers.js';
import adminRoutes from './routes/admin.js';
import trainerPrivateRoutes from './routes/trainer.js';
import virtualLibraryRoutes from './routes/virtualLibrary.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const normalizeOrigin = (origin) => origin?.replace(/\/+$/, '');

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map(normalizeOrigin)
  : ['http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or same-origin requests without Origin header.
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn('[cors] blocked origin', { origin });
    return callback(new Error('CORS origin no permitido'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API BDSC Hockey - Servidor funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trainer', trainerPrivateRoutes);
app.use('/api/library', virtualLibraryRoutes);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
