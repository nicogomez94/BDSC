#!/bin/bash

echo "========================================"
echo "BDSC Hockey - Iniciar Desarrollo"
echo "========================================"
echo ""
echo "Ejecutando servidor y cliente..."
echo ""
echo "Servidor: http://localhost:3000"
echo "Cliente: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"
echo "========================================"
echo ""

# Ejecutar servidor en background
cd server
npm run dev &
SERVER_PID=$!

# Esperar un poco
sleep 3

# Ejecutar cliente en background
cd ../client
npm run dev &
CLIENT_PID=$!

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Esperar indefinidamente
wait
