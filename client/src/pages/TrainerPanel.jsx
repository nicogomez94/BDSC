import { useEffect, useState } from 'react';
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

const TrainerPanel = () => {
  const { user } = useAuth();
  const panelTitle = user?.role === 'PREPARADOR_FISICO' ? 'Panel de Preparador Físico' : 'Panel de Entrenador';
  const [tab, setTab] = useState('attendance');
  const [sections, setSections] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [changes, setChanges] = useState({});
  const [sessionDateChanges, setSessionDateChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [filters, setFilters] = useState({ divisionId: '', month: '' });
  const [profileForm, setProfileForm] = useState(
    DEBUG_MODE
      ? { ...DEBUG_PREFILL.profileForm }
      : { bio: '', specialty: '', photoUrl: '', password: '' }
  );
  const divisionMap = divisions.reduce((acc, division) => {
    acc[division.id] = division;
    return acc;
  }, {});

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
  const loadDivisions = async () => setDivisions(await api.trainer.getDivisions());
  const loadMatrix = async () => {
    if (!filters.divisionId) return;
    const data = await api.trainer.getDivisionAttendance(filters.divisionId, {
      month: filters.month || undefined,
    });
    setMatrix(data);
    setChanges({});
    setSessionDateChanges({});
  };

  useEffect(() => {
    withLoad(async () => {
      await loadSections();
      const divisionData = await api.trainer.getDivisions();
      setDivisions(divisionData);
      if (!filters.divisionId && divisionData.length > 0) {
        setFilters((current) => ({ ...current, divisionId: String(divisionData[0].id) }));
      } else if (filters.divisionId) {
        await loadMatrix();
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
    if (!filters.divisionId) return;
    withLoad(loadMatrix);
  }, [filters.divisionId, filters.month]);

  const cellValue = (playerId, sessionId) =>
    changes[sessionId]?.[playerId]?.status || matrix?.matrix?.[playerId]?.[sessionId]?.status || '';

  const sessionDateValue = (session) => sessionDateChanges[session.id] ?? dateInput(session.date);
  const hasSessionDateChanges =
    matrix?.sessions?.some((session) => {
      const nextDate = sessionDateChanges[session.id];
      return nextDate && nextDate !== dateInput(session.date);
    }) ?? false;

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

  const handleSessionDateChange = (sessionId, date) => {
    setSessionDateChanges((current) => ({
      ...current,
      [sessionId]: date,
    }));
  };

  const handleSaveSessionDates = async () => {
    if (!matrix?.sessions?.length) return;

    const updates = matrix.sessions
      .map((session) => ({
        sessionId: session.id,
        date: sessionDateChanges[session.id],
        currentDate: dateInput(session.date),
      }))
      .filter((item) => item.date && item.date !== item.currentDate);

    if (!updates.length) return;

    await withLoad(async () => {
      for (const update of updates) {
        await api.trainer.updateTrainingSession(update.sessionId, { date: update.date });
      }
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
      setError('Seleccioná una división antes de exportar la planilla.');
      return;
    }

    if (!matrix || !Array.isArray(matrix.players) || !Array.isArray(matrix.sessions) || matrix.sessions.length === 0) {
      setError('Cargá una planilla con fechas antes de exportar.');
      return;
    }

    const headers = ['Jugadora', ...matrix.sessions.map((session) => dateLabel(session.date))];
    const rows = matrix.players.map((player) => [
      player.active ? player.fullName : `${player.fullName} (Inactiva)`,
      ...matrix.sessions.map((session) => cellValue(player.id, session.id) || '-'),
    ]);

    const xlsxModule = await import('xlsx');
    const XLSX = xlsxModule.default || xlsxModule;
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [{ wch: 36 }, ...matrix.sessions.map(() => ({ wch: 14 }))];

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

  return (
    <div className="trainer-panel">
      <div className="container">
        <h1>{panelTitle}</h1>

        <div className="tabs tabs-wrap">
          <button className={tab === 'attendance' ? 'active' : ''} onClick={() => setTab('attendance')}>Asistencia</button>
          <button className={tab === 'sections' ? 'active' : ''} onClick={() => setTab('sections')}>Secciones</button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Perfil</button>
        </div>

        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}

        {tab === 'attendance' && (
          <div className="tab-content">
            <h2>Asistencia por división</h2>
            <div className="filters-row">
              <div className="form-group">
                <label>División</label>
                <select value={filters.divisionId} onChange={(e) => setFilters((current) => ({ ...current, divisionId: e.target.value }))}>
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
            <div className="filters-actions">
              <button type="button" className="btn-primary" onClick={handleSaveAttendance}>
                Guardar cambios
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleSaveSessionDates}
                disabled={!hasSessionDateChanges}
              >
                Guardar fechas
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
                      {matrix.sessions.map((session) => (
                        <th key={session.id}>
                          <div className="session-header-cell">
                            <span>{dateLabel(session.date)}</span>
                            <input
                              type="date"
                              value={sessionDateValue(session)}
                              onChange={(e) => handleSessionDateChange(session.id, e.target.value)}
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.players.map((player) => (
                      <tr key={player.id}>
                        <td>{player.fullName}</td>
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
              <p>No hay fechas de entrenamiento para la división/mes seleccionado.</p>
            )}
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
              <p><strong>Biografía:</strong> {user?.trainer?.bio || 'Sin biografía'}</p>
              <button className="btn-secondary" onClick={() => setEditingProfile(!editingProfile)}>
                {editingProfile ? 'Cancelar' : 'Editar perfil'}
              </button>
              {editingProfile && (
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-group"><label>Especialidad</label><input value={profileForm.specialty} onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })} /></div>
                  <div className="form-group"><label>Biografía</label><textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows="4" /></div>
                  <div className="form-group"><label>URL foto</label><input value={profileForm.photoUrl} onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })} /></div>
                  <div className="form-group"><label>Nueva contraseña</label><input type="password" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} /></div>
                  <button type="submit" className="btn-primary">Guardar cambios</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerPanel;
