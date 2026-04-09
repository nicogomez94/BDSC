import {
  getTrainerDivisions,
  listTrainingSessions,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  getDivisionAttendanceMatrix,
  upsertAttendanceBulk,
  updateAttendanceById,
  buildAttendanceCsvExport,
} from '../services/attendanceService.js';

export const getTrainerDivisionsHandler = async (req, res, next) => {
  try {
    const divisions = await getTrainerDivisions(req.user, req.query);
    res.json(divisions);
  } catch (error) {
    next(error);
  }
};

export const getTrainerDivisionTrainingSessionsHandler = async (req, res, next) => {
  try {
    const sessions = await listTrainingSessions(
      { ...req.query, divisionId: req.params.divisionId },
      req.user
    );
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const updateTrainerTrainingSessionHandler = async (req, res, next) => {
  try {
    const session = await updateTrainingSession(req.params.id, req.body, req.user);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const createTrainerTrainingSessionHandler = async (req, res, next) => {
  try {
    const session = await createTrainingSession(req.body, req.user);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const deleteTrainerTrainingSessionHandler = async (req, res, next) => {
  try {
    await deleteTrainingSession(req.params.id, req.user);
    res.json({ message: 'Fecha de entrenamiento eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

export const getTrainerDivisionAttendanceHandler = async (req, res, next) => {
  try {
    const matrix = await getDivisionAttendanceMatrix(req.params.divisionId, req.query, req.user);
    res.json(matrix);
  } catch (error) {
    next(error);
  }
};

export const upsertTrainerAttendanceBulkHandler = async (req, res, next) => {
  try {
    const result = await upsertAttendanceBulk(req.body, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateTrainerAttendanceHandler = async (req, res, next) => {
  try {
    const attendance = await updateAttendanceById(req.params.id, req.body, req.user);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

export const exportTrainerAttendanceHandler = async (req, res, next) => {
  try {
    const { filename, csv } = await buildAttendanceCsvExport(req.query, req.user);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
