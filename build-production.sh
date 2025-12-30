#!/bin/bash

# Script de Build para Producción
# Sistema de Gestión de Tareas
# Genera los archivos ZIP listos para subir al hosting

echo "🚀 Iniciando proceso de build para producción..."
echo ""

# Verificar que estamos en la raíz del proyecto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# ============================================
# FRONTEND
# ============================================
echo "📦 FRONTEND"
echo "─────────────────────────────────────"

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

echo "✓ Node.js detectado: $(node --version)"

# Ir a la carpeta frontend
cd frontend

# Instalar dependencias si node_modules no existe
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias de npm..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar dependencias"
        cd ..
        exit 1
    fi
fi

# Construir la aplicación
echo "🔨 Construyendo aplicación Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error al construir frontend"
    cd ..
    exit 1
fi

# Verificar que la carpeta out existe
if [ ! -d "out" ]; then
    echo "❌ Error: La carpeta 'out' no se generó"
    cd ..
    exit 1
fi

echo "✓ Build del frontend completado"

# Crear ZIP del frontend
echo "📦 Creando ZIP del frontend..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FRONTEND_ZIP="../frontend_production_${TIMESTAMP}.zip"

cd out
zip -r "$FRONTEND_ZIP" . -q

if [ -f "$FRONTEND_ZIP" ]; then
    ZIP_SIZE=$(du -h "$FRONTEND_ZIP" | cut -f1)
    echo "✓ ZIP creado: $FRONTEND_ZIP ($ZIP_SIZE)"
else
    echo "❌ Error al crear ZIP del frontend"
    cd ../..
    exit 1
fi

cd ../..
echo ""

# ============================================
# BACKEND
# ============================================
echo "📦 BACKEND"
echo "─────────────────────────────────────"

# Verificar que Composer está instalado
if ! command -v composer &> /dev/null; then
    echo "❌ Error: Composer no está instalado"
    exit 1
fi

echo "✓ Composer detectado"

# Ir a la carpeta backend
cd backend

# Instalar dependencias de producción
echo "📥 Instalando dependencias de Composer (solo producción)..."
composer install --no-dev --optimize-autoloader

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias del backend"
    cd ..
    exit 1
fi

# Verificar que vendor existe
if [ ! -d "vendor" ]; then
    echo "❌ Error: La carpeta 'vendor' no se generó"
    cd ..
    exit 1
fi

echo "✓ Dependencias del backend instaladas"

# Asegurar que storage/logs existe
if [ ! -d "storage/logs" ]; then
    mkdir -p storage/logs
    echo "✓ Carpeta storage/logs creada"
fi

# Crear ZIP del backend
echo "📦 Creando ZIP del backend..."
BACKEND_ZIP="../backend_production_${TIMESTAMP}.zip"

zip -r "$BACKEND_ZIP" src public vendor storage composer.json composer.lock -q

if [ -f "$BACKEND_ZIP" ]; then
    ZIP_SIZE=$(du -h "$BACKEND_ZIP" | cut -f1)
    echo "✓ ZIP creado: $BACKEND_ZIP ($ZIP_SIZE)"
else
    echo "❌ Error al crear ZIP del backend"
    cd ..
    exit 1
fi

# Volver a la raíz
cd ..

echo ""
echo "═══════════════════════════════════════"
echo "✅ ¡BUILD COMPLETADO EXITOSAMENTE!"
echo "═══════════════════════════════════════"
echo ""
echo "📁 Archivos generados:"
echo "   Frontend: $FRONTEND_ZIP"
echo "   Backend:  $BACKEND_ZIP"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Sube el contenido de 'out/' (o el ZIP del frontend) a tu hosting"
echo "   2. Sube el ZIP del backend, descomprímelo y configura el .env"
echo "   3. Configura las URLs de la API en el frontend"
echo ""
echo "📖 Consulta DEPLOY_GUIDE.md para más detalles"
echo ""

