# Configuración de Recuperación de Contraseña

## 📋 Resumen

Se ha implementado un sistema completo de recuperación de contraseña con las siguientes características:

- ✅ Generación y envío de código OTP (6 dígitos)
- ✅ Validación segura con hash y expiración
- ✅ Rate limiting para prevenir abusos
- ✅ Tokens de reset con expiración
- ✅ Validación de contraseñas seguras
- ✅ Protección contra enumeración de usuarios

## 🗄️ Base de Datos

### 1. Ejecutar el script SQL

Ejecuta el archivo `database/password_reset_tables.sql` en tu base de datos:

```bash
mysql -u root -p tareas < database/password_reset_tables.sql
```

O desde phpMyAdmin:
1. Selecciona la base de datos `tareas`
2. Ve a la pestaña "SQL"
3. Copia y pega el contenido de `database/password_reset_tables.sql`
4. Ejecuta

### 2. Verificar tablas creadas

Deberías tener dos nuevas tablas:
- `password_reset_otps` - Almacena códigos OTP
- `password_reset_tokens` - Almacena tokens de reset

## 🔧 Configuración Backend

### 1. Instalar dependencias

```bash
cd backend
composer install
```

Esto instalará PHPMailer para el envío de correos.

### 2. Variables de entorno (.env)

Agrega las siguientes variables a tu archivo `backend/.env`:

```env
# Clave secreta para hashing (MÍNIMO 32 caracteres, cámbiala en producción)
APP_KEY=tu_clave_secreta_muy_larga_y_segura_minimo_32_caracteres

# Configuración OTP
OTP_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_REQUEST_LIMIT_15MIN=3

# Configuración Reset Token
RESET_TOKEN_TTL_MINUTES=15

# Configuración SMTP (opcional, para producción)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
MAIL_FROM=no-reply@tu-dominio.com
MAIL_FROM_NAME=Meridian Control
```

**⚠️ IMPORTANTE:**
- En desarrollo local, si no configuras SMTP, el sistema usará `mail()` de PHP (puede no funcionar en Windows/XAMPP)
- En desarrollo, los OTP se loguean en `error_log` cuando `APP_DEBUG=true`
- En producción, **DEBES** configurar SMTP para que funcione correctamente

### 3. Configuración SMTP para Gmail

Si usas Gmail:

1. Habilita "Contraseñas de aplicaciones" en tu cuenta de Google
2. Genera una contraseña de aplicación
3. Usa esa contraseña en `SMTP_PASS`

