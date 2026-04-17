import { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserTie,
  faFolderTree,
  faLayerGroup,
  faPersonDress,
  faCalendarDay,
  faClipboardCheck,
  faChartColumn,
  faUserGear,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../services/api';
import { DEBUG_MODE, DEBUG_PREFILL } from '../config/debug';
import AdminVirtualLibraryTab from '../components/AdminVirtualLibraryTab';
import AdminSiteContentTab from '../components/AdminSiteContentTab';
import RichTextEditor from '../components/RichTextEditor';
import './AdminPanel.css';

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
const TRAINER_TYPE = {
  ENTRENADOR: 'ENTRENADOR',
  PREPARADOR_FISICO: 'PREPARADOR_FISICO',
};
const CREATE_TABS = ['trainers', 'physicalTrainers', 'sections', 'divisions', 'players', 'sessions'];
const CREATE_MODAL_COPY = {
  trainers: { title: 'Crear entrenador', button: 'Nuevo entrenador' },
  physicalTrainers: { title: 'Crear preparador físico', button: 'Nuevo preparador físico' },
  sections: { title: 'Crear documento', button: 'Nuevo documento' },
  divisions: { title: 'Crear división', button: 'Nueva división' },
  players: { title: 'Crear jugadora', button: 'Nueva jugadora' },
  sessions: { title: 'Crear fecha', button: 'Nueva fecha' },
};
const TOAST_TIMEOUT_MS = 3500;
const PANEL_TABS = [
  { key: 'trainers', label: 'Entrenadores', icon: faUserTie },
  { key: 'physicalTrainers', label: 'Preparadores físicos', icon: faUserTie },
  { key: 'sections', label: 'Documentos', icon: faFolderTree },
  { key: 'siteContent', label: 'Menú principal', icon: faFolderTree },
  { key: 'virtualLibrary', label: 'Biblioteca virtual', icon: faBookOpen },
  { key: 'divisions', label: 'Divisiones', icon: faLayerGroup },
  { key: 'players', label: 'Jugadoras', icon: faPersonDress },
  { key: 'sessions', label: 'Fechas', icon: faCalendarDay },
  { key: 'attendance', label: 'Asistencia', icon: faClipboardCheck },
  { key: 'reports', label: 'Reportes', icon: faChartColumn },
];
const GRADE_OPTIONS = [
  'K4',
  'K5',
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  'M1',
  'M2',
  'M3',
  'S4',
  'S5',
  'S6',
  'U',
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
const createEmptyTrainerForm = (type = TRAINER_TYPE.ENTRENADOR) => ({
  name: '',
  type,
  bio: '',
  specialty: '',
  photoUrl: '',
  cvUrl: '',
  email: '',
  password: '',
});
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });
const sanitizeFilename = (value, fallback = 'archivo') => {
  const normalized = (value || fallback).trim().toLowerCase().replace(/\s+/g, '-');
  return normalized.replace(/[^a-z0-9-_]/g, '') || fallback;
};

const normalizeImportHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '');

const normalizeImportDate = (value) => {
  const raw = String(value || '').trim();
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!slashMatch) return raw;
  const [, dd, mm, yyyy] = slashMatch;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};

const normalizeImportStatus = (value) => {
  const raw = String(value || '').trim().toUpperCase();
  const map = {
    P: 'PRESENTE',
    A: 'AUSENTE',
    J: 'JUSTIFICADA',
    T: 'TARDE',
    SF: 'SAF',
    SU: 'SUSPENDIDO',
    SUSP: 'SUSPENDIDO',
  };
  return map[raw] || raw;
};

const normalizeImportActive = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return undefined;
  if (['si', 'sí', 'true', '1', 'activo', 'activa'].includes(raw)) return true;
  if (['no', 'false', '0', 'inactivo', 'inactiva'].includes(raw)) return false;
  return undefined;
};

const parseCsvText = (text) => {
  const content = String(text || '').replace(/^\uFEFF/, '');
  const firstLine = content.split(/\r?\n/, 1)[0] || '';
  const delimiter = firstLine.includes(';') ? ';' : ',';
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows
    .map((currentRow) => currentRow.map((cell) => String(cell || '').trim()))
    .filter((currentRow) => currentRow.some((cell) => cell));
};

