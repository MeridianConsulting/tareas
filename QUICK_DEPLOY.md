# 🚀 Guía Rápida de Despliegue

## Opción 1: Script Automatizado (Recomendado)

### Windows (PowerShell)
```powershell
.\build-production.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x build-production.sh
./build-production.sh
```

El script automáticamente:
- ✅ Construye el frontend (`npm run build`)
- ✅ Crea ZIP del frontend (carpeta `out/`)
- ✅ Instala dependencias del backend (`composer install --no-dev`)
- ✅ Crea ZIP del backend (con `src/`, `public/`, `vendor/`, etc.)

---

## Opción 2: Manual

### Frontend

```bash
# 1. Construir
cd frontend
npm install          # Solo si es necesario
npm run build

# 2. Crear ZIP (PowerShell)
Compress-Archive -Path out -DestinationPath ..\frontend_production.zip -Force

# O manualmente: comprimir la carpeta "out"
```

### Backend

```bash
# 1. Instalar dependencias
cd backend
composer install --no-dev --optimize-autoloader

# 2. Crear ZIP (PowerShell)
$files = @('src', 'public', 'vendor', 'storage', 'composer.json', 'composer.lock')
Compress-Archive -Path $files -DestinationPath ..\backend_production.zip -Force

# O manualmente: seleccionar y comprimir:
# - src/
# - public/
# - vendor/
# - storage/
# - composer.json
# - composer.lock
```

---

## 📤 Subir al Hosting

### Frontend
1. Descomprime `frontend_production.zip` o copia el contenido de `frontend/out/`
2. Sube TODO el contenido de `out/` a la carpeta pública de tu hosting
   - Ejemplo: `/public_html/` o `/www/` o `/htdocs/`

### Backend
1. Descomprime `backend_production.zip` en tu servidor
2. Crea un archivo `.env` en la raíz del backend con tus configuraciones
3. Configura el servidor web para que apunte a `backend/public/index.php`
4. Asegúrate de que PHP 7.4+ esté instalado

---

## ⚙️ Configuración Importante

### Frontend - Variables de entorno
Asegúrate de que en `frontend/.env.local` (o en el build) tengas:
```env
NEXT_PUBLIC_API_URL=https://control.meridianltda.com/api/v1
```

### Backend - Archivo .env
Crea `backend/.env` con:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://control.meridianltda.com

DB_HOST=tu_host
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASS=tu_contraseña

JWT_SECRET=tu_secret_key_muy_segura
CORS_ORIGIN=https://control.meridianltda.com
```

---

## ✅ Verificación

1. **Frontend**: Abre tu dominio y verifica que carga
2. **Backend**: Prueba `https://tu-dominio.com/api/v1/health`
3. **Login**: Intenta hacer login en la aplicación

---

## 📖 Documentación Completa

Para más detalles, consulta `DEPLOY_GUIDE.md`

