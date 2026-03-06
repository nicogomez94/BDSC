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
import {
  getDivisions,
  createDivisionHandler,
  updateDivisionHandler,
  deleteDivisionHandler,
  getPlayers,
  createPlayerHandler,
  updatePlayerHandler,
  deletePlayerHandler,
  getTrainingSessions,
  createTrainingSessionHandler,
  updateTrainingSessionHandler,
  deleteTrainingSessionHandler,
  getAttendanceDivisionMatrix,
  getAttendanceReportHandler,
  upsertAttendanceBulkHandler,
  updateAttendanceHandler,
  grantTrainerDivisionAccessHandler,
  revokeTrainerDivisionAccessHandler,
  exportAttendanceHandler,
  importInitialAttendanceHandler,
} from '../controllers/adminAttendanceController.js';

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

// Divisiones
router.get('/divisions', getDivisions);
router.post('/divisions', createDivisionHandler);
router.put('/divisions/:id', updateDivisionHandler);
router.delete('/divisions/:id', deleteDivisionHandler);

// Jugadoras
router.get('/players', getPlayers);
router.post('/players', createPlayerHandler);
router.put('/players/:id', updatePlayerHandler);
router.delete('/players/:id', deletePlayerHandler);

// Fechas de entrenamiento
router.get('/training-sessions', getTrainingSessions);
router.post('/training-sessions', createTrainingSessionHandler);
router.put('/training-sessions/:id', updateTrainingSessionHandler);
router.delete('/training-sessions/:id', deleteTrainingSessionHandler);

// Asistencia y reportes
router.get('/attendance', getAttendanceDivisionMatrix);
router.get('/attendance/report', getAttendanceReportHandler);
router.get('/attendance/export', exportAttendanceHandler);
router.post('/attendance/bulk', upsertAttendanceBulkHandler);
router.put('/attendance/:id', updateAttendanceHandler);
router.post('/attendance/import', importInitialAttendanceHandler);

// Accesos de entrenadores por división
router.post('/trainer-division-access', grantTrainerDivisionAccessHandler);
router.delete('/trainer-division-access/:id', revokeTrainerDivisionAccessHandler);

export default router;
