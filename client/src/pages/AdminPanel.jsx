import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserTie,
  faFolderTree,
  faLayerGroup,
  faPersonDress,
  faCalendarDay,
  faClipboardCheck,
  faChartColumn,
  faUserGear
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../services/api';
import { DEBUG_MODE, DEBUG_PREFILL } from '../config/debug';
import './AdminPanel.css';

const STATUSES = ['PRESENTE', 'AUSENTE', 'JUSTIFICADA', 'TARDE'];
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
const CREATE_TABS = ['trainers', 'sections', 'divisions', 'players', 'sessions'];
const CREATE_MODAL_COPY = {
  trainers: { title: 'Crear entrenador', button: 'Nuevo entrenador' },
  sections: { title: 'Crear sección', button: 'Nueva sección' },
  divisions: { title: 'Crear división', button: 'Nueva división' },
  players: { title: 'Crear jugadora', button: 'Nueva jugadora' },
  sessions: { title: 'Crear fecha', button: 'Nueva fecha' },
};
const PANEL_TABS = [
  { key: 'trainers', label: 'Entrenadores', icon: faUserTie },
  { key: 'sections', label: 'Secciones', icon: faFolderTree },
  { key: 'divisions', label: 'Divisiones', icon: faLayerGroup },
  { key: 'players', label: 'Jugadoras', icon: faPersonDress },
  { key: 'sessions', label: 'Fechas', icon: faCalendarDay },
  { key: 'attendance', label: 'Asistencia', icon: faClipboardCheck },
  { key: 'reports', label: 'Reportes', icon: faChartColumn },
];

const dateLabel = (value) => new Date(value).toLocaleDateString('es-AR');
const dateInput = (value) => new Date(value).toISOString().slice(0, 10);

