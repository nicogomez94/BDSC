@echo off
echo ========================================
echo BDSC Hockey - Instalacion Rapida
echo ========================================
echo.

echo [1/4] Instalando dependencias del servidor...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error al instalar dependencias del servidor
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias del cliente...
cd ..\client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error al instalar dependencias del cliente
    exit /b 1
)

echo.
echo [3/4] Verificando archivos .env...
cd ..\server
if not exist .env (
    echo Creando archivo .env...
    copy .env.example .env
    echo IMPORTANTE: Edita server\.env con tus credenciales de PostgreSQL
)

cd ..\client
if not exist .env (
    echo Creando archivo .env...
    copy .env.example .env
)

echo.
echo ========================================
echo Instalacion completada!
echo ========================================
echo.
echo Proximos pasos:
echo.
echo 1. Configura tu base de datos PostgreSQL
echo 2. Edita server\.env con tus credenciales
echo 3. Ejecuta en server: npm run prisma:migrate
echo 4. Ejecuta en server: npm run prisma:seed
echo 5. Ejecuta en server: npm run dev
echo 6. Ejecuta en client: npm run dev
echo.
echo Documentacion completa en README.md
echo ========================================

pause