**Ejemplo de configuración Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Contraseña de aplicación
MAIL_FROM=tu-email@gmail.com
MAIL_FROM_NAME=Meridian Control
```

## 🚀 Endpoints API

Los siguientes endpoints están disponibles (públicos, sin autenticación):

### 1. Solicitar OTP
```
POST /api/v1/auth/password/forgot
Body: { "email": "usuario@ejemplo.com" }
Response: 200 { "data": { "message": "..." } }
```

### 2. Verificar OTP
```
POST /api/v1/auth/password/verify-otp
Body: { "email": "usuario@ejemplo.com", "otp": "123456" }
Response: 200 { "data": { "reset_token": "..." } }
```

### 3. Cambiar contraseña
```
POST /api/v1/auth/password/reset
Body: {
  "reset_token": "...",
  "password": "NuevaContraseña123!",
  "confirm_password": "NuevaContraseña123!"
}
Response: 200 { "data": { "message": "..." } }
```

## 🎨 Frontend

La página de recuperación está disponible en:
- **Ruta:** `/forgot-password`
- **Archivo:** `frontend/src/app/forgot-password/page.js`

El link "¿Olvidaste tu contraseña?" en la página de login ya está configurado.

## 🔒 Seguridad Implementada

### ✅ Protecciones activas:

1. **No enumeración de usuarios:** Siempre responde 200 aunque el email no exista
2. **OTP hasheado:** Los códigos se almacenan con `hash_hmac('sha256', otp, APP_KEY)`
3. **Expiración:** OTP expira en 10 minutos (configurable)
4. **Intentos limitados:** Máximo 5 intentos por OTP
5. **Rate limiting:** Máximo 3 solicitudes cada 15 minutos por usuario
6. **Tokens seguros:** Reset tokens con 32 bytes aleatorios
7. **Contraseñas fuertes:** Requiere mínimo 10 caracteres, mayúscula, minúscula, número y símbolo
8. **Uso único:** OTP y tokens se marcan como usados después de utilizarlos

## 🧪 Pruebas en Desarrollo

### Opción 1: Ver OTP en logs

Con `APP_DEBUG=true`, los OTP se loguean en el error_log de PHP:

```bash
# En XAMPP, revisa:
C:\xampp\php\logs\php_error_log
# O en Apache:
C:\xampp\apache\logs\error.log
```

Busca líneas como:
```
Password Reset OTP for usuario@ejemplo.com: 123456
```

### Opción 2: Configurar SMTP local

Puedes usar un servidor SMTP local como:
- **MailHog** (recomendado para desarrollo)
- **Mailtrap** (servicio online)
- **SMTP de Gmail** (con contraseña de aplicación)

## 📝 Flujo Completo

1. Usuario ingresa a `/forgot-password`
2. Ingresa su email y solicita código
3. Sistema genera OTP de 6 dígitos
4. OTP se envía por correo (o se loguea en desarrollo)
5. Usuario ingresa el OTP recibido
6. Sistema valida OTP y genera `reset_token`
7. Usuario ingresa nueva contraseña
8. Sistema valida y actualiza la contraseña
9. Usuario es redirigido al login

## ⚠️ Notas Importantes

1. **APP_KEY:** Debe ser una cadena larga y aleatoria. En producción, genera una con:
   ```php
   echo bin2hex(random_bytes(32));
   ```

2. **HTTPS:** En producción, asegúrate de usar HTTPS para proteger los tokens

3. **Cookies seguras:** En producción, cambia `secure => false` a `secure => true` en `AuthController.php`

4. **Invalidar sesiones:** Opcionalmente, puedes implementar invalidación de refresh tokens cuando se cambia la contraseña

## 🐛 Solución de Problemas

### El correo no llega
- Verifica la configuración SMTP
- Revisa la carpeta de spam
- En desarrollo, revisa los logs de PHP para ver el OTP
- Verifica que `mail()` funcione en tu servidor (puede requerir configuración adicional)

### Error "Código inválido o expirado"
- Verifica que el código tenga exactamente 6 dígitos
- Asegúrate de no haber excedido los intentos máximos (5)
- Verifica que no haya expirado (10 minutos)

### Error de base de datos
- Verifica que las tablas estén creadas
- Revisa que las foreign keys estén correctas
- Verifica permisos de usuario de BD

## 📚 Archivos Creados/Modificados

### Backend:
- `database/password_reset_tables.sql` (nuevo)
- `backend/src/Config/config.php` (modificado)
- `backend/src/Repositories/PasswordResetRepository.php` (nuevo)
- `backend/src/Repositories/UserRepository.php` (modificado - agregado `updatePasswordHash`)
- `backend/src/Services/MailService.php` (nuevo)
- `backend/src/Services/PasswordResetService.php` (nuevo)
- `backend/src/Controllers/PasswordResetController.php` (nuevo)
- `backend/src/Config/routes.php` (modificado)
- `backend/composer.json` (modificado - agregado PHPMailer)

### Frontend:
- `frontend/src/app/forgot-password/page.js` (nuevo)

## ✅ Checklist de Implementación

- [x] Tablas SQL creadas
- [x] Constantes de configuración agregadas
- [x] Repositorio creado
- [x] Servicio de correo creado
- [x] Servicio de reset creado
- [x] Controlador creado
- [x] Rutas públicas agregadas
- [x] Página frontend creada
- [ ] PHPMailer instalado (`composer install`)
- [ ] Variables de entorno configuradas
- [ ] SMTP configurado (producción)
- [ ] Pruebas realizadas

¡Listo! El sistema de recuperación de contraseña está completamente implementado y listo para usar.

