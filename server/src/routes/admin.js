import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createTrainer,
  updateTrainer,
  deleteTrainer,
  createSection,
  getAllSections,
  updateSection,
  deleteSection,
  grantSectionAccess,
  revokeSectionAccess,
} from '../controllers/adminController.js';

const router = express.Router();

// Proteger todas las rutas admin
router.use(authenticate);
router.use(requireRole('COORDINADOR'));

// Entrenadores
router.post('/trainers', createTrainer);
router.put('/trainers/:id', updateTrainer);
router.delete('/trainers/:id', deleteTrainer);

// Secciones
router.post('/sections', createSection);
router.get('/sections', getAllSections);
router.put('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

// Accesos
router.post('/section-access', grantSectionAccess);
router.delete('/section-access/:id', revokeSectionAccess);

export default router;
