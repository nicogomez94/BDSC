/**
 * Generador del tutorial Word del Panel de Administración BDSC
 * Ejecutar: node generate-tutorial.js
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TableRow,
  TableCell,
  Table,
  WidthType,
  ShadingType,
  PageBreak,
  UnderlineType,
  ImageRun,
  NumberingFormat,
  convertInchesToTwip,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Paleta de colores ─────────────────────────────────────────────────────────
const C = {
  verdePrincipal: '1B5E20',   // verde oscuro – títulos de sección
  verdeSecundario: '2E7D32', // verde medio – subtítulos
  verdeSuave: '4CAF50',       // verde vivo – cabeceras de tabla
  verdeMuyClaro: 'E8F5E9',    // verde pálido – fondo filas de tabla
  verdeAgua: 'C8E6C9',        // fondo de cajas de tip
  blanco: 'FFFFFF',
  grisMuyClaro: 'F9FBF9',
  grisTitulo: '1A1A2E',       // casi negro – texto título principal
  grisTexto: '333333',
  grisSecundario: '555555',
  amarilloTip: 'F9FBE7',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const run = (text, opts = {}) =>
  new TextRun({
    text,
    font: 'Calibri',
    size: opts.size ?? 22,
    bold: opts.bold ?? false,
    italics: opts.italics ?? false,
    color: opts.color ?? C.grisTexto,
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
  });

const h1 = (text) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        font: 'Calibri',
        size: 52,
        bold: true,
        color: C.blanco,
      }),
    ],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.CLEAR, fill: C.verdePrincipal, color: C.verdePrincipal },
    spacing: { before: 200, after: 200 },
    indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
  });

const h2 = (text) =>
  new Paragraph({
    children: [
      new TextRun({
        text: `  ${text}`,
        font: 'Calibri',
        size: 34,
        bold: true,
        color: C.blanco,
      }),
    ],
    shading: { type: ShadingType.CLEAR, fill: C.verdeSecundario, color: C.verdeSecundario },
    spacing: { before: 320, after: 160 },
    indent: { left: convertInchesToTwip(0), right: convertInchesToTwip(0) },
  });

const h3 = (text) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        font: 'Calibri',
        size: 26,
        bold: true,
        color: C.verdePrincipal,
        underline: { type: UnderlineType.SINGLE },
      }),
    ],
    spacing: { before: 240, after: 80 },
  });

const body = (text, opts = {}) =>
  new Paragraph({
    children: [run(text, { size: 22, color: C.grisTexto, ...opts })],
    spacing: { before: 60, after: 60 },
    indent: { left: opts.indent ? convertInchesToTwip(0.3) : 0 },
  });

const bullet = (text) =>
  new Paragraph({
    children: [run(`• ${text}`, { size: 22, color: C.grisSecundario })],
    spacing: { before: 40, after: 40 },
    indent: { left: convertInchesToTwip(0.4) },
  });

const note = (text) =>
  new Paragraph({
    children: [
      run('💡 TIP: ', { size: 21, bold: true, color: C.verdeSecundario }),
      run(text, { size: 21, italics: true, color: C.grisSecundario }),
    ],
    shading: { type: ShadingType.CLEAR, fill: C.verdeAgua, color: C.verdeAgua },
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.25), right: convertInchesToTwip(0.25) },
  });

const divider = () =>
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.verdeSuave } },
    spacing: { before: 160, after: 160 },
  });

const pageBreak = () =>
  new Paragraph({ children: [new PageBreak()] });

const tableHeader = (texts) =>
  new TableRow({
    tableHeader: true,
    children: texts.map((t) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: C.verdeSuave, color: C.verdeSuave },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: t, bold: true, color: C.blanco, font: 'Calibri', size: 20 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          }),
        ],
      })
    ),
  });

const tableRow = (texts, shade = false) =>
  new TableRow({
    children: texts.map((t) =>
      new TableCell({
        shading: shade
          ? { type: ShadingType.CLEAR, fill: C.verdeMuyClaro, color: C.verdeMuyClaro }
          : undefined,
        children: [
          new Paragraph({
            children: [new TextRun({ text: t, font: 'Calibri', size: 20, color: C.grisTexto })],
            spacing: { before: 60, after: 60 },
            indent: { left: convertInchesToTwip(0.1) },
          }),
        ],
      })
    ),
  });

const infoTable = (rows) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableHeader(['Campo', 'Descripción', 'Obligatorio']),
      ...rows.map(([campo, desc, req], i) => tableRow([campo, desc, req], i % 2 === 0)),
    ],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });

// ─── Portada ──────────────────────────────────────────────────────────────────
const portada = [
  new Paragraph({ spacing: { before: 2000 } }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'BDSC',
        font: 'Calibri',
        size: 80,
        bold: true,
        color: C.verdePrincipal,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'Panel de Administración',
        font: 'Calibri',
        size: 48,
        bold: true,
        color: C.verdeSecundario,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'Manual de Usuario',
        font: 'Calibri',
        size: 32,
        italics: true,
        color: C.grisSecundario,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: '─────────────────────────────────',
        font: 'Calibri',
        size: 24,
        color: C.verdeSuave,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: `Versión 1.0  •  Abril 2026`,
        font: 'Calibri',
        size: 22,
        color: C.grisSecundario,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 800 },
  }),
  pageBreak(),
];

// ─── Índice ───────────────────────────────────────────────────────────────────
const indice = [
  h1('ÍNDICE DE CONTENIDOS'),
  new Paragraph({ spacing: { before: 200 } }),
  ...[
    ['1', 'Introducción al Panel', '3'],
    ['2', 'Entrenadores', '4'],
    ['3', 'Preparadores Físicos', '6'],
    ['4', 'Secciones', '7'],
    ['5', 'Menú Principal (Contenido del Sitio)', '8'],
    ['6', 'Biblioteca Virtual', '10'],
    ['7', 'Divisiones', '12'],
    ['8', 'Jugadoras', '13'],
    ['9', 'Fechas de Entrenamiento', '15'],
    ['10', 'Asistencia', '16'],
    ['11', 'Reportes', '18'],
  ].flatMap(([num, title, page]) => [
    new Paragraph({
      children: [
        new TextRun({ text: `${num}.  `, font: 'Calibri', size: 22, bold: true, color: C.verdeSecundario }),
        new TextRun({ text: title, font: 'Calibri', size: 22, color: C.grisTexto }),
        new TextRun({ text: `  ···  Pág. ${page}`, font: 'Calibri', size: 20, color: C.grisSecundario, italics: true }),
      ],
      spacing: { before: 100, after: 100 },
      indent: { left: convertInchesToTwip(0.4) },
    }),
  ]),
  pageBreak(),
];

// ─── Secciones del tutorial ────────────────────────────────────────────────────
const contenido = [

  // 1. INTRODUCCIÓN
  h1('1. INTRODUCCIÓN AL PANEL'),
  body('El Panel de Administración de BDSC es la central de control del sitio web del club. Desde aquí podés gestionar todos los recursos del sistema: cuerpo técnico, jugadoras, divisiones, asistencia y el contenido visible en el sitio público.'),
  body('El panel está organizado en pestañas. Cada pestaña es una funcionalidad independiente, describimos cada una en detalle en este manual.'),
  note('Siempre que realices una acción exitosa, verás un mensaje verde de confirmación en la parte superior del panel.'),
  divider(),
  body('Tabs disponibles:', { bold: true }),
  ...[ 
    '🗂  Entrenadores',
    '🏋  Preparadores Físicos',
    '📁  Secciones',
    '🌐  Menú Principal',
    '📚  Biblioteca Virtual',
    '🏅  Divisiones',
    '👩  Jugadoras',
    '📅  Fechas',
    '✅  Asistencia',
    '📊  Reportes',
  ].map((t) => bullet(t)),
  pageBreak(),

  // 2. ENTRENADORES
  h1('2. ENTRENADORES'),
  body('Esta sección permite gestionar los perfiles del cuerpo técnico (entrenadores principales) del club. Los perfiles se muestran en la sección pública "Entrenadores" del sitio.'),
  divider(),

  h3('2.1 Listado de Entrenadores'),
  body('Al ingresar a la pestaña verás una tabla con todos los entrenadores registrados. Cada fila muestra:'),
  bullet('Foto de perfil (miniatura)'),
  bullet('Nombre completo'),
  bullet('Especialidad'),
  bullet('Acciones: Editar · Eliminar · Descargar CV'),
  new Paragraph({ spacing: { before: 120 } }),

  h3('2.2 Crear un Nuevo Entrenador'),
  body('Hacé clic en el botón "Nuevo entrenador" para abrir el formulario modal.'),
  new Paragraph({ spacing: { before: 80 } }),
  infoTable([
    ['Nombre', 'Nombre completo del entrenador', 'Sí'],
    ['Especialidad', 'Área de conocimiento o posición', 'No'],
    ['Biografía', 'Texto descriptivo para el perfil público', 'No'],
    ['Foto (URL)', 'Link externo a imagen de perfil', 'No'],
    ['Foto (archivo)', 'Subir imagen desde tu equipo (JPEG, PNG)', 'No'],
    ['CV (archivo)', 'Subir documento PDF del currículum', 'No'],
    ['Email', 'Credencial de acceso al panel', 'Sí'],
    ['Contraseña', 'Contraseña de acceso al panel', 'Sí'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),
  note('Si subís una imagen desde archivo, esta reemplaza a la URL ingresada manualmente.'),

  h3('2.3 Editar un Entrenador'),
  body('Hacé clic en el botón "Editar" en la fila del entrenador. El formulario se pre-carga con los datos actuales. Los campos Email y Contraseña son opcionales durante la edición: solo se actualizan si los completás.'),

  h3('2.4 Descargar CV'),
  body('Si un entrenador tiene un CV cargado, el botón "Descargar CV" aparecerá habilitado. El archivo se descarga automáticamente con el nombre del entrenador.'),

  h3('2.5 Eliminar un Entrenador'),
  body('Hacé clic en "Eliminar". Se mostrará un diálogo de confirmación antes de borrar el registro de forma permanente.'),
  note('Esta acción no se puede deshacer. Asegurate de confirmar antes de proceder.'),
  pageBreak(),

  // 3. PREPARADORES FÍSICOS
  h1('3. PREPARADORES FÍSICOS'),
  body('Funciona igual que la pestaña de Entrenadores, pero aplica exclusivamente a los preparadores físicos del club.'),
  divider(),
  body('La diferencia principal es que al crear/editar, el tipo de perfil se asigna automáticamente como "Preparador Físico". Los perfiles aparecen en la página pública de Preparadores Físicos, separados de los entrenadores.'),
  note('Tanto entrenadores como preparadores físicos tienen acceso al panel de entrenador con sus propias credenciales.'),
  pageBreak(),

  // 4. SECCIONES
  h1('4. SECCIONES'),
  body('Las secciones son bloques de contenido libre que aparecen en determinadas páginas del sitio. Se crean con un título y contenido enriquecido (rich text).'),
  divider(),

  h3('4.1 Crear una Sección'),
  body('Hacé clic en "Nueva sección". Se abre el formulario:'),
  infoTable([
    ['Título', 'Encabezado visible de la sección', 'Sí'],
    ['Contenido', 'Editor de texto enriquecido con soporte para imágenes y PDFs', 'Sí'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),

  h3('4.2 Editor de Texto Enriquecido'),
  body('El editor incluye las siguientes herramientas:'),
  bullet('Formato de texto: negrita, cursiva, subrayado'),
  bullet('Listas con viñetas y numeradas'),
  bullet('Insertar imágenes desde tu equipo'),
  bullet('Insertar documentos PDF'),
  bullet('Alinear texto'),
  note('Las imágenes y PDFs se suben al servidor y se vinculan automáticamente en el contenido.'),

  h3('4.3 Eliminar una Sección'),
  body('Las secciones se pueden eliminar directamente desde el listado. La eliminación es permanente.'),
  pageBreak(),

  // 5. MENÚ PRINCIPAL
  h1('5. MENÚ PRINCIPAL (CONTENIDO DEL SITIO)'),
  body('Esta pestaña permite administrar el contenido estructurado de las secciones "Coordinación" y "Recursos" del sitio. La jerarquía es: Sección → Subdivisión → Página → Subpágina.'),
  divider(),

  h3('5.1 Estructura del Contenido'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableHeader(['Nivel', 'Nombre', 'Descripción']),
      tableRow(['1', 'Sección', 'Coordinación o Recursos (fijas, no se pueden crear)'], false),
      tableRow(['2', 'Subdivisión', 'Agrupación dentro de una sección'], true),
      tableRow(['3', 'Página', 'Contenido con título, resumen y cuerpo'], false),
      tableRow(['4', 'Subpágina', 'Contenido secundario dentro de una página'], true),
    ],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  }),
  new Paragraph({ spacing: { before: 120 } }),

  h3('5.2 Gestionar Subdivisiones'),
  body('Permite crear, editar y eliminar subdivisiones dentro de "Coordinación" o "Recursos".'),
  infoTable([
    ['Sección', 'Seleccioná si pertenece a Coordinación o Recursos', 'Sí'],
    ['Nombre', 'Título de la subdivisión', 'Sí'],
    ['Descripción', 'Texto breve descriptivo', 'No'],
    ['Orden', 'Número para ordenar entre subdivisiones', 'No'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),

  h3('5.3 Gestionar Páginas'),
  body('Dentro de cada subdivisión podés crear páginas de contenido.'),
  infoTable([
    ['Subdivisión', 'Subdivisión a la que pertenece la página', 'Sí'],
    ['Título', 'Encabezado de la página', 'Sí'],
    ['Resumen', 'Texto corto que aparece como vista previa', 'No'],
    ['Contenido', 'Cuerpo completo con editor enriquecido', 'No'],
    ['Orden', 'Posición relativa dentro de la subdivisión', 'No'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),

  h3('5.4 Gestionar Subpáginas'),
  body('Cada página puede tener subpáginas anidadas con el mismo esquema de título, resumen y contenido.'),
  note('Las páginas marcadas como "sistema" o "solo lectura" no pueden ser editadas ni eliminadas desde el panel.'),
  pageBreak(),

  // 6. BIBLIOTECA VIRTUAL
  h1('6. BIBLIOTECA VIRTUAL'),
  body('La Biblioteca Virtual permite organizar y publicar videos educativos o de entrenamiento para las jugadoras. La jerarquía es: Subdivisión → Categoría → Video.'),
  divider(),

  h3('6.1 Subdivisiones de la Biblioteca'),
  body('Son los grupos principales que aparecen en el menú de la biblioteca en el sitio público.'),
  infoTable([
    ['Nombre', 'Título de la subdivisión', 'Sí'],
    ['Orden', 'Posición relativa en el listado', 'No'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),

  h3('6.2 Categorías'),
  body('Agrupan los videos dentro de cada subdivisión.'),
  infoTable([
    ['Subdivisión', 'A qué subdivisión pertenece esta categoría', 'Sí'],
    ['Nombre', 'Título de la categoría', 'Sí'],
    ['Orden', 'Posición relativa en el listado', 'No'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),

  h3('6.3 Videos'),
  body('Los videos son el contenido final de la biblioteca. Se enlazan desde plataformas externas como YouTube.'),
  infoTable([
    ['Categoría', 'Categoría a la que pertenece el video', 'Sí'],
    ['Título', 'Nombre descriptivo del video', 'Sí'],
    ['URL', 'Enlace al video (YouTube, Vimeo, etc.)', 'Sí'],
    ['Orden', 'Posición relativa dentro de la categoría', 'No'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),
  note('Todos los elementos de la Biblioteca (subdivisiones, categorías y videos) soportan edición y eliminación.'),
  pageBreak(),

  // 7. DIVISIONES
  h1('7. DIVISIONES'),
  body('Las divisiones agrupan a las jugadoras por categoría de edad o nivel. Cada división pertenece a un año de temporada.'),
  divider(),

  h3('7.1 Crear una División'),
  infoTable([
    ['Nombre', 'Nombre de la división (ej: Sub-15, Primera)', 'Sí'],
    ['Año de temporada', 'Año al que corresponde (ej: 2026)', 'Sí'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),

  h3('7.2 Editar y Eliminar'),
  body('Desde el listado podés editar el nombre y año de cada división o eliminarla.'),
  note('Antes de eliminar una división, asegurate de que no tenga jugadoras ni fechas asociadas para evitar errores.'),
  pageBreak(),

  // 8. JUGADORAS
  h1('8. JUGADORAS'),
  body('Esta sección centraliza el padrón de jugadoras del club. Permite gestionar sus datos personales, contacto y asignación a divisiones.'),
  divider(),

  h3('8.1 Filtrar Jugadoras'),
  body('En la parte superior hay un selector de División. Elegí una división para ver solo las jugadoras de ese grupo.'),

  h3('8.2 Crear una Jugadora'),
  infoTable([
    ['Nombre completo', 'Nombre y apellido de la jugadora', 'Sí'],
    ['Año de nacimiento', 'Se usa para calcular categoría', 'Sí'],
    ['División', 'División a la que pertenece', 'Sí'],
    ['Activa', 'Si está activa en el club (Sí / No)', 'Sí'],
    ['Teléfono', 'Número de contacto directo', 'No'],
    ['Email', 'Correo electrónico de la jugadora', 'No'],
    ['Nombre del tutor/a', 'Padre, madre o tutor responsable', 'No'],
    ['Email del tutor/a', 'Correo del tutor/a', 'No'],
    ['Teléfono del tutor/a', 'Número del tutor/a', 'No'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),
  note('Las jugadoras marcadas como inactivas siguen apareciendo en el padrón pero se muestran diferenciadas en la planilla de asistencia.'),

  h3('8.3 Editar y Eliminar'),
  body('Desde la fila de cada jugadora podés acceder a los botones de edición y eliminación. La edición abre el mismo formulario con los datos precargados.'),
  pageBreak(),

  // 9. FECHAS
  h1('9. FECHAS DE ENTRENAMIENTO'),
  body('Las fechas representan los días de entrenamiento o partido. Cada fecha está vinculada a una división.'),
  divider(),

  h3('9.1 Filtrar Fechas'),
  body('Podés filtrar por División y/o Mes para visualizar solo las fechas relevantes.'),

  h3('9.2 Crear una Fecha'),
  infoTable([
    ['División', 'División para la que se registra la fecha', 'Sí'],
    ['Fecha', 'Día del entrenamiento o partido', 'Sí'],
    ['Notas', 'Observaciones adicionales (ej: partido oficial)', 'No'],
  ]),
  new Paragraph({ spacing: { before: 120 } }),
  note('Las fechas creadas aquí estarán disponibles en la planilla de Asistencia para cargar el presentismo de ese día.'),

  h3('9.3 Editar y Eliminar'),
  body('Podés corregir la fecha o las notas en cualquier momento. Eliminando una fecha también se eliminan sus registros de asistencia asociados.'),
  pageBreak(),

  // 10. ASISTENCIA
  h1('10. ASISTENCIA'),
  body('Esta es la funcionalidad central del sistema. Permite cargar, visualizar, importar y exportar la planilla de asistencia de cada división.'),
  divider(),

  h3('10.1 Visualizar la Planilla'),
  body('Seleccioná una División (obligatorio) y opcionalmente un Mes, luego hacé clic en "Ver planilla". Se muestra una grilla donde:'),
  bullet('Las filas son las jugadoras de la división'),
  bullet('Las columnas son las fechas de entrenamiento'),
  bullet('Cada celda muestra el estado de asistencia'),
  new Paragraph({ spacing: { before: 80 } }),

  h3('10.2 Estados de Asistencia'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableHeader(['Estado', 'Código', 'Significado']),
      tableRow(['PRESENTE', 'P', 'Asistió al entrenamiento'], false),
      tableRow(['AUSENTE', 'A', 'No asistió sin justificación'], true),
      tableRow(['JUSTIFICADA', 'J', 'Ausencia con aviso previo'], false),
      tableRow(['TARDE', 'T', 'Llegó tarde'], true),
    ],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  }),
  new Paragraph({ spacing: { before: 120 } }),

  h3('10.3 Cargar Asistencia Manualmente'),
  body('En cada celda de la grilla hacé clic y seleccioná el estado. Los cambios quedan resaltados hasta que hagas clic en "Guardar asistencia".'),
  note('No olvides guardar los cambios antes de cambiar de pestaña o salir del panel.'),

  h3('10.4 Importar Planilla desde CSV'),
  body('Hacé clic en "Importar planilla (CSV)" y seleccioná un archivo .csv. El archivo debe tener las siguientes columnas:'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableHeader(['Columna', 'Nombre alternativo', 'Formato']),
      tableRow(['fullName', 'nombre / jugadora', 'Texto'], false),
      tableRow(['birthYear', 'añoNacimiento', 'Número (ej: 2010)'], true),
      tableRow(['date', 'fecha', 'DD/MM/YYYY o YYYY-MM-DD'], false),
      tableRow(['status', 'estado', 'P, A, J, T o nombre completo'], true),
      tableRow(['observation', 'observacion', 'Texto libre (opcional)'], false),
      tableRow(['notes', 'notas', 'Texto libre (opcional)'], true),
      tableRow(['active', 'activa', 'si/no, true/false (opcional)'], false),
    ],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  }),
  new Paragraph({ spacing: { before: 120 } }),
  note('El separador del CSV puede ser coma (,) o punto y coma (;). El sistema lo detecta automáticamente.'),

  h3('10.5 Exportar Planilla'),
  body('Hay dos opciones de exportación:'),
  bullet('Exportar CSV: genera un archivo .csv con todos los registros filtrados'),
  bullet('Exportar Excel (.xlsx): genera una planilla Excel formateada con jugadoras en filas y fechas en columnas'),
  note('Para exportar Excel es necesario tener una división seleccionada y la planilla cargada.'),
  pageBreak(),

  // 11. REPORTES
  h1('11. REPORTES'),
  body('La pestaña de Reportes muestra estadísticas de asistencia consolidadas por jugadora.'),
  divider(),

  h3('11.1 Filtros disponibles'),
  body('Podés filtrar el reporte por División y/o Mes. Sin filtros, el reporte muestra el total histórico de todas las divisiones.'),

  h3('11.2 Información del reporte'),
  body('Para cada jugadora se muestra:'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableHeader(['Columna', 'Descripción']),
      tableRow(['Jugadora', 'Nombre completo de la jugadora'], false),
      tableRow(['División', 'División a la que pertenece'], true),
      tableRow(['Presentes', 'Cantidad de fechas con estado PRESENTE'], false),
      tableRow(['Ausentes', 'Cantidad de fechas con estado AUSENTE'], true),
      tableRow(['Justificadas', 'Cantidad de ausencias justificadas'], false),
      tableRow(['Tarde', 'Cantidad de llegadas tarde'], true),
      tableRow(['Total', 'Total de fechas registradas'], false),
      tableRow(['% Asistencia', 'Porcentaje (Presentes / Total × 100)'], true),
    ],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  }),
  new Paragraph({ spacing: { before: 120 } }),
  note('El reporte se actualiza automáticamente al guardar cambios en la planilla de Asistencia.'),
  divider(),

  // Pie final
  new Paragraph({ spacing: { before: 400 } }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'BDSC — Manual de Administración v1.0  •  Abril 2026',
        font: 'Calibri',
        size: 18,
        italics: true,
        color: C.grisSecundario,
      }),
    ],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.CLEAR, fill: C.verdeMuyClaro, color: C.verdeMuyClaro },
    spacing: { before: 40, after: 40 },
  }),
];

// ─── Armar y exportar ─────────────────────────────────────────────────────────
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.1),
            right: convertInchesToTwip(1.1),
          },
        },
      },
      children: [...portada, ...indice, ...contenido],
    },
  ],
});

const outputPath = path.join(__dirname, 'Tutorial_Panel_Admin_BDSC.docx');

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅  Documento creado: ${outputPath}`);
});
