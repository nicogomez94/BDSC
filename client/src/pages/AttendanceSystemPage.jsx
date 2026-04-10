import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import './AdminPanel.css';
import './AttendanceSystemPage.css';

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

const AttendanceSystemPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [divisions, setDivisions] = useState([]);
  const [filters, setFilters] = useState({ divisionId: '', month: '' });
  const [matrix, setMatrix] = useState(null);

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
      setError(err.message || 'No se pudo cargar asistencia.');
    } finally {
      setLoading(false);
    }
  };

  const loadDivisions = async () => {
    const data = await api.siteContent.getAttendanceDivisions();
    const normalizedDivisions = Array.isArray(data) ? data : [];
    setDivisions(normalizedDivisions);

    if (normalizedDivisions.length === 0) {
      setMatrix(null);
      return;
    }

    const selectedDivisionId = filters.divisionId || String(normalizedDivisions[0].id);
    if (!filters.divisionId) {
      setFilters((current) => ({ ...current, divisionId: selectedDivisionId }));
    }

    const initialMatrix = await api.siteContent.getAttendanceMatrix({
      divisionId: selectedDivisionId,
      month: filters.month || undefined,
    });
    setMatrix(initialMatrix);
  };

  const loadMatrix = async () => {
    if (!filters.divisionId) {
      setMatrix(null);
      return;
    }
    const data = await api.siteContent.getAttendanceMatrix({
      divisionId: filters.divisionId,
      month: filters.month || undefined,
    });
    setMatrix(data);
  };

  useEffect(() => {
    withLoad(loadDivisions);
  }, []);

  const resolveCellStatus = (playerId, sessionId) => matrix?.matrix?.[playerId]?.[sessionId]?.status || '-';

  return (
    <div className="admin-panel attendance-system-page">
      <div className="container">
        <div className="tab-content">
          <h2>Carga de asistencia</h2>

          <div className="filters-row">
            <div className="form-group">
              <label>División</label>
              <select
                value={filters.divisionId}
                onChange={(e) => setFilters((current) => ({ ...current, divisionId: e.target.value }))}
              >
                <option value="">Seleccionar división</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name} - {division.seasonYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mes</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters((current) => ({ ...current, month: e.target.value }))}
              >
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
            <button className="btn-secondary" type="button" onClick={() => withLoad(loadMatrix)}>
              Cargar planilla
            </button>
          </div>

          {loading && <div className="loading">Cargando...</div>}
          {error && <div className="error-message">{error}</div>}

          {matrix && matrix.players?.length > 0 ? (
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
                      <td>
                        {player.fullName}
                        {!player.active && <span className="inactive-badge">Inactiva</span>}
                      </td>
                      <td>{player.grade || '-'}</td>
                      <td>{player.birthYear || '-'}</td>
                      {matrix.sessions.map((session) => (
                        <td key={`${player.id}-${session.id}`}>
                          <span className="attendance-readonly-status">{resolveCellStatus(player.id, session.id)}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {matrix.sessions?.length === 0 && (
                <p className="attendance-empty">No hay fechas cargadas para la división seleccionada.</p>
              )}
            </div>
          ) : (
            <p className="attendance-empty">
              {filters.divisionId
                ? `No hay jugadoras para ${divisionMap[Number(filters.divisionId)]?.name || 'la división seleccionada'}.`
                : 'Seleccioná una división para ver la planilla.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSystemPage;
