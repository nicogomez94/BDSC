const resolveApiUrl = (value) => {
  const fallback = '/api';
  const raw = (value || fallback).trim();

  if (!raw) return fallback;

  if (raw.startsWith('/')) {
    return raw.replace(/\/+$/, '') || fallback;
  }

  try {
    const parsed = new URL(raw);
    parsed.pathname = parsed.pathname === '/' ? '/api' : parsed.pathname.replace(/\/+$/, '');
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return raw.replace(/\/+$/, '');
  }
};

const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL);

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const parseErrorResponse = async (response, fallbackMessage) => {
  try {
    const error = await response.json();
    throw new Error(error.error || fallbackMessage);
  } catch (parseError) {
    if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
      throw parseError;
    }
    throw new Error(fallbackMessage);
  }
};

const requestJson = async (url, options = {}, fallbackMessage = 'Error en la solicitud') => {
  const response = await fetch(url, options);

  if (!response.ok) {
    await parseErrorResponse(response, fallbackMessage);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  login: async (email, password) => {
    return requestJson(
      `${API_URL}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      'Error al iniciar sesión'
    );
  },

  getMe: async () => {
    return requestJson(
      `${API_URL}/auth/me`,
      {
        headers: getAuthHeader(),
      },
      'No autorizado'
    );
  },

  getTrainers: async () => {
    return requestJson(`${API_URL}/trainers`, {}, 'Error al obtener entrenadores');
  },

  getTrainerBySlug: async (slug) => {
    return requestJson(`${API_URL}/trainers/${slug}`, {}, 'Entrenador no encontrado');
  },

  admin: {
    createTrainer: async (data) => {
      return requestJson(
        `${API_URL}/admin/trainers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear entrenador'
      );
    },

    updateTrainer: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/trainers/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar entrenador'
      );
    },

    deleteTrainer: async (id) => {
      return requestJson(
        `${API_URL}/admin/trainers/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar entrenador'
      );
    },

    createSection: async (data) => {
      return requestJson(
        `${API_URL}/admin/sections`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear sección'
      );
    },

    getSections: async () => {
      return requestJson(
        `${API_URL}/admin/sections`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener secciones'
      );
    },

    updateSection: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/sections/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar sección'
      );
    },

    deleteSection: async (id) => {
      return requestJson(
        `${API_URL}/admin/sections/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar sección'
      );
    },

    grantAccess: async (sectionId, trainerId) => {
      return requestJson(
        `${API_URL}/admin/section-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({ sectionId, trainerId }),
        },
        'Error al otorgar acceso'
      );
    },

    revokeAccess: async (accessId) => {
      return requestJson(
        `${API_URL}/admin/section-access/${accessId}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al revocar acceso'
      );
    },

    getDivisions: async (filters = {}) => {
      return requestJson(
        `${API_URL}/admin/divisions${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener divisiones'
      );
    },

    createDivision: async (data) => {
      return requestJson(
        `${API_URL}/admin/divisions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear división'
      );
    },

    updateDivision: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/divisions/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar división'
      );
    },

    deleteDivision: async (id) => {
      return requestJson(
        `${API_URL}/admin/divisions/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar división'
      );
    },

    getPlayers: async (filters = {}) => {
      return requestJson(
        `${API_URL}/admin/players${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener jugadoras'
      );
    },

    createPlayer: async (data) => {
      return requestJson(
        `${API_URL}/admin/players`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear jugadora'
      );
    },

    updatePlayer: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/players/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar jugadora'
      );
    },

    deletePlayer: async (id) => {
      return requestJson(
        `${API_URL}/admin/players/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar jugadora'
      );
    },

    getTrainingSessions: async (filters = {}) => {
      return requestJson(
        `${API_URL}/admin/training-sessions${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener fechas de entrenamiento'
      );
    },

    createTrainingSession: async (data) => {
      return requestJson(
        `${API_URL}/admin/training-sessions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear fecha de entrenamiento'
      );
    },

    updateTrainingSession: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/training-sessions/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar fecha de entrenamiento'
      );
    },

    deleteTrainingSession: async (id) => {
      return requestJson(
        `${API_URL}/admin/training-sessions/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar fecha de entrenamiento'
      );
    },

    getAttendanceMatrix: async (filters = {}) => {
      return requestJson(
        `${API_URL}/admin/attendance${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener asistencia'
      );
    },

    getAttendanceReport: async (filters = {}) => {
      return requestJson(
        `${API_URL}/admin/attendance/report${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener reporte de asistencia'
      );
    },

    bulkUpsertAttendance: async (data) => {
      return requestJson(
        `${API_URL}/admin/attendance/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al guardar asistencia'
      );
    },

    updateAttendance: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/attendance/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar asistencia'
      );
    },

    grantTrainerDivisionAccess: async (data) => {
      return requestJson(
        `${API_URL}/admin/trainer-division-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al otorgar acceso de división'
      );
    },

    revokeTrainerDivisionAccess: async (id) => {
      return requestJson(
        `${API_URL}/admin/trainer-division-access/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al revocar acceso de división'
      );
    },

    exportAttendance: async (filters = {}) => {
      const response = await fetch(`${API_URL}/admin/attendance/export${buildQueryString(filters)}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        await parseErrorResponse(response, 'Error al exportar asistencia');
      }

      const contentDisposition = response.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const filename = filenameMatch ? filenameMatch[1] : 'asistencia.csv';
      const blob = await response.blob();

      return { filename, blob };
    },

    importAttendanceRows: async (data) => {
      return requestJson(
        `${API_URL}/admin/attendance/import`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al importar asistencia'
      );
    },
  },

  trainer: {
    getSections: async () => {
      return requestJson(
        `${API_URL}/trainer/sections`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener secciones'
      );
    },

    updateProfile: async (data) => {
      return requestJson(
        `${API_URL}/trainer/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar perfil'
      );
    },

    getDivisions: async (filters = {}) => {
      return requestJson(
        `${API_URL}/trainer/divisions${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener divisiones'
      );
    },

    getDivisionTrainingSessions: async (divisionId, filters = {}) => {
      return requestJson(
        `${API_URL}/trainer/divisions/${divisionId}/training-sessions${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener fechas de entrenamiento'
      );
    },

    getDivisionAttendance: async (divisionId, filters = {}) => {
      return requestJson(
        `${API_URL}/trainer/divisions/${divisionId}/attendance${buildQueryString(filters)}`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener asistencia'
      );
    },

    bulkUpsertAttendance: async (data) => {
      return requestJson(
        `${API_URL}/trainer/attendance/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al guardar asistencia'
      );
    },

    updateAttendance: async (id, data) => {
      return requestJson(
        `${API_URL}/trainer/attendance/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar asistencia'
      );
    },
  },
};
