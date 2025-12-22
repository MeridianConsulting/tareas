# Solución: Error "Failed to parse dotenv file"

## 🔴 Problema Identificado

El error `Failed to parse dotenv file. Encountered unexpected whitespace at [Meridian Control]` indica que el archivo `.env` tiene valores con espacios que no están entre comillas.

## ✅ Solución Aplicada

### 1. Archivo `.env` Corregido

El archivo `.env` ahora tiene el formato correcto:

```env
# ✅ CORRECTO - Valores con espacios entre comillas
MAIL_FROM_NAME="Meridian Control"
SMTP_PASS="it.JMLC.2025$"

# ❌ INCORRECTO - Sin comillas (causa el error)
MAIL_FROM_NAME=Meridian Control
SMTP_PASS=it.JMLC.2025$
```

### 2. Reglas para `.env`

**✅ SIEMPRE usa comillas para:**
- Valores con espacios: `MAIL_FROM_NAME="Meridian Control"`
- Valores con caracteres especiales: `SMTP_PASS="it.JMLC.2025$"`
- Valores con `#`: `APP_NAME="Mi App #1"`

**✅ NO pongas espacios alrededor del `=`**
```env
# ✅ CORRECTO
SMTP_HOST=smtp.office365.com

# ❌ INCORRECTO
SMTP_HOST = smtp.office365.com
```

**✅ Valores sin espacios pueden ir sin comillas:**
```env
SMTP_PORT=587
SMTP_SECURE=tls
DB_HOST=localhost
```

### 3. Mejoras en MailService

Se mejoró el manejo de errores en `sendViaNativeMail()`:

- ✅ Ya no usa `@mail()` que oculta errores
- ✅ Loguea si `mail()` falla
- ✅ Muestra errores específicos en modo debug

## 🧪 Verificar que Funciona

### Paso 1: Verificar que `.env` se carga

Ejecuta:

```bash
cd backend
php test_mail.php
```

Deberías ver:
```
SMTP_HOST: smtp.office365.com
SMTP_USER: desarrolloit@meridian.com.co
SMTP_PASS: ✅ Configurado
```

Si ves `❌ NO CONFIGURADO`, el `.env` aún tiene problemas.

### Paso 2: Probar envío de correo

```bash
php test_mail.php tu-email@ejemplo.com
```

Si funciona, verás:
```
✅ CORREO ENVIADO EXITOSAMENTE
```

Si falla, verás errores específicos que te dirán qué está mal.

## 🔍 Diagnóstico de Errores Comunes

### Error: "Failed to parse dotenv file"

**Causa:** Valores con espacios sin comillas

**Solución:** Poner comillas:
```env
MAIL_FROM_NAME="Meridian Control"
```

### Error: Variables SMTP no se cargan

**Causa:** Error de formato en `.env`

**Verificar:**
1. No hay espacios alrededor del `=`
2. Valores con espacios tienen comillas
3. El archivo está en `backend/.env`
4. El archivo está guardado como UTF-8 (sin BOM)

### Error: "Could not connect to SMTP host"

**Causa:** Puerto bloqueado o host incorrecto

**Solución:**
- Verifica que el puerto 587 no esté bloqueado
- Si es Exchange local, usa: `SMTP_HOST=smtp.meridian.com.co`

### Error: "Authentication failed"

**Causa:** Credenciales incorrectas o requiere App Password

**Solución:**
- Verifica usuario y contraseña
- Si Office 365 tiene 2FA, genera App Password

## 📝 Plantilla Correcta de `.env`

```env
# Base de Datos
DB_HOST=localhost
DB_NAME=tareas
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=super_secret_change_me_in_production
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=14

# CORS
CORS_ORIGIN=http://localhost:3000

# Entorno
APP_ENV=local
APP_DEBUG=true

# Password Reset
APP_KEY=CAMBIA_ESTO_POR_UN_SECRETO_LARGO_MINIMO_32_BYTES_EN_PRODUCCION
OTP_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_REQUEST_LIMIT_15MIN=3
RESET_TOKEN_TTL_MINUTES=15

# SMTP - Meridian (con comillas donde hay espacios)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=desarrolloit@meridian.com.co
SMTP_PASS="it.JMLC.2025$"
SMTP_SECURE=tls

# Remitente (con comillas porque tiene espacio)
MAIL_FROM=desarrolloit@meridian.com.co
MAIL_FROM_NAME="Meridian Control"
```

## ✅ Checklist

- [x] Archivo `.env` corregido con comillas en valores con espacios
- [x] `MAIL_FROM_NAME="Meridian Control"` (con comillas)
- [x] `SMTP_PASS="it.JMLC.2025$"` (con comillas por el `$`)
- [x] No hay espacios alrededor del `=`
- [x] MailService mejorado para mostrar errores
- [x] Script de prueba actualizado con diagnóstico

## 🚀 Próximos Pasos

1. **Ejecuta el test:**
   ```bash
   cd backend
   php test_mail.php tu-email@ejemplo.com
   ```

2. **Si funciona:** El sistema de recuperación de contraseña debería enviar correos correctamente.

3. **Si falla:** Revisa los logs específicos que muestra el script y consulta `SMTP_TROUBLESHOOTING.md`.

