import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DEBUG_MODE, DEBUG_PREFILL } from '../config/debug';
import './TrainerPanel.css';

const STATUSES = ['PRESENTE', 'AUSENTE', 'JUSTIFICADA', 'TARDE', 'SAF', 'SUSPENDIDO'];
const MONTHS = [
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
];

const getUtcDateParts = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: String(date.getUTCDate()).padStart(2, '0'),
    month: String(date.getUTCMonth() + 1).padStart(2, '0'),
    year: date.getUTCFullYear(),
  };
};

const dateLabel = (value) => {
  const parts = getUtcDateParts(value);
  if (!parts) return '';
  return `${parts.day}/${parts.month}/${parts.year}`;
};

const dateInput = (value) => {
  const parts = getUtcDateParts(value);
  if (!parts) return '';
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const sanitizeFilename = (value, fallback = 'archivo') =>
  String(value || fallback)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || fallback;

const createSessionForm = (divisionId = '') => ({ divisionId, date: '', notes: '' });

const TrainerPanel = () => {
  const { user } = useAuth();
  const panelTitle = user?.role === 'PREPARADOR_FISICO' ? 'Panel de Preparador Fisico' : 'Panel de Entrenador';
  const [tab, setTab] = useState('attendance');
  const [sections, setSections] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [changes, setChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [filters, setFilters] = useState({ divisionId: '', month: '' });
  const [sessionForm, setSessionForm] = useState(createSessionForm());
  const [profileForm, setProfileForm] = useState(
    DEBUG_MODE
      ? { ...DEBUG_PREFILL.profileForm }
      : { bio: '', specialty: '', photoUrl: '', password: '' }
  );

  const divisionMap = useMemo(() => {
    const map = {};
    for (const division of divisions) map[division.id] = division;
    return map;
  }, [divisions]);

  const withLoad = async (fn) => {
    setLoading(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => setSections(await api.trainer.getSections());

  const loadMatrix = async (divisionId = filters.divisionId, month = filters.month) => {
    if (!divisionId) {
      setMatrix(null);
      setChanges({});
      return;
    }

    const data = await api.trainer.getDivisionAttendance(divisionId, {
      month: month || undefined,
    });
    setMatrix(data);
    setChanges({});
  };

  const loadSessions = async (divisionId = filters.divisionId, month = filters.month) => {
    if (!divisionId) {
      setSessions([]);
      return;
    }

    const data = await api.trainer.getDivisionTrainingSessions(divisionId, {
      month: month || undefined,
    });
    setSessions(data);
  };

  useEffect(() => {
    withLoad(async () => {
      await loadSections();
      const divisionData = await api.trainer.getDivisions();
      setDivisions(divisionData);

      const initialDivisionId = filters.divisionId || (divisionData[0] ? String(divisionData[0].id) : '');
      if (initialDivisionId && initialDivisionId !== filters.divisionId) {
        setFilters((current) => ({ ...current, divisionId: initialDivisionId }));
      }

      if (initialDivisionId) {
        await loadMatrix(initialDivisionId, filters.month);
        setSessionForm(createSessionForm(initialDivisionId));
      }

      if (user?.trainer) {
        setProfileForm({
          bio: user.trainer.bio || (DEBUG_MODE ? DEBUG_PREFILL.profileForm.bio : ''),
          specialty: user.trainer.specialty || (DEBUG_MODE ? DEBUG_PREFILL.profileForm.specialty : ''),
          photoUrl: user.trainer.photoUrl || (DEBUG_MODE ? DEBUG_PREFILL.profileForm.photoUrl : ''),
          password: DEBUG_MODE ? DEBUG_PREFILL.profileForm.password : '',
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!filters.divisionId) {
      setMatrix(null);
      setSessions([]);
      setChanges({});
      return;
    }

    withLoad(async () => {
      if (tab === 'sessions') {
        await loadSessions();
      } else if (tab === 'attendance') {
        await loadMatrix();
      }
    });
  }, [filters.divisionId, filters.month, tab]);

  useEffect(() => {
    if (editingSession) return;
    setSessionForm((current) => {
      const nextDivisionId = filters.divisionId || current.divisionId;
      if (current.divisionId === nextDivisionId) return current;
      return { ...current, divisionId: nextDivisionId };
    });
  }, [filters.divisionId, editingSession]);

  const cellValue = (playerId, sessionId) =>
    changes[sessionId]?.[playerId]?.status || matrix?.matrix?.[playerId]?.[sessionId]?.status || '';

  const handleCell = (playerId, sessionId, status) => {
    setChanges((current) => ({
      ...current,
      [sessionId]: { ...(current[sessionId] || {}), [playerId]: { playerId, status } },
    }));
  };

  const handleSaveAttendance = async () => {
    const sessionIds = Object.keys(changes);
    if (!sessionIds.length) return;

    await withLoad(async () => {
      for (const sessionId of sessionIds) {
        const entries = Object.values(changes[sessionId]).filter((entry) => entry.status);
        if (entries.length) {
          await api.trainer.bulkUpsertAttendance({
            trainingSessionId: Number(sessionId),
            entries,
          });
        }
      }
      await loadMatrix();
    });
  };

  const openCreateSession = () => {
    if (!filters.divisionId) {
      setError('Selecciona una division primero.');
      return;
    }
    setEditingSession(null);
    setSessionForm(createSessionForm(filters.divisionId));
    setSessionModalOpen(true);
  };

  const openEditSession = (session) => {
    setEditingSession(session);
    setSessionForm({
      divisionId: String(session.divisionId || ''),
      date: dateInput(session.date),
      notes: session.notes || '',
    });
    setSessionModalOpen(true);
  };

  const cancelSessionEdition = () => {
    setEditingSession(null);
    setSessionForm(createSessionForm(filters.divisionId));
    setSessionModalOpen(false);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();

    if (!sessionForm.date) {
      setError('La fecha es obligatoria.');
      return;
    }

    const normalizedDivisionId = Number(sessionForm.divisionId || filters.divisionId);
    if (!editingSession && !normalizedDivisionId) {
      setError('Selecciona una division.');
      return;
    }

    await withLoad(async () => {
      if (editingSession) {
        await api.trainer.updateTrainingSession(editingSession.id, {
          date: sessionForm.date,
          notes: sessionForm.notes,
        });
      } else {
        await api.trainer.createTrainingSession({
          divisionId: normalizedDivisionId,
          date: sessionForm.date,
          notes: sessionForm.notes,
        });
      }

      setEditingSession(null);
      setSessionForm(createSessionForm(filters.divisionId || String(normalizedDivisionId)));
      setSessionModalOpen(false);
      await loadSessions();
      await loadMatrix();
    });
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Eliminar fecha de entrenamiento?')) return;

    await withLoad(async () => {
      await api.trainer.deleteTrainingSession(sessionId);
      if (editingSession?.id === sessionId) {
        setEditingSession(null);
        setSessionForm(createSessionForm(filters.divisionId));
      }
      await loadSessions();
      await loadMatrix();
    });
  };

  const exportCsv = async () => {
    await withLoad(async () => {
      const { filename, blob } = await api.trainer.exportAttendance({
        divisionId: filters.divisionId || undefined,
        month: filters.month || undefined,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    });
  };

  const exportAttendanceExcel = async () => {
    if (!filters.divisionId) {
      setError('Selecciona una division antes de exportar la planilla.');
      return;
    }

    if (!matrix || !Array.isArray(matrix.players) || !Array.isArray(matrix.sessions) || matrix.sessions.length === 0) {
      setError('Carga una planilla con fechas antes de exportar.');
      return;
    }

    const headers = ['Jugadora', 'Grado', 'Año de nacimiento', ...matrix.sessions.map((session) => dateLabel(session.date))];
    const rows = matrix.players.map((player) => [
      player.active ? player.fullName : `${player.fullName} (Inactiva)`,
      player.grade || '-',
      player.birthYear || '-',
      ...matrix.sessions.map((session) => cellValue(player.id, session.id) || '-'),
    ]);

    const xlsxModule = await import('xlsx');
    const XLSX = xlsxModule.default || xlsxModule;
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [{ wch: 36 }, { wch: 14 }, { wch: 18 }, ...matrix.sessions.map(() => ({ wch: 14 }))];

    const workbook = XLSX.utils.book_new();
    const division = divisionMap[Number(filters.divisionId)];
    const sheetTitle = `${division?.name || 'Asistencia'} ${division?.seasonYear || ''}`
      .trim()
      .replace(/[:\\/?*\[\]]/g, '')
      .slice(0, 31) || 'Asistencia';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);

    const monthLabel = filters.month
      ? MONTHS.find((month) => String(month.value) === String(filters.month))?.label || `Mes ${filters.month}`
      : 'Todos';
    const filename = `planilla_asistencia_${sanitizeFilename(division?.name || `division-${filters.divisionId}`, 'division')}_${sanitizeFilename(monthLabel, 'todos')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.trainer.updateProfile(profileForm);
      setEditingProfile(false);
      window.location.reload();
    });
  };

  const filterRow = (
    <div className="filters-row">
      <div className="form-group">
        <label>Division</label>
        <select
          value={filters.divisionId}
          onChange={(e) => setFilters((current) => ({ ...current, divisionId: e.target.value }))}
        >
          <option value="">Seleccionar</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name} - {division.seasonYear}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Mes</label>
        <select value={filters.month} onChange={(e) => setFilters((current) => ({ ...current, month: e.target.value }))}>
          <option value="">Todos</option>
          {MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="trainer-panel">
      <div className="container">
        <h1>{panelTitle}</h1>

        <div className="tabs tabs-wrap">
          <button className={tab === 'attendance' ? 'active' : ''} onClick={() => setTab('attendance')}>Asistencia</button>
          <button className={tab === 'sessions' ? 'active' : ''} onClick={() => setTab('sessions')}>Fechas</button>
          <button className={tab === 'sections' ? 'active' : ''} onClick={() => setTab('sections')}>Secciones</button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Perfil</button>
        </div>

        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}
        {tab === 'sessions' && (
          <div className="tab-actions">
            <button type="button" className="btn-primary" onClick={openCreateSession}>
              Nueva fecha
            </button>
          </div>
        )}

        {tab === 'attendance' && (
          <div className="tab-content">
            <h2>Asistencia por division</h2>
            {filterRow}
            <div className="filters-actions">
              <button type="button" className="btn-primary" onClick={handleSaveAttendance}>
                Guardar cambios
              </button>
              <button type="button" className="btn-secondary" onClick={() => withLoad(exportAttendanceExcel)}>
                Exportar Excel
              </button>
              <button type="button" className="btn-secondary" onClick={exportCsv}>
                Exportar CSV
              </button>
            </div>

            {matrix && matrix.sessions.length > 0 ? (
              <div className="attendance-grid-wrapper">
                <table className="attendance-grid">
                  <thead>
                    <tr>
                      <th>Jugadora</th>
                      <th>Grado</th>
                      <th>Año de nacimiento</th>
                      {matrix.sessions.map((session) => (
                        <th key={session.id}>{dateLabel(session.date)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.players.map((player) => (
                      <tr key={player.id}>
                        <td>{player.fullName}</td>
                        <td>{player.grade || '-'}</td>
                        <td>{player.birthYear || '-'}</td>
                        {matrix.sessions.map((session) => (
                          <td key={`${player.id}-${session.id}`}>
                            <select value={cellValue(player.id, session.id)} onChange={(e) => handleCell(player.id, session.id, e.target.value)}>
                              <option value="">-</option>
                              {STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay fechas de entrenamiento para la division/mes seleccionado.</p>
            )}
          </div>
        )}

        {tab === 'sessions' && (
          <div className="tab-content">
            <h2>Fechas de entrenamiento</h2>
            {filterRow}
            <div className="filters-actions">
              <button type="button" className="btn-secondary" onClick={() => withLoad(loadSessions)}>
                Aplicar filtros
              </button>
            </div>

            <div className="sessions-list">
              {sessions.length === 0 ? (
                <p>No hay fechas de entrenamiento para la division/mes seleccionado.</p>
              ) : (
                sessions.map((session) => (
                  <div className="session-row" key={session.id}>
                    <div className="session-row-info">
                      <h3>{dateLabel(session.date)}</h3>
                      <p>
                        {divisionMap[session.divisionId]?.name || 'Division'} | Mes {session.month} | Registros {session._count?.attendance || 0}
                      </p>
                      {session.notes && <p>{session.notes}</p>}
                    </div>
                    <div className="row-actions">
                      <button type="button" className="btn-secondary" onClick={() => openEditSession(session)}>
                        Editar
                      </button>
                      <button type="button" className="btn-danger" onClick={() => handleDeleteSession(session.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'sections' && (
          <div className="tab-content">
            <h2>Mis secciones</h2>
            <div className="sections-grid">
              {sections.map((section) => (
                <div className="section-card" key={section.id}>
                  <h3>{section.title}</h3>
                  <div className="section-content" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                  <p className="section-date">Actualizado: {new Date(section.updatedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="tab-content">
            <h2>Mi perfil</h2>
            <div className="profile-info">
              <p><strong>Nombre:</strong> {user?.trainer?.name}</p>
              <p><strong>Especialidad:</strong> {user?.trainer?.specialty || 'No especificada'}</p>
              <p><strong>Biografia:</strong> {user?.trainer?.bio || 'Sin biografia'}</p>
              <button className="btn-secondary" onClick={() => setEditingProfile(!editingProfile)}>
                {editingProfile ? 'Cancelar' : 'Editar perfil'}
              </button>
              {editingProfile && (
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-group"><label>Especialidad</label><input value={profileForm.specialty} onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })} /></div>
                  <div className="form-group"><label>Biografia</label><textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows="4" /></div>
                  <div className="form-group"><label>URL foto</label><input value={profileForm.photoUrl} onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })} /></div>
                  <div className="form-group"><label>Nueva contrasena</label><input type="password" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} /></div>
                  <button type="submit" className="btn-primary">Guardar cambios</button>
                </form>
              )}
            </div>
          </div>
        )}

        {sessionModalOpen && (
          <div className="modal-overlay" onClick={cancelSessionEdition}>
            <div className="modal-content trainer-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-copy">
                  <h3>{editingSession ? 'Editar fecha' : 'Crear fecha'}</h3>
                  <p>{editingSession ? 'Actualiza los datos de la fecha.' : 'Completa los datos para crear una fecha.'}</p>
                </div>
                <button type="button" className="modal-close" onClick={cancelSessionEdition} aria-label="Cerrar modal">
                  x
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveSession} className="session-form">
                  {!editingSession && (
                    <div className="form-group">
                      <label>Division</label>
                      <select
                        value={sessionForm.divisionId}
                        onChange={(e) => setSessionForm((current) => ({ ...current, divisionId: e.target.value }))}
                        required
                      >
                        <option value="">Seleccionar</option>
                        {divisions.map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.name} - {division.seasonYear}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Fecha</label>
                    <input
                      type="date"
                      value={sessionForm.date}
                      onChange={(e) => setSessionForm((current) => ({ ...current, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Notas</label>
                    <input
                      value={sessionForm.notes}
                      onChange={(e) => setSessionForm((current) => ({ ...current, notes: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="session-form-actions">
                    <button type="submit" className="btn-primary">
                      {editingSession ? 'Guardar cambios' : 'Crear fecha'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={cancelSessionEdition}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerPanel;
