import {
  getTrainerDivisions,
  listTrainingSessions,
  getDivisionAttendanceMatrix,
  upsertAttendanceBulk,
  updateAttendanceById,
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
