#!/bin/bash

echo "========================================"
echo "BDSC Hockey - Instalación Rápida"
echo "========================================"
echo ""

echo "[1/4] Instalando dependencias del servidor..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Error al instalar dependencias del servidor"
    exit 1
fi

echo ""
echo "[2/4] Instalando dependencias del cliente..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error al instalar dependencias del cliente"
    exit 1
fi

echo ""
echo "[3/4] Verificando archivos .env..."
cd ../server
if [ ! -f .env ]; then
    echo "Creando archivo .env..."
    cp .env.example .env
    echo "IMPORTANTE: Edita server/.env con tus credenciales de PostgreSQL"
fi

cd ../client
if [ ! -f .env ]; then
    echo "Creando archivo .env..."
    cp .env.example .env
fi

echo ""
echo "========================================"
echo "Instalación completada!"
echo "========================================"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Configura tu base de datos PostgreSQL"
echo "2. Edita server/.env con tus credenciales"
echo "3. Ejecuta en server: npm run prisma:migrate"
echo "4. Ejecuta en server: npm run prisma:seed"
echo "5. Ejecuta en server: npm run dev"
echo "6. Ejecuta en client: npm run dev"
echo ""
echo "Documentación completa en README.md"
echo "========================================"
