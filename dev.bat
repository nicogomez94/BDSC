@echo off
echo ========================================
echo BDSC Hockey - Iniciar Desarrollo
echo ========================================
echo.
echo Ejecutando servidor y cliente...
echo.
echo Servidor: http://localhost:3000
echo Cliente: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener ambos servicios
echo ========================================
echo.

start "BDSC Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul
start "BDSC Client" cmd /k "cd client && npm run dev"

echo.
echo Ambos servicios iniciados en ventanas separadas
pause
