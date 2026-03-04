import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DEBUG_MODE, DEBUG_PREFILL } from '../config/debug';
import './TrainerPanel.css';

const TrainerPanel = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(
    DEBUG_MODE
      ? { ...DEBUG_PREFILL.profileForm }
      : {
          bio: '',
          specialty: '',
          photoUrl: '',
          password: '',
        }
  );

  useEffect(() => {
    loadSections();
    if (user.trainer) {
      setProfileForm({
        bio: user.trainer.bio || (DEBUG_MODE ? DEBUG_PREFILL.profileForm.bio : ''),
        specialty: user.trainer.specialty || (DEBUG_MODE ? DEBUG_PREFILL.profileForm.specialty : ''),
        photoUrl: user.trainer.photoUrl || (DEBUG_MODE ? DEBUG_PREFILL.profileForm.photoUrl : ''),
        password: DEBUG_MODE ? DEBUG_PREFILL.profileForm.password : '',
      });
    }
  }, [user]);

  const loadSections = async () => {
    try {
      const data = await api.trainer.getSections();
      setSections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.trainer.updateProfile(profileForm);
      alert('Perfil actualizado exitosamente');
      setEditingProfile(false);
      window.location.reload(); // Recargar para ver cambios
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="trainer-panel">
      <div className="container">
        <h1>Panel de Entrenador</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-section">
          <h2>Mi Perfil</h2>
          {user.trainer && (
            <div className="profile-info">
              <p><strong>Nombre:</strong> {user.trainer.name}</p>
              <p><strong>Especialidad:</strong> {user.trainer.specialty || 'No especificada'}</p>
              <p><strong>Biografía:</strong> {user.trainer.bio || 'Sin biografía'}</p>
              
              <button 
                onClick={() => setEditingProfile(!editingProfile)}
                className="btn-secondary"
              >
                {editingProfile ? 'Cancelar' : 'Editar Perfil'}
              </button>

              {editingProfile && (
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-group">
                    <label>Especialidad</label>
                    <input
                      type="text"
                      value={profileForm.specialty}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, specialty: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Biografía</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, bio: e.target.value })
                      }
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>URL de Foto</label>
                    <input
                      type="url"
                      value={profileForm.photoUrl}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, photoUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Nueva Contraseña (dejar vacío para no cambiar)</label>
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, password: e.target.value })
                      }
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="sections-section">
          <h2>Mis Secciones</h2>
          {sections.length > 0 ? (
            <div className="sections-grid">
              {sections.map((section) => (
                <div key={section.id} className="section-card">
                  <h3>{section.title}</h3>
                  <div className="section-content">
                    {section.content}
                  </div>
                  <p className="section-date">
                    Actualizado: {new Date(section.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No tienes acceso a ninguna sección aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerPanel;
