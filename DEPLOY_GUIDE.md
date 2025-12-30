# Guía de Despliegue - Sistema de Gestión de Tareas

Esta guía te ayudará a crear los archivos comprimidos para subir a producción.

## 📦 Frontend (Next.js)

### Paso 1: Construir la aplicación
```bash
cd frontend
npm install  # Solo si es necesario instalar dependencias nuevas
npm run build
```

Esto generará la carpeta `out/` con todos los archivos estáticos listos para producción.

### Paso 2: Crear el ZIP del frontend

**Opción A: Manualmente**
1. Entra a la carpeta `frontend/`
2. Selecciona SOLO la carpeta `out/`
3. Comprímela en un archivo llamado `frontend_production.zip`

**Opción B: Usando PowerShell (Windows)**
```powershell
cd frontend
Compress-Archive -Path out -DestinationPath ..\frontend_production.zip -Force
```

**Opción C: Usando CMD (Windows)**
```cmd
cd frontend
powershell Compress-Archive -Path out -DestinationPath ..\frontend_production.zip -Force
```

### Paso 3: Subir el frontend
- Sube el contenido de la carpeta `out/` (o el ZIP descomprimido) a la carpeta pública de tu hosting
- Ejemplo: `/public_html/` o `/www/` o `/htdocs/`

---

## 🔧 Backend (PHP)

### Paso 1: Instalar dependencias de producción
```bash
cd backend
composer install --no-dev --optimize-autoloader
```

Esto instalará solo las dependencias necesarias para producción (sin dev dependencies).

### Paso 2: Crear el ZIP del backend

**IMPORTANTE: Incluir estos archivos:**
- ✅ `src/` (todo el código fuente)
- ✅ `public/` (punto de entrada)
- ✅ `vendor/` (dependencias de Composer)
- ✅ `storage/` (carpeta de logs, crear si no existe)
- ✅ `composer.json` y `composer.lock`
- ❌ NO incluir: `node_modules/`, `.git/`, archivos de desarrollo

**Opción A: Manualmente**
1. Entra a la carpeta `backend/`
2. Selecciona:
   - `src/`
   - `public/`
   - `vendor/`
   - `storage/` (si existe)
   - `composer.json`
   - `composer.lock`
3. Comprímelos en `backend_production.zip`

**Opción B: Usando PowerShell (Windows)**
```powershell
cd backend
$files = @('src', 'public', 'vendor', 'storage', 'composer.json', 'composer.lock')
Compress-Archive -Path $files -DestinationPath ..\backend_production.zip -Force
```

**Opción C: Usando CMD (Windows)**
```cmd
cd backend
powershell -Command "$files = @('src', 'public', 'vendor', 'storage', 'composer.json', 'composer.lock'); Compress-Archive -Path $files -DestinationPath ..\backend_production.zip -Force"
```

### Paso 3: Configurar el backend en el servidor

1. **Subir archivos:**
   - Descomprime `backend_production.zip` en tu servidor
   - Ejemplo: `/api/` o `/backend/` o `/api/v1/`

2. **Configurar el servidor web:**
   - El punto de entrada debe ser `public/index.php`
   - Configura la URL base en tu servidor web (Apache/Nginx)

3. **Configurar variables de entorno:**
   - Crea un archivo `.env` en la raíz del backend (junto a `composer.json`)
   - Copia las variables desde tu `.env` local
   - **IMPORTANTE:** Cambia las URLs y credenciales de base de datos

4. **Permisos:**
   ```bash
   chmod 755 storage/
   chmod 644 storage/logs/*.log  # Si existen logs
   ```

---

## 🚀 Scripts Automatizados

### Script para Windows (PowerShell)

Crea un archivo `build-production.ps1` en la raíz del proyecto:

