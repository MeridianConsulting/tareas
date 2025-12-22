# Crear archivo .env

## ⚠️ IMPORTANTE

El archivo `.env` contiene credenciales sensibles y no se puede crear automáticamente por seguridad.

## 📝 Pasos para crear el archivo .env

1. **Crea un archivo llamado `.env` en la carpeta `backend/`**

2. **Copia y pega el siguiente contenido:**

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_NAME=tareas
DB_USER=root
DB_PASS=

# Configuración JWT
JWT_ALG=HS256
JWT_SECRET=super_secret_change_me_in_production
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=14

# CORS
CORS_ORIGIN=http://localhost:3000

# Entorno
APP_ENV=local
APP_DEBUG=true

# Configuración para recuperación de contraseña
APP_KEY=CAMBIA_ESTO_POR_UN_SECRETO_LARGO_MINIMO_32_BYTES_EN_PRODUCCION

OTP_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_REQUEST_LIMIT_15MIN=3

RESET_TOKEN_TTL_MINUTES=15

# Configuración SMTP - Meridian
# Para Office 365 / Microsoft 365:
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=desarrolloit@meridian.com.co
SMTP_PASS=it.JMLC.2025$
SMTP_SECURE=tls

# Remitente
MAIL_FROM=desarrolloit@meridian.com.co
MAIL_FROM_NAME=Meridian Control
```

3. **Guarda el archivo como `.env` (sin extensión)**

4. **Verifica que el archivo esté en:** `backend/.env`

## 🧪 Probar la Configuración

Una vez creado el archivo, prueba la configuración SMTP:

```bash
cd backend
php test_mail.php tu-email@ejemplo.com
```

## ⚠️ Notas

- **NO** subas el archivo `.env` a Git
- El archivo `.gitignore` ya está configurado para ignorarlo
- Si cambias de servidor SMTP, actualiza las variables correspondientes

## 🔄 Si usas Exchange Server local

Si Meridian usa Exchange Server local en lugar de Office 365, cambia:

```env
SMTP_HOST=smtp.meridian.com.co
# o
SMTP_HOST=mail.meridian.com.co
```