const parseAttendanceImportRows = (csvText) => {
  const rows = parseCsvText(csvText);
  if (rows.length < 2) {
    throw new Error('La planilla está vacía o no tiene encabezados.');
  }

  const headers = rows[0].map(normalizeImportHeader);
  const indexByField = {
    fullName: headers.findIndex((header) => ['fullname', 'nombre', 'jugadora'].includes(header)),
    birthYear: headers.findIndex((header) => ['birthyear', 'anionacimiento', 'anonacimiento', 'anodenacimiento'].includes(header)),
    date: headers.findIndex((header) => ['date', 'fecha'].includes(header)),
    status: headers.findIndex((header) => ['status', 'estado'].includes(header)),
    observation: headers.findIndex((header) => ['observation', 'observacion', 'obs'].includes(header)),
    notes: headers.findIndex((header) => ['notes', 'nota', 'notas'].includes(header)),
    active: headers.findIndex((header) => ['active', 'activa', 'activo'].includes(header)),
  };

  const requiredFields = ['fullName', 'birthYear', 'date', 'status'];
  const missing = requiredFields.filter((field) => indexByField[field] < 0);
  if (missing.length > 0) {
    throw new Error('Faltan columnas obligatorias en CSV: fullName/nombre, birthYear/añoNacimiento, date/fecha, status/estado.');
  }

  return rows.slice(1).map((cells, index) => {
    const fullName = cells[indexByField.fullName];
    const birthYear = cells[indexByField.birthYear];
    const date = normalizeImportDate(cells[indexByField.date]);
    const status = normalizeImportStatus(cells[indexByField.status]);

    if (!fullName || !birthYear || !date || !status) {
      throw new Error(`Fila ${index + 2}: faltan datos obligatorios.`);
    }

    const birthYearNumber = Number(birthYear);
    if (Number.isNaN(birthYearNumber)) {
      throw new Error(`Fila ${index + 2}: birthYear/añoNacimiento debe ser numérico.`);
    }

    const parsed = {
      fullName,
      birthYear: birthYearNumber,
      date,
      status,
    };

    if (indexByField.observation >= 0 && cells[indexByField.observation]) {
      parsed.observation = cells[indexByField.observation];
    }
    if (indexByField.notes >= 0 && cells[indexByField.notes]) {
      parsed.notes = cells[indexByField.notes];
    }
    if (indexByField.active >= 0) {
      const active = normalizeImportActive(cells[indexByField.active]);
      if (active !== undefined) parsed.active = active;
    }

    return parsed;
  });
};

