import {
  listDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  listPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  listTrainingSessions,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  grantTrainerDivisionAccess,
  revokeTrainerDivisionAccess,
  getDivisionAttendanceMatrix,
  upsertAttendanceBulk,
  updateAttendanceById,
  getAttendanceReport,
  buildAttendanceCsvExport,
  importInitialAttendanceRows,
} from '../services/attendanceService.js';

export const getDivisions = async (req, res, next) => {
  try {
    const divisions = await listDivisions(req.query);
    res.json(divisions);
  } catch (error) {
    next(error);
  }
};

export const createDivisionHandler = async (req, res, next) => {
  try {
    const division = await createDivision(req.body);
    res.status(201).json(division);
  } catch (error) {
    next(error);
  }
};

export const updateDivisionHandler = async (req, res, next) => {
  try {
    const division = await updateDivision(req.params.id, req.body);
    res.json(division);
  } catch (error) {
    next(error);
  }
};

export const deleteDivisionHandler = async (req, res, next) => {
  try {
    await deleteDivision(req.params.id);
    res.json({ message: 'División eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

export const getPlayers = async (req, res, next) => {
  try {
    const players = await listPlayers(req.query);
    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const createPlayerHandler = async (req, res, next) => {
  try {
    const player = await createPlayer(req.body);
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
};

export const updatePlayerHandler = async (req, res, next) => {
  try {
    const player = await updatePlayer(req.params.id, req.body);
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const deletePlayerHandler = async (req, res, next) => {
  try {
    await deletePlayer(req.params.id);
    res.json({ message: 'Jugadora eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

export const getTrainingSessions = async (req, res, next) => {
  try {
    const sessions = await listTrainingSessions(req.query, req.user);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const createTrainingSessionHandler = async (req, res, next) => {
  try {
    const session = await createTrainingSession(req.body, req.user);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const updateTrainingSessionHandler = async (req, res, next) => {
  try {
    const session = await updateTrainingSession(req.params.id, req.body, req.user);
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const deleteTrainingSessionHandler = async (req, res, next) => {
  try {
    await deleteTrainingSession(req.params.id, req.user);
    res.json({ message: 'Fecha de entrenamiento eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceDivisionMatrix = async (req, res, next) => {
  try {
    const divisionId = req.query.divisionId;
    if (!divisionId) {
      return res.status(400).json({ error: 'divisionId es requerido' });
    }

    const matrix = await getDivisionAttendanceMatrix(divisionId, req.query, req.user);
    res.json(matrix);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceReportHandler = async (req, res, next) => {
  try {
    const report = await getAttendanceReport(req.query, req.user);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const upsertAttendanceBulkHandler = async (req, res, next) => {
  try {
    const result = await upsertAttendanceBulk(req.body, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAttendanceHandler = async (req, res, next) => {
  try {
    const attendance = await updateAttendanceById(req.params.id, req.body, req.user);
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

export const grantTrainerDivisionAccessHandler = async (req, res, next) => {
  try {
    const access = await grantTrainerDivisionAccess(req.body);
    res.status(201).json(access);
  } catch (error) {
    next(error);
  }
};

export const revokeTrainerDivisionAccessHandler = async (req, res, next) => {
  try {
    await revokeTrainerDivisionAccess(req.params.id);
    res.json({ message: 'Acceso de división revocado correctamente' });
  } catch (error) {
    next(error);
  }
};

export const exportAttendanceHandler = async (req, res, next) => {
  try {
    const { filename, csv } = await buildAttendanceCsvExport(req.query, req.user);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const importInitialAttendanceHandler = async (req, res, next) => {
  try {
    const result = await importInitialAttendanceRows(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
