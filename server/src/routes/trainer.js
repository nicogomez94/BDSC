import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getTrainerSections, updateTrainerProfile } from '../controllers/trainerPrivateController.js';

const router = express.Router();

// Proteger todas las rutas de entrenador
router.use(authenticate);
router.use(requireRole('ENTRENADOR'));

router.get('/sections', getTrainerSections);
router.put('/profile', updateTrainerProfile);

export default router;
