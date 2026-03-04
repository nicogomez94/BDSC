import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DEBUG_MODE, DEBUG_PREFILL } from '../config/debug';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('trainers');
  const [trainers, setTrainers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Formulario de entrenador
  const [trainerForm, setTrainerForm] = useState(
    DEBUG_MODE
      ? { ...DEBUG_PREFILL.trainerForm }
      : {
          name: '',
          bio: '',
          specialty: '',
          photoUrl: '',
          email: '',
          password: '',
        }
  );

  // Formulario de sección
  const [sectionForm, setSectionForm] = useState(
    DEBUG_MODE
      ? { ...DEBUG_PREFILL.sectionForm }
      : {
          title: '',
          content: '',
        }
  );

  useEffect(() => {
    if (activeTab === 'trainers') {
      loadTrainers();
    } else if (activeTab === 'sections') {
      loadSections();
    }
  }, [activeTab]);

  const loadTrainers = async () => {
    try {
      const data = await api.getTrainers();
      setTrainers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSections = async () => {
    try {
      const data = await api.admin.getSections();
      setSections(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.admin.createTrainer(trainerForm);
      setTrainerForm(
        DEBUG_MODE
          ? { ...DEBUG_PREFILL.trainerForm }
          : {
              name: '',
              bio: '',
              specialty: '',
              photoUrl: '',
              email: '',
              password: '',
            }
      );
      loadTrainers();
      alert('Entrenador creado exitosamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este entrenador?')) return;

    try {
      await api.admin.deleteTrainer(id);
      loadTrainers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.admin.createSection(sectionForm);
      setSectionForm(DEBUG_MODE ? { ...DEBUG_PREFILL.sectionForm } : { title: '', content: '' });
      loadSections();
      alert('Sección creada exitosamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta sección?')) return;

    try {
      await api.admin.deleteSection(id);
      loadSections();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGrantAccess = async (sectionId, trainerId) => {
    try {
      await api.admin.grantAccess(sectionId, trainerId);
      loadSections();
      alert('Acceso otorgado');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRevokeAccess = async (accessId) => {
    try {
      await api.admin.revokeAccess(accessId);
      loadSections();
      alert('Acceso revocado');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-panel">
      <div className="container">
        <h1>Panel de Coordinador</h1>

        <div className="tabs">
          <button
            className={activeTab === 'trainers' ? 'active' : ''}
            onClick={() => setActiveTab('trainers')}
          >
            Entrenadores
          </button>
          <button
            className={activeTab === 'sections' ? 'active' : ''}
            onClick={() => setActiveTab('sections')}
          >
            Secciones
          </button>
        </div>

        {activeTab === 'trainers' && (
          <div className="tab-content">
            <h2>Crear Entrenador</h2>
            <form onSubmit={handleCreateTrainer} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={trainerForm.name}
                    onChange={(e) =>
                      setTrainerForm({ ...trainerForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Especialidad</label>
                  <input
                    type="text"
                    value={trainerForm.specialty}
                    onChange={(e) =>
                      setTrainerForm({ ...trainerForm, specialty: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Biografía</label>
                <textarea
                  value={trainerForm.bio}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, bio: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>URL de Foto</label>
                <input
                  type="url"
                  value={trainerForm.photoUrl}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, photoUrl: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email (para crear usuario)</label>
                  <input
                    type="email"
                    value={trainerForm.email}
                    onChange={(e) =>
                      setTrainerForm({ ...trainerForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    value={trainerForm.password}
                    onChange={(e) =>
                      setTrainerForm({ ...trainerForm, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Entrenador'}
              </button>

              {error && <div className="error-message">{error}</div>}
            </form>

            <h2>Lista de Entrenadores</h2>
            <div className="data-table">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="data-row">
                  <div className="data-info">
                    <h3>{trainer.name}</h3>
                    {trainer.specialty && <p>{trainer.specialty}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteTrainer(trainer.id)}
                    className="btn-danger"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="tab-content">
            <h2>Crear Sección</h2>
            <form onSubmit={handleCreateSection} className="admin-form">
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Contenido</label>
                <textarea
                  value={sectionForm.content}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, content: e.target.value })
                  }
                  rows="5"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Sección'}
              </button>
            </form>

            <h2>Gestión de Secciones</h2>
            <div className="sections-list">
              {sections.map((section) => (
                <div key={section.id} className="section-card">
                  <div className="section-header">
                    <h3>{section.title}</h3>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                  <p>{section.content}</p>

                  <div className="section-access">
                    <h4>Accesos:</h4>
                    {section.sectionAccess && section.sectionAccess.length > 0 ? (
                      <ul>
                        {section.sectionAccess.map((access) => (
                          <li key={access.id}>
                            {access.trainer.name}
                            <button
                              onClick={() => handleRevokeAccess(access.id)}
                              className="btn-small"
                            >
                              Revocar
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Sin accesos asignados</p>
                    )}

                    <div className="grant-access">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleGrantAccess(section.id, parseInt(e.target.value));
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Otorgar acceso a...</option>
                        {trainers.map((trainer) => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