```powershell
# Build Frontend
Write-Host "🔨 Construyendo frontend..." -ForegroundColor Cyan
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir frontend" -ForegroundColor Red
    exit 1
}

# Crear ZIP del frontend
Write-Host "📦 Creando ZIP del frontend..." -ForegroundColor Cyan
Compress-Archive -Path out -DestinationPath ..\frontend_production.zip -Force
cd ..

# Build Backend
Write-Host "🔨 Preparando backend..." -ForegroundColor Cyan
cd backend
composer install --no-dev --optimize-autoloader
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias del backend" -ForegroundColor Red
    exit 1
}

# Crear ZIP del backend
Write-Host "📦 Creando ZIP del backend..." -ForegroundColor Cyan
$files = @('src', 'public', 'vendor', 'storage', 'composer.json', 'composer.lock')
Compress-Archive -Path $files -DestinationPath ..\backend_production.zip -Force
cd ..

Write-Host "✅ ¡Build completado!" -ForegroundColor Green
Write-Host "📁 Archivos generados:" -ForegroundColor Yellow
Write-Host "   - frontend_production.zip" -ForegroundColor Yellow
Write-Host "   - backend_production.zip" -ForegroundColor Yellow
```

**Uso:**
```powershell
.\build-production.ps1
```

### Script para Linux/Mac (Bash)

Crea un archivo `build-production.sh` en la raíz del proyecto:

```bash
#!/bin/bash

# Build Frontend
echo "🔨 Construyendo frontend..."
cd frontend
npm run build || exit 1

# Crear ZIP del frontend
echo "📦 Creando ZIP del frontend..."
cd out
zip -r ../../frontend_production.zip . -q
cd ../..

# Build Backend
echo "🔨 Preparando backend..."
cd backend
composer install --no-dev --optimize-autoloader || exit 1

# Crear ZIP del backend
echo "📦 Creando ZIP del backend..."
zip -r ../backend_production.zip src public vendor storage composer.json composer.lock -q
cd ..

echo "✅ ¡Build completado!"
echo "📁 Archivos generados:"
echo "   - frontend_production.zip"
echo "   - backend_production.zip"
```

**Uso:**
```bash
chmod +x build-production.sh
./build-production.sh
```

---

## 📋 Checklist Pre-Despliegue

### Frontend
- [ ] Ejecutar `npm run build` sin errores
- [ ] Verificar que la carpeta `out/` se generó correctamente
- [ ] Verificar que `out/index.html` existe
- [ ] Revisar que las variables de entorno están configuradas en el build

### Backend
- [ ] Ejecutar `composer install --no-dev` sin errores
- [ ] Verificar que `vendor/` contiene las dependencias
- [ ] Crear archivo `.env` con las configuraciones de producción
- [ ] Verificar permisos de la carpeta `storage/`
- [ ] Probar que `public/index.php` es accesible

### General
- [ ] Verificar que las URLs de la API están correctas en el frontend
- [ ] Probar la conexión a la base de datos
- [ ] Verificar que los certificados SSL están configurados (si aplica)

---

## 🔗 Configuración de URLs

### Frontend (.env.local o variables de entorno)
```env
NEXT_PUBLIC_API_URL=https://control.meridianltda.com/api/v1
```

### Backend (.env)
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://control.meridianltda.com

DB_HOST=tu_host
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASS=tu_contraseña

JWT_SECRET=tu_secret_key_muy_segura
JWT_EXPIRATION=3600

# Configuración de email
MAIL_HOST=smtp.tu-servidor.com
MAIL_PORT=587
MAIL_USER=tu_email
MAIL_PASS=tu_contraseña_email
MAIL_FROM=noreply@meridianltda.com
```

---

## 📝 Notas Importantes

1. **Frontend:** Next.js está configurado con `output: 'export'`, lo que genera un sitio estático. No necesitas Node.js en el servidor.

2. **Backend:** Asegúrate de que PHP 7.4+ esté instalado en el servidor.

3. **Base de datos:** Ejecuta las migraciones SQL necesarias antes de usar la aplicación.

4. **Seguridad:** 
   - Nunca subas archivos `.env` al repositorio
   - Cambia el `JWT_SECRET` en producción
   - Configura `APP_DEBUG=false` en producción

5. **Backup:** Siempre haz backup de la base de datos antes de desplegar cambios importantes.

---

## 🆘 Solución de Problemas

### Error: "Module not found" en el frontend
- Ejecuta `npm install` antes de `npm run build`

### Error: "Composer dependencies" en el backend
- Ejecuta `composer install --no-dev` en el servidor o incluye `vendor/` en el ZIP

### Error: "Permission denied" en storage/
- Ejecuta `chmod 755 storage/` en el servidor

### Error: "404 Not Found" en las rutas
- Verifica la configuración de reescritura de URLs en Apache/Nginx
- Para Next.js estático, asegúrate de que todas las rutas tienen su `index.html`

