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
  library: {
    getMenu: async () => {
      return requestJson(`${API_URL}/library/menu`, {}, 'Error al obtener biblioteca virtual');
    },

    getCategoryPage: async (sectionSlug, categorySlug) => {
      return requestJson(
        `${API_URL}/library/${sectionSlug}/${categorySlug}`,
        {},
        'Error al obtener videos de biblioteca virtual'
      );
    },
  },

  siteContent: {
    getBySection: async (sectionKey) => {
      return requestJson(
        `${API_URL}/site-content/${sectionKey}`,
        {},
        'Error al obtener contenido de sección'
      );
    },

    getPage: async (sectionKey, subdivisionSlug, pageSlug) => {
      return requestJson(
        `${API_URL}/site-content/${sectionKey}/${subdivisionSlug}/${pageSlug}`,
        {},
        'Error al obtener página'
      );
    },

    getSubpage: async (sectionKey, subdivisionSlug, pageSlug, subpageSlug) => {
      return requestJson(
        `${API_URL}/site-content/${sectionKey}/${subdivisionSlug}/${pageSlug}/${subpageSlug}`,
        {},
        'Error al obtener subpágina'
      );
    },

    getAttendanceDivisions: async (filters = {}) => {
      return requestJson(
        `${API_URL}/site-content/attendance/divisions/list${buildQueryString(filters)}`,
        {},
        'Error al obtener divisiones de asistencia'
      );
    },

    getAttendanceMatrix: async (filters = {}) => {
      return requestJson(
        `${API_URL}/site-content/attendance/matrix/list${buildQueryString(filters)}`,
        {},
        'Error al obtener planilla de asistencia'
      );
    },
  },

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
    getTrainers: async () => {
      return requestJson(
        `${API_URL}/admin/trainers`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener entrenadores'
      );
    },

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

    getVirtualLibrary: async () => {
      return requestJson(
        `${API_URL}/admin/virtual-library`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener biblioteca virtual'
      );
    },

    createVirtualLibrarySection: async (data) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/sections`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear subdivisión'
      );
    },

    updateVirtualLibrarySection: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/sections/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar subdivisión'
      );
    },

    deleteVirtualLibrarySection: async (id) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/sections/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar subdivisión'
      );
    },

    createVirtualLibraryCategory: async (data) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear categoría'
      );
    },

    updateVirtualLibraryCategory: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/categories/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar categoría'
      );
    },

    deleteVirtualLibraryCategory: async (id) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/categories/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar categoría'
      );
    },

    createVirtualLibraryVideo: async (data) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/videos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear video'
      );
    },

    updateVirtualLibraryVideo: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/videos/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar video'
      );
    },

    deleteVirtualLibraryVideo: async (id) => {
      return requestJson(
        `${API_URL}/admin/virtual-library/videos/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar video'
      );
    },

    getSiteContent: async () => {
      return requestJson(
        `${API_URL}/admin/site-content`,
        {
          headers: getAuthHeader(),
        },
        'Error al obtener contenido del menú principal'
      );
    },

    createSiteSubdivision: async (data) => {
      return requestJson(
        `${API_URL}/admin/site-content/subdivisions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear subdivisión'
      );
    },

    updateSiteSubdivision: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/site-content/subdivisions/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar subdivisión'
      );
    },

    deleteSiteSubdivision: async (id) => {
      return requestJson(
        `${API_URL}/admin/site-content/subdivisions/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar subdivisión'
      );
    },

    createSitePage: async (data) => {
      return requestJson(
        `${API_URL}/admin/site-content/pages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear página'
      );
    },

    updateSitePage: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/site-content/pages/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar página'
      );
    },

    deleteSitePage: async (id) => {
      return requestJson(
        `${API_URL}/admin/site-content/pages/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar página'
      );
    },

    createSiteSubpage: async (data) => {
      return requestJson(
        `${API_URL}/admin/site-content/subpages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al crear subpágina'
      );
    },

    updateSiteSubpage: async (id, data) => {
      return requestJson(
        `${API_URL}/admin/site-content/subpages/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(data),
        },
        'Error al actualizar subpágina'
      );
    },

    deleteSiteSubpage: async (id) => {
      return requestJson(
        `${API_URL}/admin/site-content/subpages/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        },
        'Error al eliminar subpágina'
      );
    },

    uploadSiteContentImage: async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      return requestJson(
        `${API_URL}/admin/site-content/images`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: formData,
        },
        'Error al subir imagen'
      );
    },

    uploadSiteContentPdf: async (file) => {
      const formData = new FormData();
      formData.append('pdf', file);

      return requestJson(
        `${API_URL}/admin/site-content/pdfs`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: formData,
        },
        'Error al subir PDF'
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

    exportAttendance: async (filters = {}) => {
      const response = await fetch(`${API_URL}/trainer/attendance/export${buildQueryString(filters)}`, {
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
  },
};