const AdminPanel = () => {
  const [tab, setTab] = useState('trainers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [sections, setSections] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [changes, setChanges] = useState({});
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({ divisionId: '', month: '' });
  const [createModalTab, setCreateModalTab] = useState(null);

  const [trainerForm, setTrainerForm] = useState(
    DEBUG_MODE
      ? { ...DEBUG_PREFILL.trainerForm }
      : { name: '', bio: '', specialty: '', photoUrl: '', email: '', password: '' }
  );
  const [sectionForm, setSectionForm] = useState(
    DEBUG_MODE ? { ...DEBUG_PREFILL.sectionForm } : { title: '', content: '' }
  );
  const [divisionForm, setDivisionForm] = useState({ name: '', seasonYear: new Date().getFullYear() });
  const [playerForm, setPlayerForm] = useState({ fullName: '', birthYear: '', divisionId: '', active: true });
  const [sessionForm, setSessionForm] = useState({ divisionId: '', date: '', notes: '' });

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

  const loadTrainers = async () => setTrainers(await api.getTrainers());
  const loadSections = async () => setSections(await api.admin.getSections());
  const loadDivisions = async () => setDivisions(await api.admin.getDivisions());
  const loadPlayers = async (divisionId) =>
    setPlayers(await api.admin.getPlayers({ divisionId: divisionId || undefined }));
  const loadSessions = async (divisionId, month) =>
    setSessions(await api.admin.getTrainingSessions({ divisionId: divisionId || undefined, month: month || undefined }));
  const loadMatrix = async () => {
    if (!filters.divisionId) return;
    const data = await api.admin.getAttendanceMatrix({
      divisionId: filters.divisionId,
      month: filters.month || undefined,
    });
    setMatrix(data);
    setChanges({});
  };
  const loadReport = async () => {
    setReport(
      await api.admin.getAttendanceReport({
        divisionId: filters.divisionId || undefined,
        month: filters.month || undefined,
      })
    );
  };

  useEffect(() => {
    withLoad(async () => {
      await loadTrainers();
      await loadDivisions();
      if (tab === 'sections') await loadSections();
      if (tab === 'players') await loadPlayers(filters.divisionId);
      if (tab === 'sessions') await loadSessions(filters.divisionId, filters.month);
      if (tab === 'attendance') await loadMatrix();
      if (tab === 'reports') await loadReport();
    });
  }, [tab]);

  useEffect(() => {
    setCreateModalTab(null);
  }, [tab]);

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createTrainer(trainerForm);
      setTrainerForm(DEBUG_MODE ? { ...DEBUG_PREFILL.trainerForm } : { name: '', bio: '', specialty: '', photoUrl: '', email: '', password: '' });
      setCreateModalTab(null);
      await loadTrainers();
    });
  };

  const handleDeleteTrainer = async (id) => {
    if (!confirm('¿Eliminar entrenador?')) return;
    await withLoad(async () => {
      await api.admin.deleteTrainer(id);
      await loadTrainers();
    });
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createSection(sectionForm);
      setSectionForm(DEBUG_MODE ? { ...DEBUG_PREFILL.sectionForm } : { title: '', content: '' });
      setCreateModalTab(null);
      await loadSections();
    });
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('¿Eliminar sección?')) return;
    await withLoad(async () => {
      await api.admin.deleteSection(id);
      await loadSections();
    });
  };

  const handleCreateDivision = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createDivision({ name: divisionForm.name, seasonYear: Number(divisionForm.seasonYear) });
      setDivisionForm({ name: '', seasonYear: new Date().getFullYear() });
      setCreateModalTab(null);
      await loadDivisions();
    });
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createPlayer({
        fullName: playerForm.fullName,
        birthYear: Number(playerForm.birthYear),
        divisionId: Number(playerForm.divisionId),
        active: playerForm.active,
      });
      setPlayerForm({ fullName: '', birthYear: '', divisionId: '', active: true });
      setCreateModalTab(null);
      await loadPlayers(filters.divisionId);
    });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      await api.admin.createTrainingSession({
        divisionId: Number(sessionForm.divisionId),
        date: sessionForm.date,
        notes: sessionForm.notes,
      });
      setSessionForm({ divisionId: '', date: '', notes: '' });
      setCreateModalTab(null);
      await loadSessions(filters.divisionId, filters.month);
    });
  };

  const handleCell = (playerId, sessionId, status) => {
    setChanges((current) => ({
      ...current,
      [sessionId]: { ...(current[sessionId] || {}), [playerId]: { playerId, status } },
    }));
  };

  const cellValue = (playerId, sessionId) =>
    changes[sessionId]?.[playerId]?.status || matrix?.matrix?.[playerId]?.[sessionId]?.status || '';

  const saveAttendance = async () => {
    const sessionIds = Object.keys(changes);
    if (sessionIds.length === 0) return;
    await withLoad(async () => {
      for (const sessionId of sessionIds) {
        const entries = Object.values(changes[sessionId]).filter((entry) => entry.status);
        if (entries.length) {
          await api.admin.bulkUpsertAttendance({ trainingSessionId: Number(sessionId), entries });
        }
      }
      await loadMatrix();
      await loadReport();
    });
  };

  const exportCsv = async () => {
    await withLoad(async () => {
      const { filename, blob } = await api.admin.exportAttendance({
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
  const openCreateModal = () => setCreateModalTab(tab);
  const closeCreateModal = () => setCreateModalTab(null);
  const canCreateInTab = CREATE_TABS.includes(tab);

  const renderCreateModalForm = () => {
    if (createModalTab === 'trainers') {
      return (
        <form onSubmit={handleCreateTrainer} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input value={trainerForm.name} onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Especialidad</label>
              <input value={trainerForm.specialty} onChange={(e) => setTrainerForm({ ...trainerForm, specialty: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Biografía</label>
            <textarea value={trainerForm.bio} onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })} rows="3" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={trainerForm.email} onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={trainerForm.password} onChange={(e) => setTrainerForm({ ...trainerForm, password: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Crear entrenador</button>
        </form>
      );
    }

    if (createModalTab === 'sections') {
      return (
        <form onSubmit={handleCreateSection} className="admin-form">
          <div className="form-group">
            <label>Título</label>
            <input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Contenido</label>
            <textarea value={sectionForm.content} onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })} rows="4" required />
          </div>
          <button type="submit" className="btn-primary">Crear sección</button>
        </form>
      );
    }

    if (createModalTab === 'divisions') {
      return (
        <form onSubmit={handleCreateDivision} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input value={divisionForm.name} onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Temporada</label>
              <input type="number" value={divisionForm.seasonYear} onChange={(e) => setDivisionForm({ ...divisionForm, seasonYear: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Crear división</button>
        </form>
      );
    }

    if (createModalTab === 'players') {
      return (
        <form onSubmit={handleCreatePlayer} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre completo</label>
              <input value={playerForm.fullName} onChange={(e) => setPlayerForm({ ...playerForm, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Año nacimiento</label>
              <input type="number" value={playerForm.birthYear} onChange={(e) => setPlayerForm({ ...playerForm, birthYear: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>División</label>
              <select value={playerForm.divisionId} onChange={(e) => setPlayerForm({ ...playerForm, divisionId: e.target.value })} required>
                <option value="">Seleccionar</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>{division.name} - {division.seasonYear}</option>
                ))}
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" checked={playerForm.active} onChange={(e) => setPlayerForm({ ...playerForm, active: e.target.checked })} />
                Activa
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary">Crear jugadora</button>
        </form>
      );
    }

    if (createModalTab === 'sessions') {
      return (
        <form onSubmit={handleCreateSession} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>División</label>
              <select value={sessionForm.divisionId} onChange={(e) => setSessionForm({ ...sessionForm, divisionId: e.target.value })} required>
                <option value="">Seleccionar</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>{division.name} - {division.seasonYear}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Notas</label>
            <input value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Crear fecha</button>
        </form>
      );
    }

    return null;
  };

  const filterRow = (
    <div className="filters-row">
      <div className="form-group">
        <label>División</label>
        <select value={filters.divisionId} onChange={(e) => setFilters((current) => ({ ...current, divisionId: e.target.value }))}>
          <option value="">Todas</option>
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
    <div className="admin-panel">
      <div className="container">
        <h1 className="panel-title">
          <FontAwesomeIcon icon={faUserGear} />
          Panel de Coordinador
        </h1>

        <div className="tabs tabs-wrap">
          {PANEL_TABS.map((item) => (
            <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}>
              <FontAwesomeIcon icon={item.icon} />
              {item.label}
            </button>
          ))}
        </div>

        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}
        {canCreateInTab && (
          <div className="tab-actions">
            <button type="button" className="btn-primary" onClick={openCreateModal}>
              {CREATE_MODAL_COPY[tab].button}
            </button>
          </div>
        )}

        {tab === 'trainers' && (
          <div className="tab-content">
            <h2>Entrenadores</h2>
            <div className="data-table">
              {trainers.map((trainer) => (
                <div className="data-row" key={trainer.id}>
                  <div className="data-info">
                    <h3>{trainer.name}</h3>
                    <p>{trainer.specialty || 'Sin especialidad'}</p>
                  </div>
                  <button className="btn-danger" onClick={() => handleDeleteTrainer(trainer.id)}>Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'sections' && (
          <div className="tab-content">
            <h2>Secciones</h2>
            <div className="sections-list">
              {sections.map((section) => (
                <div className="section-card" key={section.id}>
                  <div className="section-header">
                    <h3>{section.title}</h3>
                    <button className="btn-danger" onClick={() => handleDeleteSection(section.id)}>Eliminar</button>
                  </div>
                  <p>{section.content}</p>
                  <div className="section-access">
                    <h4>Accesos</h4>
                    {section.sectionAccess?.length > 0 ? (
                      <ul>
                        {section.sectionAccess.map((access) => (
                          <li key={access.id}>
                            {access.trainer.name}
                            <button className="btn-small" onClick={() => withLoad(async () => { await api.admin.revokeAccess(access.id); await loadSections(); })}>
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
                          if (!e.target.value) return;
                          withLoad(async () => {
                            await api.admin.grantAccess(section.id, Number(e.target.value));
                            await loadSections();
                          });
                          e.target.value = '';
                        }}
                      >
                        <option value="">Otorgar acceso...</option>
                        {trainers.map((trainer) => (
                          <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'divisions' && (
          <div className="tab-content">
            <h2>Gestión de divisiones</h2>

            <div className="data-table">
              {divisions.map((division) => (
                <div className="division-card" key={division.id}>
                  <div className="division-card-header">
                    <div>
                      <h3>{division.name} - {division.seasonYear}</h3>
                      <p>Jugadoras: {division._count.players} | Fechas: {division._count.trainingSessions}</p>
                    </div>
                    <div className="row-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          const name = prompt('Nombre de división', division.name);
                          if (!name) return;
                          const seasonYear = prompt('Temporada', division.seasonYear);
                          if (!seasonYear) return;
                          withLoad(async () => {
                            await api.admin.updateDivision(division.id, { name, seasonYear: Number(seasonYear) });
                            await loadDivisions();
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => {
                          if (!confirm('¿Eliminar división y datos asociados?')) return;
                          withLoad(async () => {
                            await api.admin.deleteDivision(division.id);
                            await loadDivisions();
                          });
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="section-access">
                    <h4>Acceso de entrenadores</h4>
                    {division.trainerAccess?.length > 0 ? (
                      <ul>
                        {division.trainerAccess.map((access) => (
                          <li key={access.id}>
                            {access.trainer.name}
                            <button
                              className="btn-small"
                              onClick={() =>
                                withLoad(async () => {
                                  await api.admin.revokeTrainerDivisionAccess(access.id);
                                  await loadDivisions();
                                })
                              }
                            >
                              Revocar
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Sin entrenadores asignados</p>
                    )}
                    <div className="grant-access">
                      <select
                        onChange={(e) => {
                          if (!e.target.value) return;
                          withLoad(async () => {
                            await api.admin.grantTrainerDivisionAccess({
                              trainerId: Number(e.target.value),
                              divisionId: division.id,
                            });
                            await loadDivisions();
                          });
                          e.target.value = '';
                        }}
                      >
                        <option value="">Asignar entrenador...</option>
                        {trainers.map((trainer) => (
                          <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'players' && (
          <div className="tab-content">
            <h2>Gestión de jugadoras</h2>
            {filterRow}
            <div className="filters-actions">
              <button className="btn-secondary" type="button" onClick={() => withLoad(async () => loadPlayers(filters.divisionId))}>
                Aplicar filtros
              </button>
            </div>

            <div className="data-table">
              {players.map((player) => (
                <div className="data-row" key={player.id}>
                  <div className="data-info">
                    <h3>{player.fullName}</h3>
                    <p>{divisionMap[player.divisionId]?.name || 'División'} | {player.birthYear} | {player.active ? 'Activa' : 'Inactiva'}</p>
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const fullName = prompt('Nombre completo', player.fullName);
                        if (!fullName) return;
                        const birthYear = prompt('Año de nacimiento', player.birthYear);
                        if (!birthYear) return;
                        const active = confirm('Aceptar para ACTIVA. Cancelar para INACTIVA.');
                        withLoad(async () => {
                          await api.admin.updatePlayer(player.id, {
                            fullName,
                            birthYear: Number(birthYear),
                            divisionId: player.divisionId,
                            active,
                          });
                          await loadPlayers(filters.divisionId);
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => {
                        if (!confirm('¿Eliminar jugadora?')) return;
                        withLoad(async () => {
                          await api.admin.deletePlayer(player.id);
                          await loadPlayers(filters.divisionId);
                        });
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="tab-content">
            <h2>Fechas de entrenamiento</h2>
            {filterRow}
            <div className="filters-actions">
              <button className="btn-secondary" type="button" onClick={() => withLoad(async () => loadSessions(filters.divisionId, filters.month))}>
                Aplicar filtros
              </button>
            </div>

            <div className="data-table">
              {sessions.map((session) => (
                <div className="data-row" key={session.id}>
                  <div className="data-info">
                    <h3>{dateLabel(session.date)}</h3>
                    <p>{divisionMap[session.divisionId]?.name || 'División'} | Mes {session.month} | Registros {session._count.attendance}</p>
                    {session.notes && <p>{session.notes}</p>}
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const date = prompt('Fecha (YYYY-MM-DD)', dateInput(session.date));
                        if (!date) return;
                        const notes = prompt('Notas', session.notes || '') || '';
                        withLoad(async () => {
                          await api.admin.updateTrainingSession(session.id, { date, notes });
                          await loadSessions(filters.divisionId, filters.month);
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => {
                        if (!confirm('¿Eliminar fecha de entrenamiento?')) return;
                        withLoad(async () => {
                          await api.admin.deleteTrainingSession(session.id);
                          await loadSessions(filters.divisionId, filters.month);
                        });
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'attendance' && (
          <div className="tab-content">
            <h2>Carga de asistencia</h2>
            {filterRow}
            <div className="filters-actions">
              <button className="btn-secondary" type="button" onClick={() => withLoad(loadMatrix)}>Cargar planilla</button>
              <button className="btn-primary" type="button" onClick={saveAttendance}>Guardar cambios</button>
            </div>

            {matrix && matrix.sessions.length > 0 ? (
              <div className="attendance-grid-wrapper">
                <table className="attendance-grid">
                  <thead>
                    <tr>
                      <th>Jugadora</th>
                      {matrix.sessions.map((session) => (
                        <th key={session.id}>{dateLabel(session.date)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.players.map((player) => (
                      <tr key={player.id}>
                        <td>
                          {player.fullName}
                          {!player.active && <span className="inactive-badge">Inactiva</span>}
                        </td>
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
              <p>Seleccioná una división y cargá la planilla.</p>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div className="tab-content reports-tab">
            <h2>Reportes</h2>
            {filterRow}
            <div className="filters-actions">
              <button className="btn-secondary" type="button" onClick={() => withLoad(loadReport)}>Ver reporte</button>
              <button className="btn-primary" type="button" onClick={exportCsv}>Exportar CSV</button>
            </div>

            {report && (
              <div className="report-content">
                <div className="summary-grid">
                  <div className="summary-card"><h3>Divisiones</h3><p>{report.summary.totalDivisions}</p></div>
                  <div className="summary-card"><h3>Jugadoras</h3><p>{report.summary.totalPlayers}</p></div>
                  <div className="summary-card"><h3>Fechas</h3><p>{report.summary.totalSessions}</p></div>
                  <div className="summary-card"><h3>Registros</h3><p>{report.summary.totalRecords}</p></div>
                </div>

                <section className="report-block">
                  <h3>Por jugadora</h3>
                  <div className="table-scroll">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Jugadora</th><th>División</th><th>Presente</th><th>Tarde</th><th>Justificada</th><th>Ausente</th><th>% Asistencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.byPlayer.map((player) => (
                          <tr key={player.playerId}>
                            <td>{player.fullName}</td><td>{player.divisionName}</td><td>{player.PRESENTE}</td><td>{player.TARDE}</td><td>{player.JUSTIFICADA}</td><td>{player.AUSENTE}</td><td>{player.attendancePercentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="report-block">
                  <h3>Totales por fecha</h3>
                  <div className="table-scroll">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Fecha</th><th>División</th><th>Presente</th><th>Tarde</th><th>Justificada</th><th>Ausente</th><th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.totalsByDate.map((item) => (
                          <tr key={item.trainingSessionId}>
                            <td>{dateLabel(item.date)}</td><td>{item.divisionName}</td><td>{item.totals.PRESENTE}</td><td>{item.totals.TARDE}</td><td>{item.totals.JUSTIFICADA}</td><td>{item.totals.AUSENTE}</td><td>{item.totalRecords}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="report-block">
                  <h3>Ranking por división</h3>
                  <div className="ranking-grid">
                    {report.ranking.map((rank) => (
                      <div key={rank.divisionId} className="ranking-card">
                        <h4>{rank.divisionName} - {rank.seasonYear}</h4>
                        <ol>
                          {rank.players.slice(0, 10).map((player) => (
                            <li key={player.playerId}>{player.fullName} ({player.attendancePercentage}%)</li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {createModalTab && (
          <div className="modal-overlay" onClick={closeCreateModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-copy">
                  <h3>{CREATE_MODAL_COPY[createModalTab].title}</h3>
                  <p>Completá los datos para crear un nuevo registro.</p>
                </div>
                <button type="button" className="modal-close" onClick={closeCreateModal} aria-label="Cerrar modal">
                  x
                </button>
              </div>
              <div className="modal-body">{renderCreateModalForm()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
