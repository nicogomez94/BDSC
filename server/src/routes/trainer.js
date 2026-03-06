import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getTrainerSections, updateTrainerProfile } from '../controllers/trainerPrivateController.js';
import {
  getTrainerDivisionsHandler,
  getTrainerDivisionTrainingSessionsHandler,
  getTrainerDivisionAttendanceHandler,
  upsertTrainerAttendanceBulkHandler,
  updateTrainerAttendanceHandler,
} from '../controllers/trainerAttendanceController.js';

const router = express.Router();

// Proteger todas las rutas de entrenador
router.use(authenticate);
router.use(requireRole('ENTRENADOR'));

router.get('/sections', getTrainerSections);
router.put('/profile', updateTrainerProfile);
router.get('/divisions', getTrainerDivisionsHandler);
router.get('/divisions/:divisionId/training-sessions', getTrainerDivisionTrainingSessionsHandler);
router.get('/divisions/:divisionId/attendance', getTrainerDivisionAttendanceHandler);
router.post('/attendance/bulk', upsertTrainerAttendanceBulkHandler);
router.put('/attendance/:id', updateTrainerAttendanceHandler);

export default router;
