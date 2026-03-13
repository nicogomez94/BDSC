import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import trainerRoutes from './routes/trainers.js';
import adminRoutes from './routes/admin.js';
import trainerPrivateRoutes from './routes/trainer.js';
import virtualLibraryRoutes from './routes/virtualLibrary.js';
import siteContentRoutes from './routes/siteContent.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.resolve(__dirname, '..', 'uploads');
const isProduction = process.env.NODE_ENV === 'production';

// Required behind reverse proxies (Render, Nginx, etc.) so req.protocol resolves to https correctly.
app.set('trust proxy', 1);

// Middleware
const normalizeOrigin = (origin) => origin?.replace(/\/+$/, '');

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const isLocalDevOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or same-origin requests without Origin header.
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    if (!isProduction && isLocalDevOrigin(normalizedOrigin)) {
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
app.use('/uploads', express.static(uploadsPath));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API BDSC Hockey - Servidor funcionando' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'bdsc-hockey-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trainer', trainerPrivateRoutes);
app.use('/api/library', virtualLibraryRoutes);
app.use('/api/site-content', siteContentRoutes);

// Manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
