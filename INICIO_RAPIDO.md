# 🚀 Inicio Rápido - BDSC Hockey

## Primeros Pasos

### 1. Instalar Dependencias

**Windows:**
```bash
install.bat
```

**macOS/Linux:**
```bash
chmod +x install.sh
./install.sh
```

O manualmente:
```bash
# Servidor
cd server
npm install

# Cliente
cd ../client
npm install
```

### 2. Configurar Base de Datos

Crear base de datos PostgreSQL:
```sql
CREATE DATABASE bdsc_hockey;
```

Editar `server/.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/bdsc_hockey?schema=public"
JWT_SECRET="cambia_este_secreto_por_algo_seguro"
PORT=3000
NODE_ENV=development
```

### 3. Inicializar Base de Datos

```bash
cd server

# Generar cliente Prisma
npm run prisma:generate

# Crear tablas
npm run prisma:migrate

# Poblar con datos de ejemplo
npm run prisma:seed
```

### 4. Iniciar Aplicación

**Opción A - Script automático (Windows):**
```bash
dev.bat
```

**Opción A - Script automático (macOS/Linux):**
```bash
chmod +x dev.sh
./dev.sh
```

**Opción B - Manual:**

Terminal 1 (Servidor):
```bash
cd server
npm run dev
```

Terminal 2 (Cliente):
```bash
cd client
npm run dev
```

### 5. Acceder a la Aplicación

- **Cliente:** http://localhost:5173
- **Servidor:** http://localhost:3000
- **API Docs:** http://localhost:3000/api

## 🔑 Credenciales de Prueba

**Coordinador:**
- Email: coordinador@bdsc.com
- Contraseña: admin123

**Entrenadores:**
- juan.perez@bdsc.com / trainer123
- maria.gonzalez@bdsc.com / trainer123

## 📝 Comandos Útiles

### Servidor
```bash
npm run dev          # Modo desarrollo
npm start            # Modo producción
npm run prisma:migrate   # Nueva migración
npm run prisma:seed      # Volver a poblar datos
```

### Cliente
```bash
npm run dev      # Modo desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa del build
```

## 🐛 Solución de Problemas

### Error de conexión a base de datos
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `server/.env`
- Verificar que la base de datos exista

### Error al ejecutar migraciones
```bash
cd server
npx prisma migrate reset
npm run prisma:migrate
npm run prisma:seed
```

### Puerto ya en uso
- Cambiar PORT en `server/.env`
- Cambiar puerto en `client/vite.config.js`

## 📚 Más Información

Ver [README.md](README.md) para documentación completa.
