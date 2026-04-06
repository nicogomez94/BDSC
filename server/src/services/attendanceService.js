import prisma from '../utils/prisma.js';

const ATTENDANCE_STATUSES = ['PRESENTE', 'AUSENTE', 'JUSTIFICADA', 'TARDE', 'SAF', 'SUSPENDIDO'];
const MIN_SEASON_MONTH = 2;
const MAX_SEASON_MONTH = 11;

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parseIntField = (value, fieldName, options = {}) => {
  const { required = true, min, max } = options;

  if (value === undefined || value === null || value === '') {
    if (!required) return undefined;
    throw createHttpError(400, `El campo ${fieldName} es requerido`);
  }

  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw createHttpError(400, `El campo ${fieldName} debe ser un número válido`);
  }

  if (min !== undefined && parsed < min) {
    throw createHttpError(400, `El campo ${fieldName} debe ser mayor o igual a ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw createHttpError(400, `El campo ${fieldName} debe ser menor o igual a ${max}`);
  }

  return parsed;
};

const parseBooleanField = (value, fieldName, options = {}) => {
  const { required = false } = options;

  if (value === undefined || value === null || value === '') {
    if (!required) return undefined;
    throw createHttpError(400, `El campo ${fieldName} es requerido`);
  }

  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw createHttpError(400, `El campo ${fieldName} debe ser booleano`);
};

const parseDateField = (value, fieldName = 'date', options = {}) => {
  const { required = true } = options;

  if (value === undefined || value === null || value === '') {
    if (!required) return undefined;
    throw createHttpError(400, `El campo ${fieldName} es requerido`);
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw createHttpError(400, `El campo ${fieldName} no tiene una fecha válida`);
    }
    return value;
  }

  const rawValue = value.toString().trim();
  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
      // Usamos mediodía UTC para evitar corrimientos de día al persistir DateTime
      // en bases configuradas con zona horaria local.
      ? new Date(`${rawValue}T12:00:00.000Z`)
      : new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `El campo ${fieldName} no tiene una fecha válida`);
  }

  return date;
};

const parseStringField = (value, fieldName, options = {}) => {
  const { required = true, maxLength } = options;

  if (value === undefined || value === null) {
    if (!required) return undefined;
    throw createHttpError(400, `El campo ${fieldName} es requerido`);
  }

  const normalized = value.toString().trim();
  if (!normalized && required) {
    throw createHttpError(400, `El campo ${fieldName} es requerido`);
  }

  if (maxLength && normalized.length > maxLength) {
    throw createHttpError(400, `El campo ${fieldName} supera el máximo de ${maxLength} caracteres`);
  }

  return normalized;
};

const normalizeOptionalText = (value, maxLength = 500) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = value.toString().trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) {
    throw createHttpError(400, `El texto supera el máximo de ${maxLength} caracteres`);
  }
  return normalized;
};

const getMonthFromDate = (date) => date.getUTCMonth() + 1;

const validateSeasonMonth = (month) => {
  if (month < MIN_SEASON_MONTH || month > MAX_SEASON_MONTH) {
    throw createHttpError(
      400,
      `La fecha debe estar entre febrero y noviembre (mes ${MIN_SEASON_MONTH} a ${MAX_SEASON_MONTH})`
    );
  }
};

const normalizeStatus = (status) => {
  const normalized = parseStringField(status, 'status').toUpperCase();
  if (!ATTENDANCE_STATUSES.includes(normalized)) {
    throw createHttpError(400, `Estado inválido. Debe ser: ${ATTENDANCE_STATUSES.join(', ')}`);
  }
  return normalized;
};

const toDivisionAccessSet = (accessRows) => new Set(accessRows.map((row) => row.divisionId));

const getTrainerDivisionAccessRows = async (user) => {
  if (!user.trainerId) {
    throw createHttpError(403, 'No tienes un perfil de entrenador asociado');
  }

  return prisma.trainerDivisionAccess.findMany({
    where: { trainerId: user.trainerId },
    select: { divisionId: true },
  });
};

const assertDivisionAccess = async (user, divisionId) => {
  if (user.role === 'COORDINADOR') return;

  const accessRows = await getTrainerDivisionAccessRows(user);
  if (accessRows.length === 0) return;

  const allowed = toDivisionAccessSet(accessRows);
  if (!allowed.has(divisionId)) {
    throw createHttpError(403, 'No tienes permisos para acceder a esta división');
  }
};

const getScopedDivisionIds = async (user, requestedDivisionId) => {
  if (user.role === 'COORDINADOR') {
    return requestedDivisionId ? [requestedDivisionId] : null;
  }

  const accessRows = await getTrainerDivisionAccessRows(user);
  if (accessRows.length === 0) {
    return requestedDivisionId ? [requestedDivisionId] : null;
  }

  const allowed = toDivisionAccessSet(accessRows);

  if (requestedDivisionId) {
    if (!allowed.has(requestedDivisionId)) {
      throw createHttpError(403, 'No tienes permisos para acceder a esta división');
    }
    return [requestedDivisionId];
  }

  return Array.from(allowed);
};

const ensureDivisionExists = async (divisionId) => {
  const division = await prisma.division.findUnique({ where: { id: divisionId } });
  if (!division) {
    throw createHttpError(404, 'División no encontrada');
  }
  return division;
};

const ensureTrainerExists = async (trainerId) => {
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId } });
  if (!trainer) {
    throw createHttpError(404, 'Entrenador no encontrado');
  }
  return trainer;
};

const buildStatusCounter = () => ({
  PRESENTE: 0,
  AUSENTE: 0,
  JUSTIFICADA: 0,
  TARDE: 0,
  SAF: 0,
  SUSPENDIDO: 0,
});

const calculateAttendancePercentage = (presente, tarde, totalSessions) => {
  if (!totalSessions) return 0;
  return Number((((presente + tarde) / totalSessions) * 100).toFixed(2));
};

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = value.toString();
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const listDivisions = async (query = {}) => {
  const seasonYear = parseIntField(query.seasonYear, 'seasonYear', { required: false, min: 2000, max: 2100 });
  const where = {};
  if (seasonYear !== undefined) where.seasonYear = seasonYear;

  return prisma.division.findMany({
    where,
    include: {
      _count: {
        select: {
          players: true,
          trainingSessions: true,
          trainerAccess: true,
        },
      },
      trainerAccess: {
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: [{ seasonYear: 'desc' }, { name: 'asc' }],
  });
};

export const createDivision = async (payload) => {
  const name = parseStringField(payload.name, 'name', { maxLength: 100 });
  const seasonYear = parseIntField(payload.seasonYear, 'seasonYear', { min: 2000, max: 2100 });

  return prisma.division.create({
    data: {
      name,
      seasonYear,
    },
  });
};

export const updateDivision = async (divisionIdValue, payload) => {
  const divisionId = parseIntField(divisionIdValue, 'id', { min: 1 });
  const data = {};

  if (payload.name !== undefined) {
    data.name = parseStringField(payload.name, 'name', { maxLength: 100 });
  }
  if (payload.seasonYear !== undefined) {
    data.seasonYear = parseIntField(payload.seasonYear, 'seasonYear', { min: 2000, max: 2100 });
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError(400, 'No hay campos para actualizar');
  }

  return prisma.division.update({
    where: { id: divisionId },
    data,
  });
};

export const deleteDivision = async (divisionIdValue) => {
  const divisionId = parseIntField(divisionIdValue, 'id', { min: 1 });

  await prisma.division.delete({
    where: { id: divisionId },
  });
};

export const listPlayers = async (query = {}) => {
  const divisionId = parseIntField(query.divisionId, 'divisionId', { required: false, min: 1 });
  const seasonYear = parseIntField(query.seasonYear, 'seasonYear', { required: false, min: 2000, max: 2100 });
  const active = parseBooleanField(query.active, 'active', { required: false });
  const where = {};

  if (divisionId !== undefined) where.divisionId = divisionId;
  if (active !== undefined) where.active = active;
  if (seasonYear !== undefined) where.division = { seasonYear };

  return prisma.player.findMany({
    where,
    include: {
      division: true,
      _count: {
        select: { attendance: true },
      },
    },
    orderBy: [{ division: { name: 'asc' } }, { fullName: 'asc' }],
  });
};

export const createPlayer = async (payload) => {
  const fullName = parseStringField(payload.fullName, 'fullName', { maxLength: 120 });
  const birthYear = parseIntField(payload.birthYear, 'birthYear', { min: 1900, max: 2100 });
  const divisionId = parseIntField(payload.divisionId, 'divisionId', { min: 1 });
  const active = parseBooleanField(payload.active, 'active', { required: false });
  const phone = payload.phone != null ? parseStringField(payload.phone, 'phone', { required: false, maxLength: 30 }) : undefined;
  const email = payload.email != null ? parseStringField(payload.email, 'email', { required: false, maxLength: 120 }) : undefined;
  const parentName = payload.parentName != null ? parseStringField(payload.parentName, 'parentName', { required: false, maxLength: 120 }) : undefined;
  const parentEmail = payload.parentEmail != null ? parseStringField(payload.parentEmail, 'parentEmail', { required: false, maxLength: 120 }) : undefined;
  const parentPhone = payload.parentPhone != null ? parseStringField(payload.parentPhone, 'parentPhone', { required: false, maxLength: 30 }) : undefined;

  await ensureDivisionExists(divisionId);

  return prisma.player.create({
    data: {
      fullName,
      birthYear,
      divisionId,
      active: active ?? true,
      phone: phone ?? null,
      email: email ?? null,
      parentName: parentName ?? null,
      parentEmail: parentEmail ?? null,
      parentPhone: parentPhone ?? null,
    },
    include: {
      division: true,
    },
  });
};

export const updatePlayer = async (playerIdValue, payload) => {
  const playerId = parseIntField(playerIdValue, 'id', { min: 1 });
  const data = {};

  if (payload.fullName !== undefined) {
    data.fullName = parseStringField(payload.fullName, 'fullName', { maxLength: 120 });
  }
  if (payload.birthYear !== undefined) {
    data.birthYear = parseIntField(payload.birthYear, 'birthYear', { min: 1900, max: 2100 });
  }
  if (payload.active !== undefined) {
    data.active = parseBooleanField(payload.active, 'active', { required: true });
  }
  if (payload.divisionId !== undefined) {
    data.divisionId = parseIntField(payload.divisionId, 'divisionId', { min: 1 });
    await ensureDivisionExists(data.divisionId);
  }
  if (payload.phone !== undefined) {
    data.phone = payload.phone ? parseStringField(payload.phone, 'phone', { maxLength: 30 }) : null;
  }
  if (payload.email !== undefined) {
    data.email = payload.email ? parseStringField(payload.email, 'email', { maxLength: 120 }) : null;
  }
  if (payload.parentName !== undefined) {
    data.parentName = payload.parentName ? parseStringField(payload.parentName, 'parentName', { maxLength: 120 }) : null;
  }
  if (payload.parentEmail !== undefined) {
    data.parentEmail = payload.parentEmail ? parseStringField(payload.parentEmail, 'parentEmail', { maxLength: 120 }) : null;
  }
  if (payload.parentPhone !== undefined) {
    data.parentPhone = payload.parentPhone ? parseStringField(payload.parentPhone, 'parentPhone', { maxLength: 30 }) : null;
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError(400, 'No hay campos para actualizar');
  }

  return prisma.player.update({
    where: { id: playerId },
    data,
    include: {
      division: true,
    },
  });
};

export const deletePlayer = async (playerIdValue) => {
  const playerId = parseIntField(playerIdValue, 'id', { min: 1 });

  await prisma.player.delete({
    where: { id: playerId },
  });
};

export const listTrainingSessions = async (query = {}, user = null) => {
  const divisionId = parseIntField(query.divisionId, 'divisionId', { required: false, min: 1 });
  const seasonYear = parseIntField(query.seasonYear, 'seasonYear', { required: false, min: 2000, max: 2100 });
  const month = parseIntField(query.month, 'month', { required: false, min: MIN_SEASON_MONTH, max: MAX_SEASON_MONTH });

  const where = {};

  if (divisionId !== undefined) {
    where.divisionId = divisionId;
  }
  if (month !== undefined) {
    where.month = month;
  }
  if (seasonYear !== undefined) {
    where.division = { seasonYear };
  }

  if (user) {
    const scopedDivisionIds = await getScopedDivisionIds(user, divisionId);
    if (scopedDivisionIds && scopedDivisionIds.length === 0) {
      return [];
    }
    if (scopedDivisionIds) {
      where.divisionId = scopedDivisionIds.length === 1 ? scopedDivisionIds[0] : { in: scopedDivisionIds };
    }
  }

  return prisma.trainingSession.findMany({
    where,
    include: {
      division: true,
      _count: {
        select: { attendance: true },
      },
    },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  });
};

export const createTrainingSession = async (payload, user) => {
  const divisionId = parseIntField(payload.divisionId, 'divisionId', { min: 1 });
  const date = parseDateField(payload.date, 'date');
  const month = getMonthFromDate(date);
  const notes = normalizeOptionalText(payload.notes, 500);

  validateSeasonMonth(month);
  await ensureDivisionExists(divisionId);
  if (user) {
    await assertDivisionAccess(user, divisionId);
  }

  return prisma.trainingSession.create({
    data: {
      divisionId,
      date,
      month,
      notes,
    },
    include: {
      division: true,
    },
  });
};

export const updateTrainingSession = async (sessionIdValue, payload, user) => {
  const sessionId = parseIntField(sessionIdValue, 'id', { min: 1 });

  const existingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
  });

  if (!existingSession) {
    throw createHttpError(404, 'Fecha de entrenamiento no encontrada');
  }

  if (user) {
    await assertDivisionAccess(user, existingSession.divisionId);
  }

  const data = {};

  if (payload.divisionId !== undefined) {
    data.divisionId = parseIntField(payload.divisionId, 'divisionId', { min: 1 });
    await ensureDivisionExists(data.divisionId);
    if (user) {
      await assertDivisionAccess(user, data.divisionId);
    }
  }

  if (payload.date !== undefined) {
    const parsedDate = parseDateField(payload.date, 'date');
    const parsedMonth = getMonthFromDate(parsedDate);
    validateSeasonMonth(parsedMonth);
    data.date = parsedDate;
    data.month = parsedMonth;
  }

  if (payload.notes !== undefined) {
    data.notes = normalizeOptionalText(payload.notes, 500);
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError(400, 'No hay campos para actualizar');
  }

  return prisma.trainingSession.update({
    where: { id: sessionId },
    data,
    include: {
      division: true,
    },
  });
};

export const deleteTrainingSession = async (sessionIdValue, user) => {
  const sessionId = parseIntField(sessionIdValue, 'id', { min: 1 });

  const existingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
  });

  if (!existingSession) {
    throw createHttpError(404, 'Fecha de entrenamiento no encontrada');
  }

  if (user) {
    await assertDivisionAccess(user, existingSession.divisionId);
  }

  await prisma.trainingSession.delete({
    where: { id: sessionId },
  });
};

export const grantTrainerDivisionAccess = async (payload) => {
  const trainerId = parseIntField(payload.trainerId, 'trainerId', { min: 1 });
  const divisionId = parseIntField(payload.divisionId, 'divisionId', { min: 1 });

  await ensureTrainerExists(trainerId);
  await ensureDivisionExists(divisionId);

  return prisma.trainerDivisionAccess.create({
    data: {
      trainerId,
      divisionId,
    },
    include: {
      trainer: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      division: true,
    },
  });
};

export const revokeTrainerDivisionAccess = async (accessIdValue) => {
  const accessId = parseIntField(accessIdValue, 'id', { min: 1 });

  await prisma.trainerDivisionAccess.delete({
    where: { id: accessId },
  });
};

export const getTrainerDivisions = async (user, query = {}) => {
  if (!user.trainerId) {
    throw createHttpError(403, 'No tienes un perfil de entrenador asociado');
  }

  const seasonYear = parseIntField(query.seasonYear, 'seasonYear', { required: false, min: 2000, max: 2100 });
  const accessRows = await getTrainerDivisionAccessRows(user);
  const where = {};

  if (accessRows.length > 0) {
    where.trainerAccess = {
      some: {
        trainerId: user.trainerId,
      },
    };
  }

  if (seasonYear !== undefined) {
    where.seasonYear = seasonYear;
  }

  return prisma.division.findMany({
    where,
    include: {
      _count: {
        select: {
          players: true,
          trainingSessions: true,
        },
      },
      trainerAccess: {
        where: {
          trainerId: user.trainerId,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ seasonYear: 'desc' }, { name: 'asc' }],
  });
};

export const getDivisionAttendanceMatrix = async (divisionIdValue, query = {}, user) => {
  const divisionId = parseIntField(divisionIdValue, 'divisionId', { min: 1 });
  const month = parseIntField(query.month, 'month', { required: false, min: MIN_SEASON_MONTH, max: MAX_SEASON_MONTH });
  const active = parseBooleanField(query.active, 'active', { required: false });

  if (user) {
    await assertDivisionAccess(user, divisionId);
  }

  const division = await prisma.division.findUnique({
    where: { id: divisionId },
  });

  if (!division) {
    throw createHttpError(404, 'División no encontrada');
  }

  const players = await prisma.player.findMany({
    where: {
      divisionId,
      ...(active === undefined ? {} : { active }),
    },
    orderBy: [{ active: 'desc' }, { fullName: 'asc' }],
  });

  const sessions = await prisma.trainingSession.findMany({
    where: {
      divisionId,
      ...(month === undefined ? {} : { month }),
    },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  });

  const sessionIds = sessions.map((session) => session.id);
  const playerIds = players.map((player) => player.id);
  const records =
    sessionIds.length === 0 || playerIds.length === 0
      ? []
      : await prisma.attendance.findMany({
          where: {
            trainingSessionId: { in: sessionIds },
            playerId: { in: playerIds },
          },
          orderBy: [{ trainingSessionId: 'asc' }, { playerId: 'asc' }],
        });

  const matrix = {};
  const totalsBySession = {};

  for (const session of sessions) {
    totalsBySession[session.id] = {
      ...buildStatusCounter(),
      totalRecords: 0,
      expectedRecords: players.length,
    };
  }

  for (const record of records) {
    if (!matrix[record.playerId]) {
      matrix[record.playerId] = {};
    }

    matrix[record.playerId][record.trainingSessionId] = {
      id: record.id,
      status: record.status,
      observation: record.observation,
      updatedAt: record.updatedAt,
    };

    if (totalsBySession[record.trainingSessionId]) {
      totalsBySession[record.trainingSessionId][record.status] += 1;
      totalsBySession[record.trainingSessionId].totalRecords += 1;
    }
  }

  return {
    division,
    filters: {
      month: month ?? null,
      active: active ?? null,
    },
    players,
    sessions,
    records,
    matrix,
    totalsBySession,
  };
};

export const upsertAttendanceBulk = async (payload, user) => {
  const trainingSessionId = parseIntField(payload.trainingSessionId, 'trainingSessionId', { min: 1 });
  if (!Array.isArray(payload.entries) || payload.entries.length === 0) {
    throw createHttpError(400, 'El campo entries debe ser un array con al menos un registro');
  }

  const session = await prisma.trainingSession.findUnique({
    where: { id: trainingSessionId },
  });

  if (!session) {
    throw createHttpError(404, 'Fecha de entrenamiento no encontrada');
  }

  await assertDivisionAccess(user, session.divisionId);

  const normalizedMap = new Map();
  for (const entry of payload.entries) {
    const playerId = parseIntField(entry.playerId, 'playerId', { min: 1 });
    const status = normalizeStatus(entry.status);
    const observation = normalizeOptionalText(entry.observation, 500);
    normalizedMap.set(playerId, { playerId, status, observation });
  }

  const normalizedEntries = Array.from(normalizedMap.values());
  const playerIds = normalizedEntries.map((entry) => entry.playerId);

  const players = await prisma.player.findMany({
    where: {
      id: { in: playerIds },
      divisionId: session.divisionId,
    },
    select: { id: true },
  });

  if (players.length !== playerIds.length) {
    throw createHttpError(
      400,
      'Todas las jugadoras deben pertenecer a la misma división de la fecha de entrenamiento'
    );
  }

  const existingRecords = await prisma.attendance.findMany({
    where: {
      trainingSessionId,
      playerId: { in: playerIds },
    },
    select: {
      id: true,
      playerId: true,
    },
  });

  const existingByPlayerId = new Map(existingRecords.map((record) => [record.playerId, record.id]));

  await prisma.$transaction(
    normalizedEntries.map((entry) => {
      const existingId = existingByPlayerId.get(entry.playerId);
      if (existingId) {
        return prisma.attendance.update({
          where: { id: existingId },
          data: {
            status: entry.status,
            observation: entry.observation,
          },
        });
      }

      return prisma.attendance.create({
        data: {
          playerId: entry.playerId,
          trainingSessionId,
          status: entry.status,
          observation: entry.observation,
          createdByUserId: user.id,
        },
      });
    })
  );

  const records = await prisma.attendance.findMany({
    where: {
      trainingSessionId,
      playerId: { in: playerIds },
    },
    include: {
      player: true,
      trainingSession: true,
    },
    orderBy: [{ player: { fullName: 'asc' } }],
  });

  return {
    trainingSessionId,
    totalUpdated: records.length,
    records,
  };
};

export const updateAttendanceById = async (attendanceIdValue, payload, user) => {
  const attendanceId = parseIntField(attendanceIdValue, 'id', { min: 1 });

  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: {
      player: true,
      trainingSession: true,
    },
  });

  if (!attendance) {
    throw createHttpError(404, 'Registro de asistencia no encontrado');
  }

  await assertDivisionAccess(user, attendance.trainingSession.divisionId);

  const data = {};
  if (payload.status !== undefined) {
    data.status = normalizeStatus(payload.status);
  }
  if (payload.observation !== undefined) {
    data.observation = normalizeOptionalText(payload.observation, 500);
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError(400, 'No hay campos para actualizar');
  }

  return prisma.attendance.update({
    where: { id: attendanceId },
    data,
    include: {
      player: true,
      trainingSession: {
        include: {
          division: true,
        },
      },
    },
  });
};

export const getAttendanceReport = async (query = {}, user) => {
  const divisionId = parseIntField(query.divisionId, 'divisionId', { required: false, min: 1 });
  const seasonYear = parseIntField(query.seasonYear, 'seasonYear', { required: false, min: 2000, max: 2100 });
  const month = parseIntField(query.month, 'month', { required: false, min: MIN_SEASON_MONTH, max: MAX_SEASON_MONTH });
  const playerId = parseIntField(query.playerId, 'playerId', { required: false, min: 1 });
  const active = parseBooleanField(query.active, 'active', { required: false });

  const scopedDivisionIds = await getScopedDivisionIds(user, divisionId);
  if (scopedDivisionIds && scopedDivisionIds.length === 0) {
    return {
      filters: {
        divisionId: divisionId ?? null,
        seasonYear: seasonYear ?? null,
        month: month ?? null,
        playerId: playerId ?? null,
        active: active ?? null,
      },
      summary: {
        totalDivisions: 0,
        totalPlayers: 0,
        totalSessions: 0,
        totalRecords: 0,
        totals: buildStatusCounter(),
      },
      byDivision: [],
      byPlayer: [],
      byMonth: [],
      totalsByDate: [],
      ranking: [],
    };
  }

  const divisions = await prisma.division.findMany({
    where: {
      ...(seasonYear === undefined ? {} : { seasonYear }),
      ...(scopedDivisionIds === null
        ? {}
        : scopedDivisionIds.length === 1
          ? { id: scopedDivisionIds[0] }
          : { id: { in: scopedDivisionIds } }),
    },
    include: {
      players: {
        where: {
          ...(playerId === undefined ? {} : { id: playerId }),
          ...(active === undefined ? {} : { active }),
        },
        orderBy: [{ fullName: 'asc' }],
      },
    },
    orderBy: [{ seasonYear: 'desc' }, { name: 'asc' }],
  });

  if (divisionId && divisions.length === 0) {
    throw createHttpError(404, 'División no encontrada');
  }

  const divisionIds = divisions.map((division) => division.id);
  if (divisionIds.length === 0) {
    return {
      filters: {
        divisionId: divisionId ?? null,
        seasonYear: seasonYear ?? null,
        month: month ?? null,
        playerId: playerId ?? null,
        active: active ?? null,
      },
      summary: {
        totalDivisions: 0,
        totalPlayers: 0,
        totalSessions: 0,
        totalRecords: 0,
        totals: buildStatusCounter(),
      },
      byDivision: [],
      byPlayer: [],
      byMonth: [],
      totalsByDate: [],
      ranking: [],
    };
  }

  const sessions = await prisma.trainingSession.findMany({
    where: {
      divisionId: { in: divisionIds },
      ...(month === undefined ? {} : { month }),
    },
    include: {
      division: true,
    },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  });

  const sessionIds = sessions.map((session) => session.id);
  const records =
    sessionIds.length === 0
      ? []
      : await prisma.attendance.findMany({
          where: {
            trainingSessionId: { in: sessionIds },
            ...(playerId === undefined ? {} : { playerId }),
          },
          include: {
            player: true,
            trainingSession: {
              include: {
                division: true,
              },
            },
          },
          orderBy: [{ trainingSessionId: 'asc' }, { playerId: 'asc' }],
        });

  const divisionStatsMap = new Map();
  const playerStatsMap = new Map();
  const monthStatsMap = new Map();
  const dateStatsMap = new Map();
  const sessionsPerDivision = new Map();
  const playersPerDivision = new Map();

  for (const division of divisions) {
    playersPerDivision.set(division.id, division.players.length);
    divisionStatsMap.set(division.id, {
      divisionId: division.id,
      divisionName: division.name,
      seasonYear: division.seasonYear,
      totalPlayers: division.players.length,
      totalSessions: 0,
      totalRecords: 0,
      pending: 0,
      totals: buildStatusCounter(),
    });

    for (const player of division.players) {
      playerStatsMap.set(player.id, {
        playerId: player.id,
        fullName: player.fullName,
        birthYear: player.birthYear,
        active: player.active,
        divisionId: division.id,
        divisionName: division.name,
        seasonYear: division.seasonYear,
        PRESENTE: 0,
        AUSENTE: 0,
        JUSTIFICADA: 0,
        TARDE: 0,
        SAF: 0,
        SUSPENDIDO: 0,
        totalRecords: 0,
        totalSessions: 0,
        attendancePercentage: 0,
      });
    }
  }

  for (const session of sessions) {
    sessionsPerDivision.set(session.divisionId, (sessionsPerDivision.get(session.divisionId) ?? 0) + 1);

    dateStatsMap.set(session.id, {
      trainingSessionId: session.id,
      date: session.date,
      month: session.month,
      divisionId: session.divisionId,
      divisionName: session.division.name,
      seasonYear: session.division.seasonYear,
      totalRecords: 0,
      expectedRecords: playersPerDivision.get(session.divisionId) ?? 0,
      pending: 0,
      totals: buildStatusCounter(),
    });
  }

  for (const [divisionScopedId, divisionStat] of divisionStatsMap.entries()) {
    const totalSessions = sessionsPerDivision.get(divisionScopedId) ?? 0;
    divisionStat.totalSessions = totalSessions;
    divisionStat.pending = divisionStat.totalPlayers * totalSessions;
  }

  for (const playerStat of playerStatsMap.values()) {
    playerStat.totalSessions = sessionsPerDivision.get(playerStat.divisionId) ?? 0;
  }

  const summaryTotals = buildStatusCounter();

  for (const record of records) {
    const playerStat = playerStatsMap.get(record.playerId);
    const divisionStat = divisionStatsMap.get(record.trainingSession.divisionId);
    const dateStat = dateStatsMap.get(record.trainingSessionId);

    if (playerStat) {
      playerStat[record.status] += 1;
      playerStat.totalRecords += 1;
    }

    if (divisionStat) {
      divisionStat.totals[record.status] += 1;
      divisionStat.totalRecords += 1;
      divisionStat.pending = Math.max(divisionStat.pending - 1, 0);
    }

    if (dateStat) {
      dateStat.totals[record.status] += 1;
      dateStat.totalRecords += 1;
      dateStat.pending = Math.max(dateStat.expectedRecords - dateStat.totalRecords, 0);
    }

    const monthEntry = monthStatsMap.get(record.trainingSession.month) ?? {
      month: record.trainingSession.month,
      totalRecords: 0,
      totals: buildStatusCounter(),
    };

    monthEntry.totals[record.status] += 1;
    monthEntry.totalRecords += 1;
    monthStatsMap.set(record.trainingSession.month, monthEntry);

    summaryTotals[record.status] += 1;
  }

  const byPlayer = Array.from(playerStatsMap.values()).map((player) => ({
    ...player,
    attendancePercentage: calculateAttendancePercentage(player.PRESENTE, player.TARDE, player.totalSessions),
  }));

  const ranking = Array.from(divisionStatsMap.values()).map((division) => {
    const players = byPlayer
      .filter((player) => player.divisionId === division.divisionId)
      .sort((a, b) => {
        if (b.attendancePercentage !== a.attendancePercentage) {
          return b.attendancePercentage - a.attendancePercentage;
        }
        if (b.PRESENTE !== a.PRESENTE) {
          return b.PRESENTE - a.PRESENTE;
        }
        return a.fullName.localeCompare(b.fullName);
      })
      .map((player, index) => ({
        ...player,
        position: index + 1,
      }));

    return {
      divisionId: division.divisionId,
      divisionName: division.divisionName,
      seasonYear: division.seasonYear,
      players,
    };
  });

  return {
    filters: {
      divisionId: divisionId ?? null,
      seasonYear: seasonYear ?? null,
      month: month ?? null,
      playerId: playerId ?? null,
      active: active ?? null,
    },
    summary: {
      totalDivisions: divisionStatsMap.size,
      totalPlayers: byPlayer.length,
      totalSessions: sessions.length,
      totalRecords: records.length,
      totals: summaryTotals,
    },
    byDivision: Array.from(divisionStatsMap.values()),
    byPlayer: byPlayer.sort((a, b) => a.fullName.localeCompare(b.fullName)),
    byMonth: Array.from(monthStatsMap.values()).sort((a, b) => a.month - b.month),
    totalsByDate: Array.from(dateStatsMap.values()).sort((a, b) => a.date - b.date),
    ranking,
  };
};

export const buildAttendanceCsvExport = async (query = {}, user) => {
  const report = await getAttendanceReport(query, user);
  const rows = [];

  rows.push(
    [
      'Division',
      'Temporada',
      'Jugadora',
      'Activa',
      'Sesiones',
      'Presente',
      'Tarde',
      'Justificada',
      'Ausente',
      'SAF',
      'Suspendido',
      'Registros',
      'Asistencia(%)',
    ].join(',')
  );

  for (const divisionRanking of report.ranking) {
    for (const player of divisionRanking.players) {
      rows.push(
        [
          escapeCsv(divisionRanking.divisionName),
          divisionRanking.seasonYear,
          escapeCsv(player.fullName),
          player.active ? 'SI' : 'NO',
          player.totalSessions,
          player.PRESENTE,
          player.TARDE,
          player.JUSTIFICADA,
          player.AUSENTE,
          player.SAF,
          player.SUSPENDIDO,
          player.totalRecords,
          player.attendancePercentage,
        ].join(',')
      );
    }
  }

  const dateSuffix = new Date().toISOString().slice(0, 10);
  const divisionSuffix = query.divisionId ? `division_${query.divisionId}` : 'todas_divisiones';
  const monthSuffix = query.month ? `mes_${query.month}` : 'todos_los_meses';

  return {
    filename: `asistencia_${divisionSuffix}_${monthSuffix}_${dateSuffix}.csv`,
    csv: rows.join('\n'),
    report,
  };
};

export const importInitialAttendanceRows = async (payload, user) => {
  const divisionId = parseIntField(payload.divisionId, 'divisionId', { min: 1 });
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
    throw createHttpError(400, 'El campo rows debe ser un array con al menos un registro');
  }

  await assertDivisionAccess(user, divisionId);
  await ensureDivisionExists(divisionId);

  let createdPlayers = 0;
  let createdSessions = 0;
  let upsertedAttendances = 0;
  const createdSessionIds = new Set();

  for (const row of payload.rows) {
    const fullName = parseStringField(row.fullName, 'fullName', { maxLength: 120 });
    const birthYear = parseIntField(row.birthYear, 'birthYear', { min: 1900, max: 2100 });
    const date = parseDateField(row.date, 'date');
    const month = getMonthFromDate(date);
    const status = normalizeStatus(row.status);
    const observation = normalizeOptionalText(row.observation, 500);
    const notes = normalizeOptionalText(row.notes, 500);
    const active = parseBooleanField(row.active, 'active', { required: false });

    validateSeasonMonth(month);

    let player = await prisma.player.findFirst({
      where: {
        divisionId,
        fullName,
      },
    });

    if (!player) {
      player = await prisma.player.create({
        data: {
          divisionId,
          fullName,
          birthYear,
          active: active ?? true,
        },
      });
      createdPlayers += 1;
    }

    const existingSession = await prisma.trainingSession.findUnique({
      where: {
        divisionId_date: {
          divisionId,
          date,
        },
      },
      select: { id: true },
    });

    const session = await prisma.trainingSession.upsert({
      where: {
        divisionId_date: {
          divisionId,
          date,
        },
      },
      update: {
        notes,
      },
      create: {
        divisionId,
        date,
        month,
        notes,
      },
    });

    if (!existingSession && !createdSessionIds.has(session.id)) {
      createdSessionIds.add(session.id);
      createdSessions += 1;
    }

    await prisma.attendance.upsert({
      where: {
        playerId_trainingSessionId: {
          playerId: player.id,
          trainingSessionId: session.id,
        },
      },
      update: {
        status,
        observation,
      },
      create: {
        playerId: player.id,
        trainingSessionId: session.id,
        status,
        observation,
        createdByUserId: user.id,
      },
    });

    upsertedAttendances += 1;
  }

  return {
    divisionId,
    totalRows: payload.rows.length,
    createdPlayers,
    createdSessions,
    upsertedAttendances,
  };
};