const AdminPanel = () => {
  const [tab, setTab] = useState('trainers');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [sections, setSections] = useState([]);
  const [siteContent, setSiteContent] = useState([]);
  const [virtualLibrary, setVirtualLibrary] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [matrix, setMatrix] = useState(null);
  const [changes, setChanges] = useState({});
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({ divisionId: '', month: '', year: '', grade: '' });
  const [createModalTab, setCreateModalTab] = useState(null);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingDivision, setEditingDivision] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [trainerCvFileName, setTrainerCvFileName] = useState('');
  const [isAttendanceGuideOpen, setIsAttendanceGuideOpen] = useState(false);
  const attendanceImportInputRef = useRef(null);
  const attendanceTopScrollRef = useRef(null);
  const attendanceTopScrollContentRef = useRef(null);
  const attendanceGridWrapperRef = useRef(null);
  const attendanceGridRef = useRef(null);
  const toastIdRef = useRef(0);

  const [trainerForm, setTrainerForm] = useState(
    DEBUG_MODE
      ? { ...createEmptyTrainerForm(), ...DEBUG_PREFILL.trainerForm }
      : createEmptyTrainerForm()
  );
  const [sectionForm, setSectionForm] = useState(
    DEBUG_MODE ? { ...DEBUG_PREFILL.sectionForm } : { title: '', content: '' }
  );
  const [divisionForm, setDivisionForm] = useState({ name: '', seasonYear: new Date().getFullYear() });
  const [playerForm, setPlayerForm] = useState({
    fullName: '',
    birthYear: '',
    grade: '',
    divisionId: '',
    active: true,
    phone: '',
    email: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
  });
  const [sessionForm, setSessionForm] = useState({ divisionId: '', date: '', notes: '' });

  const divisionMap = useMemo(() => {
    const map = {};
    for (const division of divisions) map[division.id] = division;
    return map;
  }, [divisions]);
  const attendanceYearOptions = useMemo(() => {
    if (!Array.isArray(matrix?.sessions)) return [];
    const years = new Set();
    matrix.sessions.forEach((session) => {
      const year = getUtcDateParts(session.date)?.year;
      if (year) years.add(String(year));
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [matrix]);
  const attendanceGradeOptions = useMemo(() => {
    if (!Array.isArray(matrix?.players)) return [];
    const grades = new Set();
    matrix.players.forEach((player) => {
      const grade = String(player.grade || '').trim();
      if (grade) grades.add(grade);
    });
    const preferredOrder = new Map(GRADE_OPTIONS.map((grade, index) => [grade, index]));
    return Array.from(grades).sort((a, b) => {
      const aOrder = preferredOrder.has(a) ? preferredOrder.get(a) : Number.MAX_SAFE_INTEGER;
      const bOrder = preferredOrder.has(b) ? preferredOrder.get(b) : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.localeCompare(b, 'es');
    });
  }, [matrix]);
  const filteredAttendanceSessions = useMemo(() => {
    if (!Array.isArray(matrix?.sessions)) return [];
    if (!filters.year) return matrix.sessions;
    return matrix.sessions.filter((session) => String(getUtcDateParts(session.date)?.year || '') === String(filters.year));
  }, [filters.year, matrix]);
  const filteredAttendancePlayers = useMemo(() => {
    if (!Array.isArray(matrix?.players)) return [];
    if (!filters.grade) return matrix.players;
    return matrix.players.filter((player) => String(player.grade || '').trim() === String(filters.grade));
  }, [filters.grade, matrix]);

  useEffect(() => {
    const topScroll = attendanceTopScrollRef.current;
    const topScrollContent = attendanceTopScrollContentRef.current;
    const gridWrapper = attendanceGridWrapperRef.current;
    const grid = attendanceGridRef.current;

    if (!topScroll || !topScrollContent || !gridWrapper || !grid) return undefined;

    let syncingFromTop = false;
    let syncingFromBottom = false;

    const syncWidths = () => {
      topScrollContent.style.width = `${grid.scrollWidth}px`;
      topScroll.scrollLeft = gridWrapper.scrollLeft;
    };

    const handleTopScroll = () => {
      if (syncingFromBottom) return;
      syncingFromTop = true;
      gridWrapper.scrollLeft = topScroll.scrollLeft;
      syncingFromTop = false;
    };

    const handleBottomScroll = () => {
      if (syncingFromTop) return;
      syncingFromBottom = true;
      topScroll.scrollLeft = gridWrapper.scrollLeft;
      syncingFromBottom = false;
    };

    syncWidths();
    topScroll.addEventListener('scroll', handleTopScroll);
    gridWrapper.addEventListener('scroll', handleBottomScroll);

    const resizeObserver = new ResizeObserver(syncWidths);
    resizeObserver.observe(gridWrapper);
    resizeObserver.observe(grid);
    window.addEventListener('resize', syncWidths);

    return () => {
      topScroll.removeEventListener('scroll', handleTopScroll);
      gridWrapper.removeEventListener('scroll', handleBottomScroll);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncWidths);
    };
  }, [tab, matrix, filteredAttendanceSessions.length, filteredAttendancePlayers.length]);

  const headCoaches = useMemo(
    () => trainers.filter((trainer) => (trainer.type || TRAINER_TYPE.ENTRENADOR) === TRAINER_TYPE.ENTRENADOR),
    [trainers]
  );
  const physicalTrainers = useMemo(
    () => trainers.filter((trainer) => trainer.type === TRAINER_TYPE.PREPARADOR_FISICO),
    [trainers]
  );

  const showToast = (message, tone = 'success') => {
    const content = String(message || '').trim();
    if (!content) return;
    const id = toastIdRef.current + 1;
    toastIdRef.current = id;
    setToasts((current) => [...current, { id, message: content, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_TIMEOUT_MS);
  };
  const showSuccessMessage = (message) => showToast(message, 'success');
  const showErrorMessage = (message) => showToast(message, 'error');

  const withLoad = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      showErrorMessage(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainers = async () => setTrainers(await api.admin.getTrainers());
  const loadSections = async () => setSections(await api.admin.getSections());
  const loadSiteContent = async () => setSiteContent(await api.admin.getSiteContent());
  const loadVirtualLibrary = async () => setVirtualLibrary(await api.admin.getVirtualLibrary());
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
      if (tab === 'siteContent') await loadSiteContent();
      if (tab === 'virtualLibrary') await loadVirtualLibrary();
      if (tab === 'players') await loadPlayers(filters.divisionId);
      if (tab === 'sessions') await loadSessions(filters.divisionId, filters.month);
      if (tab === 'attendance') await loadMatrix();
      if (tab === 'reports') await loadReport();
    });
  }, [tab]);

  useEffect(() => {
    setCreateModalTab(null);
    setEditingTrainer(null);
    setEditingSection(null);
    setEditingDivision(null);
    setEditingPlayer(null);
    setEditingSession(null);
    setTrainerCvFileName('');
  }, [tab]);

  const handleSaveTrainer = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isEditing = Boolean(editingTrainer);
    try {
      if (isEditing) {
        await api.admin.updateTrainer(editingTrainer.id, {
          name: trainerForm.name,
          type: trainerForm.type,
          bio: trainerForm.bio,
          specialty: trainerForm.specialty,
          photoUrl: trainerForm.photoUrl,
          cvUrl: trainerForm.cvUrl,
          email: trainerForm.email,
          password: trainerForm.password,
        });
      } else {
        await api.admin.createTrainer(trainerForm);
      }
      setTrainerForm(
        DEBUG_MODE
          ? { ...createEmptyTrainerForm(), ...DEBUG_PREFILL.trainerForm }
          : createEmptyTrainerForm()
      );
      setEditingTrainer(null);
      setCreateModalTab(null);
      setTrainerCvFileName('');
      await loadTrainers();
      showSuccessMessage(isEditing ? 'Entrenador actualizado correctamente.' : 'Entrenador creado correctamente.');
    } catch (err) {
      showErrorMessage(err.message || 'Error al guardar entrenador');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerFormImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageDataUrl = await fileToDataUrl(file);
      setTrainerForm((current) => ({ ...current, photoUrl: imageDataUrl }));
    } catch (err) {
      showErrorMessage(err.message || 'No se pudo cargar la imagen.');
    }
    e.target.value = '';
  };

  const handleTrainerFormCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const cvDataUrl = await fileToDataUrl(file);
      setTrainerForm((current) => ({ ...current, cvUrl: cvDataUrl }));
      setTrainerCvFileName(file.name);
    } catch (err) {
      showErrorMessage(err.message || 'No se pudo cargar el CV.');
    }
  };

  const handleDownloadTrainerCv = (trainer) => {
    if (!trainer?.cvUrl) return;
    const fileName = `${sanitizeFilename(trainer.name || 'trainer')}-cv.pdf`;
    const anchor = document.createElement('a');
    anchor.href = trainer.cvUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleDeleteTrainer = async (id) => {
    if (!confirm('¿Eliminar entrenador?')) return;
    await withLoad(async () => {
      await api.admin.deleteTrainer(id);
      await loadTrainers();
    });
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    const normalizedContent = String(sectionForm.content || '').trim();
    if (!normalizedContent || normalizedContent === '<p></p>' || normalizedContent === '<p><br></p>') {
      showErrorMessage('El contenido es obligatorio.');
      return;
    }
    await withLoad(async () => {
      const isEditing = Boolean(editingSection);
      if (isEditing) {
        await api.admin.updateSection(editingSection.id, { ...sectionForm, content: normalizedContent });
      } else {
        await api.admin.createSection({ ...sectionForm, content: normalizedContent });
      }
      setSectionForm(DEBUG_MODE ? { ...DEBUG_PREFILL.sectionForm } : { title: '', content: '' });
      setEditingSection(null);
      setCreateModalTab(null);
      await loadSections();
      showSuccessMessage(isEditing ? 'Documento actualizado correctamente.' : 'Documento creado correctamente.');
    });
  };

  const handleUploadSectionImage = async (file) => {
    if (!file) throw new Error('Seleccioná una imagen.');
    return api.admin.uploadSiteContentImage(file);
  };

  const handleUploadSectionPdf = async (file) => {
    if (!file) throw new Error('Seleccioná un PDF.');
    return api.admin.uploadSiteContentPdf(file);
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('¿Eliminar documento?')) return;
    await withLoad(async () => {
      await api.admin.deleteSection(id);
      await loadSections();
    });
  };

  const handleSaveDivision = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      const isEditing = Boolean(editingDivision);
      if (isEditing) {
        await api.admin.updateDivision(editingDivision.id, {
          name: divisionForm.name,
          seasonYear: Number(divisionForm.seasonYear),
        });
      } else {
        await api.admin.createDivision({ name: divisionForm.name, seasonYear: Number(divisionForm.seasonYear) });
      }
      setDivisionForm({ name: '', seasonYear: new Date().getFullYear() });
      setEditingDivision(null);
      setCreateModalTab(null);
      await loadDivisions();
      showSuccessMessage(isEditing ? 'División actualizada correctamente.' : 'División creada correctamente.');
    });
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      const isEditing = Boolean(editingPlayer);
      const payload = {
        fullName: playerForm.fullName,
        birthYear: Number(playerForm.birthYear),
        grade: playerForm.grade || null,
        divisionId: Number(playerForm.divisionId),
        active: playerForm.active,
        phone: playerForm.phone || null,
        email: playerForm.email || null,
        parentName: playerForm.parentName || null,
        parentEmail: playerForm.parentEmail || null,
        parentPhone: playerForm.parentPhone || null,
      };
      if (isEditing) {
        await api.admin.updatePlayer(editingPlayer.id, payload);
      } else {
        await api.admin.createPlayer(payload);
      }
      setPlayerForm({
        fullName: '',
        birthYear: '',
        grade: '',
        divisionId: '',
        active: true,
        phone: '',
        email: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
      });
      setEditingPlayer(null);
      setCreateModalTab(null);
      await loadPlayers(filters.divisionId);
      showSuccessMessage(isEditing ? 'Jugadora actualizada correctamente.' : 'Jugadora creada correctamente.');
    });
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    await withLoad(async () => {
      const isEditing = Boolean(editingSession);
      if (isEditing) {
        await api.admin.updateTrainingSession(editingSession.id, {
          date: sessionForm.date,
          notes: sessionForm.notes,
        });
      } else {
        await api.admin.createTrainingSession({
          divisionId: Number(sessionForm.divisionId),
          date: sessionForm.date,
          notes: sessionForm.notes,
        });
      }
      setSessionForm({ divisionId: '', date: '', notes: '' });
      setEditingSession(null);
      setCreateModalTab(null);
      await loadSessions(filters.divisionId, filters.month);
      showSuccessMessage(isEditing ? 'Fecha actualizada correctamente.' : 'Fecha creada correctamente.');
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
      showSuccessMessage('Asistencia guardada correctamente.');
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
  const exportAttendanceExcel = async () => {
    if (!filters.divisionId) {
      showErrorMessage('Seleccioná una división antes de exportar la planilla.');
      return;
    }

    if (!matrix || !Array.isArray(matrix.players) || !Array.isArray(matrix.sessions) || matrix.sessions.length === 0) {
      showErrorMessage('Cargá una planilla con fechas antes de exportar.');
      return;
    }

    if (filteredAttendanceSessions.length === 0 || filteredAttendancePlayers.length === 0) {
      showErrorMessage('No hay datos para exportar con los filtros seleccionados.');
      return;
    }

    const headers = ['Jugadora', 'Grado', 'Año de nacimiento', ...filteredAttendanceSessions.map((session) => dateLabel(session.date))];
    const rows = filteredAttendancePlayers.map((player) => [
      player.active ? player.fullName : `${player.fullName} (Inactiva)`,
      player.grade || '-',
      player.birthYear || '-',
      ...filteredAttendanceSessions.map((session) => cellValue(player.id, session.id) || '-'),
    ]);

    const xlsxModule = await import('xlsx');
    const XLSX = xlsxModule.default || xlsxModule;
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [{ wch: 36 }, { wch: 14 }, { wch: 18 }, ...filteredAttendanceSessions.map(() => ({ wch: 14 }))];

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

  const openAttendanceImportPicker = () => {
    attendanceImportInputRef.current?.click();
  };
  const openAttendanceGuideModal = () => setIsAttendanceGuideOpen(true);
  const closeAttendanceGuideModal = () => setIsAttendanceGuideOpen(false);

  const handleImportAttendanceCsv = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!filters.divisionId) {
      showErrorMessage('Seleccioná una división antes de importar planilla.');
      return;
    }

    await withLoad(async () => {
      const text = await file.text();
      const rows = parseAttendanceImportRows(text);
      await api.admin.importAttendanceRows({
        divisionId: Number(filters.divisionId),
        rows,
      });
      await loadMatrix();
      showSuccessMessage(`Planilla importada correctamente (${rows.length} filas).`);
    });
  };
  const openCreateModal = () => {
    setEditingSection(null);
    setEditingDivision(null);
    setEditingPlayer(null);
    setEditingSession(null);
    if (tab === 'trainers' || tab === 'physicalTrainers') {
      const isPhysicalTab = tab === 'physicalTrainers';
      setEditingTrainer(null);
      const defaultType = isPhysicalTab ? TRAINER_TYPE.PREPARADOR_FISICO : TRAINER_TYPE.ENTRENADOR;
      setTrainerForm(
        DEBUG_MODE
          ? { ...createEmptyTrainerForm(defaultType), ...DEBUG_PREFILL.trainerForm, type: defaultType }
          : createEmptyTrainerForm(defaultType)
      );
      setTrainerCvFileName('');
    }
    if (tab === 'divisions') {
      setDivisionForm({ name: '', seasonYear: new Date().getFullYear() });
    }
    if (tab === 'players') {
      setPlayerForm({
        fullName: '',
        birthYear: '',
        grade: '',
        divisionId: '',
        active: true,
        phone: '',
        email: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
      });
    }
    if (tab === 'sessions') {
      setSessionForm({ divisionId: '', date: '', notes: '' });
    }
    if (tab === 'sections') {
      setSectionForm(DEBUG_MODE ? { ...DEBUG_PREFILL.sectionForm } : { title: '', content: '' });
    }
    setCreateModalTab(tab);
  };
  const closeCreateModal = () => {
    setCreateModalTab(null);
    setEditingTrainer(null);
    setEditingSection(null);
    setEditingDivision(null);
    setEditingPlayer(null);
    setEditingSession(null);
    setTrainerCvFileName('');
  };
  const openEditTrainerModal = (trainer) => {
    setEditingSection(null);
    setEditingDivision(null);
    setEditingPlayer(null);
    setEditingSession(null);
    setEditingTrainer(trainer);
    setTrainerCvFileName('');
    setTrainerForm({
      name: trainer.name || '',
      type: trainer.type || TRAINER_TYPE.ENTRENADOR,
      bio: trainer.bio || '',
      specialty: trainer.specialty || '',
      photoUrl: trainer.photoUrl || '',
      cvUrl: trainer.cvUrl || '',
      email: trainer.user?.email || '',
      password: '',
    });
    setCreateModalTab('trainers');
  };
  const openEditSectionModal = (section) => {
    setEditingTrainer(null);
    setEditingDivision(null);
    setEditingPlayer(null);
    setEditingSession(null);
    setEditingSection(section);
    setSectionForm({
      title: section.title || '',
      content: section.content || '',
    });
    setCreateModalTab('sections');
  };
  const openEditDivisionModal = (division) => {
    setEditingTrainer(null);
    setEditingSection(null);
    setEditingPlayer(null);
    setEditingSession(null);
    setEditingDivision(division);
    setDivisionForm({
      name: division.name || '',
      seasonYear: division.seasonYear || new Date().getFullYear(),
    });
    setCreateModalTab('divisions');
  };
  const openEditPlayerModal = (player) => {
    setEditingTrainer(null);
    setEditingSection(null);
    setEditingDivision(null);
    setEditingSession(null);
    setEditingPlayer(player);
    setPlayerForm({
      fullName: player.fullName || '',
      birthYear: player.birthYear || '',
      grade: player.grade || '',
      divisionId: String(player.divisionId || ''),
      active: Boolean(player.active),
      phone: player.phone || '',
      email: player.email || '',
      parentName: player.parentName || '',
      parentEmail: player.parentEmail || '',
      parentPhone: player.parentPhone || '',
    });
    setCreateModalTab('players');
  };
  const openEditSessionModal = (session) => {
    setEditingTrainer(null);
    setEditingSection(null);
    setEditingDivision(null);
    setEditingPlayer(null);
    setEditingSession(session);
    setSessionForm({
      divisionId: String(session.divisionId || ''),
      date: dateInput(session.date),
      notes: session.notes || '',
    });
    setCreateModalTab('sessions');
  };
  const canCreateInTab = CREATE_TABS.includes(tab);
  const isEditingStandardEntity = Boolean(editingSection || editingDivision || editingPlayer || editingSession);
  const modalTitle = (() => {
    if ((createModalTab === 'trainers' || createModalTab === 'physicalTrainers') && editingTrainer) {
      return 'Editar perfil técnico';
    }
    if (createModalTab === 'sections' && editingSection) return 'Editar documento';
    if (createModalTab === 'divisions' && editingDivision) return 'Editar división';
    if (createModalTab === 'players' && editingPlayer) return 'Editar jugadora';
    if (createModalTab === 'sessions' && editingSession) return 'Editar fecha';
    return createModalTab ? CREATE_MODAL_COPY[createModalTab].title : '';
  })();
  const modalDescription = (() => {
    if ((createModalTab === 'trainers' || createModalTab === 'physicalTrainers') && editingTrainer) {
      return 'Actualizá los datos del perfil.';
    }
    if (isEditingStandardEntity) return 'Actualizá los datos del registro.';
    return 'Completá los datos para crear un nuevo registro.';
  })();

  const renderCreateModalForm = () => {
    if (createModalTab === 'trainers' || createModalTab === 'physicalTrainers') {
      const roleLabel = trainerForm.type === TRAINER_TYPE.PREPARADOR_FISICO ? 'preparador físico' : 'entrenador';
      return (
        <form onSubmit={handleSaveTrainer} className="admin-form">
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
          <div className="form-group">
            <label>Foto (URL)</label>
            <input
              type="url"
              value={trainerForm.photoUrl}
              onChange={(e) => setTrainerForm({ ...trainerForm, photoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="form-group">
            <label>Foto (subir archivo)</label>
            <input type="file" accept="image/*" onChange={handleTrainerFormImageUpload} />
          </div>
          <div className="form-group">
            <label>CV (subir archivo)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleTrainerFormCvUpload}
            />
            {trainerCvFileName && <p>Archivo seleccionado: {trainerCvFileName}</p>}
            {!trainerCvFileName && editingTrainer?.cvUrl && <p>CV actual cargado. Si no seleccionás otro archivo, se mantiene este.</p>}
            {editingTrainer?.cvUrl && (
              <button type="button" className="btn-secondary" onClick={() => handleDownloadTrainerCv(editingTrainer)}>
                Descargar CV actual
              </button>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{editingTrainer ? 'Email (opcional para cambiar)' : 'Email'}</label>
              <input
                type="email"
                value={trainerForm.email}
                onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                placeholder={editingTrainer && !trainerForm.email ? 'Sin email asociado' : ''}
              />
            </div>
            <div className="form-group">
              <label>{editingTrainer ? 'Contraseña nueva (opcional)' : 'Contraseña'}</label>
              <input
                type="password"
                value={trainerForm.password}
                onChange={(e) => setTrainerForm({ ...trainerForm, password: e.target.value })}
                placeholder={editingTrainer ? 'Dejá en blanco para mantener la actual' : ''}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">{editingTrainer ? 'Guardar cambios' : `Crear ${roleLabel}`}</button>
        </form>
      );
    }

    if (createModalTab === 'sections') {
      return (
        <form onSubmit={handleSaveSection} className="admin-form">
          <div className="form-group">
            <label>Título</label>
            <input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Contenido</label>
            <RichTextEditor
              value={sectionForm.content}
              onChange={(content) => setSectionForm({ ...sectionForm, content })}
              onUploadImage={handleUploadSectionImage}
              onUploadPdf={handleUploadSectionPdf}
            />
          </div>
          <button type="submit" className="btn-primary">{editingSection ? 'Guardar cambios' : 'Crear documento'}</button>
        </form>
      );
    }

    if (createModalTab === 'divisions') {
      return (
        <form onSubmit={handleSaveDivision} className="admin-form">
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
          <button type="submit" className="btn-primary">{editingDivision ? 'Guardar cambios' : 'Crear división'}</button>
        </form>
      );
    }

    if (createModalTab === 'players') {
      return (
        <form onSubmit={handleSavePlayer} className="admin-form admin-form-player">
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
          <div className="form-row form-row-single">
            <div className="form-group">
              <label>Grado</label>
              <select value={playerForm.grade} onChange={(e) => setPlayerForm({ ...playerForm, grade: e.target.value })}>
                <option value="">Seleccionar</option>
                {GRADE_OPTIONS.map((gradeOption) => (
                  <option key={gradeOption} value={gradeOption}>
                    {gradeOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" value={playerForm.phone} onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={playerForm.email} onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre padre/madre</label>
              <input value={playerForm.parentName} onChange={(e) => setPlayerForm({ ...playerForm, parentName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mail padre/madre</label>
              <input type="email" value={playerForm.parentEmail} onChange={(e) => setPlayerForm({ ...playerForm, parentEmail: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono padre/madre</label>
              <input type="tel" value={playerForm.parentPhone} onChange={(e) => setPlayerForm({ ...playerForm, parentPhone: e.target.value })} />
            </div>
          </div>
          <div className="form-row player-division-row">
            <div className="form-group">
              <label>División</label>
              <select value={playerForm.divisionId} onChange={(e) => setPlayerForm({ ...playerForm, divisionId: e.target.value })} required>
                <option value="">Seleccionar</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>{division.name} - {division.seasonYear}</option>
                ))}
              </select>
            </div>
            <div className="form-group checkbox-group player-active-group">
              <label className="active-toggle">
                <input type="checkbox" checked={playerForm.active} onChange={(e) => setPlayerForm({ ...playerForm, active: e.target.checked })} />
                <span>Activa</span>&nbsp;&nbsp;
                <span className="active-toggle-track" aria-hidden="true" />
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary">{editingPlayer ? 'Guardar cambios' : 'Crear jugadora'}</button>
        </form>
      );
    }

    if (createModalTab === 'sessions') {
      return (
        <form onSubmit={handleSaveSession} className="admin-form">
          <div className="form-row">
            {!editingSession && (
              <div className="form-group">
                <label>División</label>
                <select value={sessionForm.divisionId} onChange={(e) => setSessionForm({ ...sessionForm, divisionId: e.target.value })} required>
                  <option value="">Seleccionar</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>{division.name} - {division.seasonYear}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Notas</label>
            <input value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">{editingSession ? 'Guardar cambios' : 'Crear fecha'}</button>
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
      {toasts.length > 0 && (
        <div className="toast-stack" aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast-item toast-item-${toast.tone}`}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
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
              {headCoaches.map((trainer) => (
                <div className="data-row" key={trainer.id}>
                  <div className="data-info">
                    <h3>{trainer.name}</h3>
                    <p>{trainer.specialty || 'Sin especialidad'}</p>
                  </div>
                  <div className="row-actions">
                    {trainer.cvUrl && (
                      <button className="btn-secondary" onClick={() => handleDownloadTrainerCv(trainer)}>Descargar CV</button>
                    )}
                    <button className="btn-secondary" onClick={() => openEditTrainerModal(trainer)}>Editar</button>
                    <button className="btn-danger" onClick={() => handleDeleteTrainer(trainer.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'physicalTrainers' && (
          <div className="tab-content">
            <h2>Preparadores físicos</h2>
            <div className="data-table">
              {physicalTrainers.map((trainer) => (
                <div className="data-row" key={trainer.id}>
                  <div className="data-info">
                    <h3>{trainer.name}</h3>
                    <p>{trainer.specialty || 'Sin especialidad'}</p>
                  </div>
                  <div className="row-actions">
                    {trainer.cvUrl && (
                      <button className="btn-secondary" onClick={() => handleDownloadTrainerCv(trainer)}>Descargar CV</button>
                    )}
                    <button className="btn-secondary" onClick={() => openEditTrainerModal(trainer)}>Editar</button>
                    <button className="btn-danger" onClick={() => handleDeleteTrainer(trainer.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'sections' && (
          <div className="tab-content">
            <h2>Documentos</h2>
            <div className="sections-list">
              {sections.map((section) => (
                <div className="section-card" key={section.id}>
                  <div className="section-header">
                    <h3>{section.title}</h3>
                    <div className="row-actions">
                      <button className="btn-secondary" onClick={() => openEditSectionModal(section)}>Editar</button>
                      <button className="btn-danger" onClick={() => handleDeleteSection(section.id)}>Eliminar</button>
                    </div>
                  </div>
                  <div className="section-rich-content" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
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

        {tab === 'siteContent' && (
          <AdminSiteContentTab
            data={siteContent}
            onReload={loadSiteContent}
            withLoad={withLoad}
            onNotifySuccess={showSuccessMessage}
          />
        )}

        {tab === 'virtualLibrary' && (
          <AdminVirtualLibraryTab
            sections={virtualLibrary}
            onReload={loadVirtualLibrary}
            withLoad={withLoad}
            onNotifySuccess={showSuccessMessage}
          />
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
                        onClick={() => openEditDivisionModal(division)}
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
                    <p>
                      {divisionMap[player.divisionId]?.name || 'División'} | {player.birthYear}
                      {player.grade ? ` | Grado ${player.grade}` : ''}
                      {' | '}
                      {player.active ? 'Activa' : 'Inactiva'}
                    </p>
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => openEditPlayerModal(player)}
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
                      onClick={() => openEditSessionModal(session)}
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
          <div className="tab-content attendance-tab">
            <h2>Carga de asistencia</h2>
            {filterRow}
            <div className="filters-row attendance-extra-filters">
              <div className="form-group">
                <label>Año</label>
                <select value={filters.year} onChange={(e) => setFilters((current) => ({ ...current, year: e.target.value }))}>
                  <option value="">Todos</option>
                  {attendanceYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Grado</label>
                <select value={filters.grade} onChange={(e) => setFilters((current) => ({ ...current, grade: e.target.value }))}>
                  <option value="">Todos</option>
                  {attendanceGradeOptions.map((gradeOption) => (
                    <option key={gradeOption} value={gradeOption}>
                      {gradeOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filters-actions">
              <button className="btn-secondary" type="button" onClick={() => withLoad(loadMatrix)}>Cargar planilla</button>
              <button className="btn-primary" type="button" onClick={saveAttendance}>Guardar cambios</button>
              <button className="btn-secondary" type="button" onClick={() => withLoad(exportAttendanceExcel)}>Exportar Excel</button>
            </div>

            {matrix && matrix.sessions.length > 0 ? (
              <>
                <p className="attendance-grid-hint" aria-hidden="true">Desliza la tabla hacia los costados para ver todas las fechas.</p>
                <div className="attendance-grid-top-scroll" ref={attendanceTopScrollRef} aria-hidden="true">
                  <div className="attendance-grid-top-scroll-content" ref={attendanceTopScrollContentRef} />
                </div>
                <div className="attendance-grid-wrapper" ref={attendanceGridWrapperRef}>
                  <table className="attendance-grid" ref={attendanceGridRef}>
                  <thead>
                    <tr>
                      <th>Jugadora</th>
                      <th>Grado</th>
                      <th>Año de nacimiento</th>
                      {filteredAttendanceSessions.map((session) => {
                        const parts = getUtcDateParts(session.date);
                        return (
                          <th key={session.id} className="attendance-date-column">
                            <span className="attendance-date-main">{parts ? `${parts.day}/${parts.month}` : dateLabel(session.date)}</span>
                            {parts && <span className="attendance-date-year">{parts.year}</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendancePlayers.map((player) => (
                      <tr key={player.id}>
                        <td>
                          {player.fullName}
                          {!player.active && <span className="inactive-badge">Inactiva</span>}
                        </td>
                        <td>{player.grade || '-'}</td>
                        <td>{player.birthYear || '-'}</td>
                        {filteredAttendanceSessions.map((session) => (
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
                {(filteredAttendancePlayers.length === 0 || filteredAttendanceSessions.length === 0) && (
                  <p>No hay resultados para los filtros de año y grado seleccionados.</p>
                )}
              </>
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
                          <th>Jugadora</th><th>División</th><th>Presente</th><th>Tarde</th><th>Justificada</th><th>Ausente</th><th>SAF</th><th>Suspendido</th><th>% Asistencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.byPlayer.map((player) => (
                          <tr key={player.playerId}>
                            <td>{player.fullName}</td><td>{player.divisionName}</td><td>{player.PRESENTE}</td><td>{player.TARDE}</td><td>{player.JUSTIFICADA}</td><td>{player.AUSENTE}</td><td>{player.SAF}</td><td>{player.SUSPENDIDO}</td><td>{player.attendancePercentage}%</td>
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
                          <th>Fecha</th><th>División</th><th>Presente</th><th>Tarde</th><th>Justificada</th><th>Ausente</th><th>SAF</th><th>Suspendido</th><th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.totalsByDate.map((item) => (
                          <tr key={item.trainingSessionId}>
                            <td>{dateLabel(item.date)}</td><td>{item.divisionName}</td><td>{item.totals.PRESENTE}</td><td>{item.totals.TARDE}</td><td>{item.totals.JUSTIFICADA}</td><td>{item.totals.AUSENTE}</td><td>{item.totals.SAF}</td><td>{item.totals.SUSPENDIDO}</td><td>{item.totalRecords}</td>
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

        {isAttendanceGuideOpen && (
          <div className="modal-overlay" onClick={closeAttendanceGuideModal}>
            <div className="modal-content attendance-help-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-copy">
                  <h3>Formato rápido de planilla</h3>
                  <p>Usá este formato para importar asistencia desde CSV.</p>
                </div>
                <button type="button" className="modal-close" onClick={closeAttendanceGuideModal} aria-label="Cerrar modal">
                  x
                </button>
              </div>
              <div className="modal-body attendance-help-body">
                <p><strong>Columnas obligatorias:</strong> <code>fullName</code>, <code>birthYear</code>, <code>date</code>, <code>status</code></p>
                <p><strong>Columnas opcionales:</strong> <code>observation</code>, <code>notes</code>, <code>active</code></p>
                <p><strong>Estados válidos:</strong> <code>PRESENTE</code>, <code>AUSENTE</code>, <code>JUSTIFICADA</code>, <code>TARDE</code>, <code>SAF</code>, <code>SUSPENDIDO</code> (también <code>P/A/J/T/SF/SU</code>)</p>
                <p><strong>Fecha:</strong> <code>yyyy-mm-dd</code> o <code>dd/mm/yyyy</code></p>
                <p><strong>Ejemplo CSV:</strong></p>
                <pre className="attendance-help-csv">
fullName,birthYear,date,status,observation,notes,active
Abril Medina,2008,2026-03-08,PRESENTE,,Entrenamiento normal,true
Camila Perez,2009,08/03/2026,T,,Llegó tarde por colegio,true
Luz Gomez,2008,2026-03-08,AUSENTE,Sin aviso,,true
                </pre>
              </div>
            </div>
          </div>
        )}

        {createModalTab && (
          <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-copy">
                  <h3>{modalTitle}</h3>
                  <p>{modalDescription}</p>
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

