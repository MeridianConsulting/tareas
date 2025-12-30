# Script de Build para Producción
# Sistema de Gestión de Tareas
# Genera los archivos ZIP listos para subir al hosting

Write-Host "🚀 Iniciando proceso de build para producción..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la raíz del proyecto
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# ============================================
# FRONTEND
# ============================================
Write-Host "📦 FRONTEND" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

# Verificar que Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    exit 1
}

# Ir a la carpeta frontend
Set-Location frontend

# Instalar dependencias si node_modules no existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependencias de npm..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
}

# Construir la aplicación
Write-Host "🔨 Construyendo aplicación Next.js..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Verificar que la carpeta out existe
if (-not (Test-Path "out")) {
    Write-Host "❌ Error: La carpeta 'out' no se generó" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✓ Build del frontend completado" -ForegroundColor Green

# Crear ZIP del frontend
Write-Host "📦 Creando ZIP del frontend..." -ForegroundColor Cyan
$frontendZip = "..\frontend_production_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
Compress-Archive -Path out -DestinationPath $frontendZip -Force

if (Test-Path $frontendZip) {
    $zipSize = (Get-Item $frontendZip).Length / 1MB
    Write-Host "✓ ZIP creado: $frontendZip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear ZIP del frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Volver a la raíz
Set-Location ..

Write-Host ""

# ============================================
# BACKEND
# ============================================
Write-Host "📦 BACKEND" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

# Verificar que Composer está instalado
try {
    $composerVersion = composer --version
    Write-Host "✓ Composer detectado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Composer no está instalado" -ForegroundColor Red
    exit 1
}

# Ir a la carpeta backend
Set-Location backend

# Instalar dependencias de producción
Write-Host "📥 Instalando dependencias de Composer (solo producción)..." -ForegroundColor Cyan
composer install --no-dev --optimize-autoloader

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias del backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Verificar que vendor existe
if (-not (Test-Path "vendor")) {
    Write-Host "❌ Error: La carpeta 'vendor' no se generó" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✓ Dependencias del backend instaladas" -ForegroundColor Green

# Asegurar que storage/logs existe
if (-not (Test-Path "storage\logs")) {
    New-Item -ItemType Directory -Path "storage\logs" -Force | Out-Null
    Write-Host "✓ Carpeta storage/logs creada" -ForegroundColor Green
}

# Crear ZIP del backend
Write-Host "📦 Creando ZIP del backend..." -ForegroundColor Cyan
$backendZip = "..\backend_production_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

# Archivos y carpetas a incluir
$filesToInclude = @(
    "src",
    "public",
    "vendor",
    "storage",
    "composer.json",
    "composer.lock"
)

# Verificar que todos los archivos existen
$missingFiles = @()
foreach ($file in $filesToInclude) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "⚠️  Advertencia: Los siguientes archivos no se encontraron:" -ForegroundColor Yellow
    $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
}

# Crear el ZIP
Compress-Archive -Path $filesToInclude -DestinationPath $backendZip -Force

if (Test-Path $backendZip) {
    $zipSize = (Get-Item $backendZip).Length / 1MB
    Write-Host "✓ ZIP creado: $backendZip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear ZIP del backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Volver a la raíz
Set-Location ..

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ ¡BUILD COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Archivos generados:" -ForegroundColor Yellow
Write-Host "   Frontend: $frontendZip" -ForegroundColor White
Write-Host "   Backend:  $backendZip" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Sube el contenido de 'out/' (o el ZIP del frontend) a tu hosting" -ForegroundColor White
Write-Host "   2. Sube el ZIP del backend, descomprímelo y configura el .env" -ForegroundColor White
Write-Host "   3. Configura las URLs de la API en el frontend" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulta DEPLOY_GUIDE.md para más detalles" -ForegroundColor Cyan
Write-Host ""

