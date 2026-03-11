# BDSC Hockey - Sistema de Coordinación

Sistema full-stack para la coordinación de hockey del club Belgrano Day School Club (BDSC).

## 🏒 Descripción

Aplicación web que permite gestionar entrenadores, secciones de información y permisos de acceso diferenciados por roles.

## 🛠 Tecnologías

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT para autenticación
- bcrypt para encriptación de contraseñas

### Frontend
- React 18 (Vite)
- React Router v6
- CSS puro (sin frameworks)
- Context API para gestión de estado

## 📁 Estructura del Proyecto

```
BDSC/
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── styles/
│   └── package.json
│
└── server/          # Backend Node.js
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   └── utils/
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    └── package.json
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd BDSC
```

### 2. Configurar el Backend

```bash
cd server
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bdsc_hockey?schema=public"
JWT_SECRET="tu_secreto_jwt_super_seguro_aqui"
PORT=3000
NODE_ENV=development
```

### 3. Configurar la Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos con datos iniciales
npm run prisma:seed
```

### 4. Configurar el Frontend

```bash
cd ../client
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🎮 Ejecución

### Iniciar Backend (Terminal 1)

```bash
cd server
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Iniciar Frontend (Terminal 2)

```bash
cd client
npm run dev
```

El cliente estará disponible en `http://localhost:5173`

## 👥 Roles y Permisos

### COORDINADOR
- Acceso total al sistema
- CRUD de entrenadores
- Crear usuarios entrenadores
- Crear y gestionar secciones
- Asignar permisos de acceso a secciones

### ENTRENADOR
- Acceso limitado
- Ver solo secciones asignadas
- Editar su propio perfil (bio, especialidad, foto)
- Cambiar su contraseña

## 🔑 Credenciales de Prueba

Después de ejecutar el seed:

**Coordinador:**
- Email: `coordinador@bdsc.com`
- Contraseña: `admin123`

**Entrenador 1:**
- Email: `juan.perez@bdsc.com`
- Contraseña: `trainer123`

**Entrenador 2:**
- Email: `maria.gonzalez@bdsc.com`
- Contraseña: `trainer123`

## 📡 API Endpoints

### Públicos
- `GET /api/trainers` - Listar todos los entrenadores
- `GET /api/trainers/:slug` - Obtener entrenador por slug

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Coordinador (requiere rol COORDINADOR)
- `POST /api/admin/trainers` - Crear entrenador
- `PUT /api/admin/trainers/:id` - Actualizar entrenador
- `DELETE /api/admin/trainers/:id` - Eliminar entrenador
- `POST /api/admin/sections` - Crear sección
- `GET /api/admin/sections` - Listar secciones
- `PUT /api/admin/sections/:id` - Actualizar sección
- `DELETE /api/admin/sections/:id` - Eliminar sección
- `POST /api/admin/section-access` - Otorgar acceso
- `DELETE /api/admin/section-access/:id` - Revocar acceso

### Entrenador (requiere rol ENTRENADOR)
- `GET /api/trainer/sections` - Ver secciones asignadas
- `PUT /api/trainer/profile` - Actualizar perfil

## 🎨 Sitio Público

### Páginas disponibles:
- **/** - Home con hero, sobre el hockey
- **/hockey** - Información sobre hockey en BDSC
- **/entrenadores** - Cards de todos los entrenadores
- **/contacto** - Formulario de contacto e información
- **/login** - Acceso para entrenadores

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (10 rounds)
- Tokens JWT con expiración de 7 días
- Middleware de autenticación y autorización por roles
- Validación de inputs en backend
- Protección de rutas en frontend

## 📝 Modelo de Datos

### User
- id, email, passwordHash, role, trainerId

### Trainer
- id, name, slug, bio, specialty, photoUrl

### Section
- id, title, content

### SectionAccess
- id, sectionId, trainerId

## 🚢 Producción

### Build del Frontend
```bash
cd client
npm run build
```

### Build del Backend
```bash
cd server
npm start
```

### Keep-alive con cron-job.org (Render Free)
Para minimizar el sleep del servicio en Render Free, este backend expone:

- `GET /health`

Configuración recomendada en `cron-job.org`:

1. Crear cuenta e iniciar sesión en https://cron-job.org/en/
2. Ir a **CREATE CRONJOB**.
3. Completar:
   - **Title**: `BDSC Render Keep Alive`
   - **URL**: `https://<tu-servicio>.onrender.com/health`
   - **Request method**: `GET`
   - **Schedule**: cada `10` minutos (`*/10 * * * *`)
4. Guardar con **CREATE**.
5. Verificar en **Logs** de cron-job.org que responde `200`.

Notas:
- Usar `/health` evita cargar rutas pesadas o consultas de negocio.
- Este enfoque es workaround para tier Free; para producción estable, usar instancia paga.

## 🤝 Contribución

Este es un proyecto privado para BDSC. Para contribuir, contactar al coordinador técnico.

## 📄 Licencia

Propiedad de Belgrano Day School Club - 2026

---

Desarrollado con ❤️ para BDSC Hockey
