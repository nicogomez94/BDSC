const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      throw new Error('No autorizado');
    }
    return response.json();
  },

  // Trainers (público)
  getTrainers: async () => {
    const response = await fetch(`${API_URL}/trainers`);
    if (!response.ok) {
      throw new Error('Error al obtener entrenadores');
    }
    return response.json();
  },

  getTrainerBySlug: async (slug) => {
    const response = await fetch(`${API_URL}/trainers/${slug}`);
    if (!response.ok) {
      throw new Error('Entrenador no encontrado');
    }
    return response.json();
  },

  // Admin
  admin: {
    createTrainer: async (data) => {
      const response = await fetch(`${API_URL}/admin/trainers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear entrenador');
      }
      return response.json();
    },

    updateTrainer: async (id, data) => {
      const response = await fetch(`${API_URL}/admin/trainers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar entrenador');
      }
      return response.json();
    },

    deleteTrainer: async (id) => {
      const response = await fetch(`${API_URL}/admin/trainers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar entrenador');
      }
      return response.json();
    },

    createSection: async (data) => {
      const response = await fetch(`${API_URL}/admin/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear sección');
      }
      return response.json();
    },

    getSections: async () => {
      const response = await fetch(`${API_URL}/admin/sections`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        throw new Error('Error al obtener secciones');
      }
      return response.json();
    },

    updateSection: async (id, data) => {
      const response = await fetch(`${API_URL}/admin/sections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar sección');
      }
      return response.json();
    },

    deleteSection: async (id) => {
      const response = await fetch(`${API_URL}/admin/sections/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar sección');
      }
      return response.json();
    },

    grantAccess: async (sectionId, trainerId) => {
      const response = await fetch(`${API_URL}/admin/section-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ sectionId, trainerId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al otorgar acceso');
      }
      return response.json();
    },

    revokeAccess: async (accessId) => {
      const response = await fetch(`${API_URL}/admin/section-access/${accessId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al revocar acceso');
      }
      return response.json();
    },
  },

  // Trainer
  trainer: {
    getSections: async () => {
      const response = await fetch(`${API_URL}/trainer/sections`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        throw new Error('Error al obtener secciones');
      }
      return response.json();
    },

    updateProfile: async (data) => {
      const response = await fetch(`${API_URL}/trainer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar perfil');
      }
      return response.json();
    },
  },
};
