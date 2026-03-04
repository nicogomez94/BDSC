# 🏗 Arquitectura Técnica - BDSC Hockey

## Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.x
- **Base de datos:** PostgreSQL 14+
- **ORM:** Prisma 5.x
- **Autenticación:** JWT (jsonwebtoken)
- **Seguridad:** bcrypt (hashing de contraseñas)
- **CORS:** cors middleware

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **Estilos:** CSS puro (sin preprocesadores)
- **Estado:** Context API
- **HTTP:** Fetch API nativo

## Estructura de Carpetas

### Server (`/server`)
```
server/
├── src/
│   ├── controllers/       # Lógica de negocio
│   │   ├── authController.js
│   │   ├── trainerController.js
│   │   ├── adminController.js
│   │   └── trainerPrivateController.js
│   ├── routes/           # Definición de rutas
│   │   ├── auth.js
│   │   ├── trainers.js
│   │   ├── admin.js
│   │   └── trainer.js
│   ├── middleware/       # Middleware personalizado
│   │   ├── auth.js       # Autenticación y autorización
│   │   └── errorHandler.js
│   ├── utils/           # Utilidades
│   │   ├── prisma.js    # Cliente Prisma singleton
│   │   └── validation.js
│   └── index.js         # Punto de entrada
├── prisma/
│   ├── schema.prisma    # Modelo de datos
│   └── seed.js          # Datos iniciales
└── package.json
```

### Client (`/client`)
```
client/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/          # Páginas de la app
│   │   ├── Home.jsx
│   │   ├── Hockey.jsx
│   │   ├── Trainers.jsx
│   │   ├── Contact.jsx
│   │   ├── Login.jsx
│   │   ├── AdminPanel.jsx
│   │   └── TrainerPanel.jsx
│   ├── services/       # Servicios externos
│   │   └── api.js      # Cliente API
│   ├── context/        # Contextos de React
│   │   └── AuthContext.jsx
│   ├── styles/         # Estilos globales
│   │   └── global.css
│   ├── App.jsx         # Componente raíz
│   └── main.jsx        # Punto de entrada
├── public/             # Archivos estáticos
├── index.html
└── package.json
```

## Modelo de Datos

### Entidades

#### User
- Representa usuarios del sistema (coordinadores y entrenadores)
- Relación 1:1 opcional con Trainer
- Almacena credenciales y rol

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  role         Role     (COORDINADOR | ENTRENADOR)
  trainerId    Int?     @unique
  trainer      Trainer?
}
```

#### Trainer
- Información pública de entrenadores
- Visible en sitio público
- Editable por el entrenador desde su panel

```prisma
model Trainer {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  bio       String?
  specialty String?
  photoUrl  String?
  user      User?
}
```

#### Section
- Secciones de información interna
- Controladas por coordinador
- Acceso granular por entrenador

```prisma
model Section {
  id      Int     @id @default(autoincrement())
  title   String
  content String
}
```

#### SectionAccess
- Tabla de permisos muchos-a-muchos
- Define qué entrenadores ven qué secciones

```prisma
model SectionAccess {
  id        Int     @id @default(autoincrement())
  sectionId Int
  trainerId Int
  @@unique([sectionId, trainerId])
}
```

## Flujos de Autenticación

### Login
1. Usuario envía email/password a `/api/auth/login`
2. Backend valida credenciales con bcrypt
3. Si es válido, genera JWT con userId y role
4. Frontend almacena token en localStorage
5. Frontend redirige según role:
   - COORDINADOR → `/admin`
   - ENTRENADOR → `/panel`

### Autorización
1. Frontend incluye token en header `Authorization: Bearer <token>`
2. Middleware `authenticate` valida token
3. Middleware `requireRole` verifica permisos
4. Si falla, retorna 401 (no autenticado) o 403 (no autorizado)

## API REST

### Convenciones
- Códigos HTTP estándar
- JSON para request/response
- Mensajes de error descriptivos
- Validación en backend

### Endpoints por Rol

**Públicos:**
- `GET /api/trainers` - Lista de entrenadores
- `GET /api/trainers/:slug` - Detalle de entrenador

**Autenticados:**
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual

**Coordinador:**
- `/api/admin/trainers` - CRUD entrenadores
- `/api/admin/sections` - CRUD secciones
- `/api/admin/section-access` - Gestión de permisos

**Entrenador:**
- `GET /api/trainer/sections` - Ver mis secciones
- `PUT /api/trainer/profile` - Actualizar mi perfil

## Seguridad

### Backend
- ✅ Contraseñas hasheadas (bcrypt, 10 rounds)
- ✅ JWT con secret fuerte
- ✅ CORS habilitado
- ✅ Validación de inputs
- ✅ Autorización por roles
- ✅ Middleware de errores centralizado
- ✅ Variables de entorno para secretos

### Frontend
- ✅ Token en localStorage
- ✅ Rutas protegidas con ProtectedRoute
- ✅ Validación de formularios
- ✅ Redirección automática si no autenticado
- ✅ Limpieza de token al logout

## Convenciones de Código

### Backend
- ES6+ modules (`import/export`)
- Funciones async/await
- Arrow functions
- Try/catch con next(error)
- Nombres descriptivos

### Frontend
- Functional components
- Hooks (useState, useEffect, useContext)
- Props destructuring
- Nombres PascalCase para componentes
- Nombres camelCase para variables/funciones

## Performance

### Backend
- Prisma Client singleton
- Índices en campos frecuentes (email, slug)
- Queries específicas (include solo lo necesario)

### Frontend
- Vite para build rápido
- Code splitting automático (React Router)
- CSS modular por componente
- Carga lazy de imágenes (placeholder)

## Escalabilidad

### Horizontal
- Backend stateless (JWT)
- Base de datos separada
- Frontend servido por CDN (build estático)

### Vertical
- Connection pooling (Prisma)
- Paginación en listados grandes
- Cache en queries frecuentes (futuro)

## Testing (Futuro)

### Backend
- Jest para unit tests
- Supertest para integration tests
- Tests de endpoints críticos

### Frontend
- Vitest + React Testing Library
- Tests de componentes críticos
- Tests de integración de rutas

## Deploy (Recomendado)

### Backend
- Railway / Render / Heroku
- PostgreSQL managed (Railway, Supabase)
- Variables de entorno en plataforma

### Frontend
- Vercel / Netlify
- Build automático desde Git
- Variables de entorno para API_URL

## Monitoreo (Futuro)

- Logs estructurados (winston)
- Error tracking (Sentry)
- Uptime monitoring
- Performance metrics

---

**Última actualización:** Marzo 2026
