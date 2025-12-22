# Guía de Diagnóstico SMTP

## 🔍 Problema: Los correos no llegan

Esta guía te ayudará a diagnosticar y solucionar problemas comunes con el envío de correos.

## 1️⃣ Verificar que .env se carga correctamente

El problema más común es que las variables de `.env` no se están cargando.

### Verificación rápida

Agrega esto temporalmente en `backend/src/Services/MailService.php` (antes de `sendViaSmtp`):

```php
error_log("SMTP_HOST=" . (getenv('SMTP_HOST') ?: 'NULL'));
error_log("SMTP_USER=" . (getenv('SMTP_USER') ?: 'NULL'));
```

Luego intenta enviar un correo y revisa los logs:
- **XAMPP Windows:** `C:\xampp\php\logs\php_error_log` o `C:\xampp\apache\logs\error.log`
- **Linux:** `/var/log/apache2/error.log` o `/var/log/php-fpm/error.log`

Si ves `NULL`, el problema es que `.env` no se está cargando.

### Solución

Ya tienes Dotenv instalado y configurado en `backend/src/Config/config.php`. Verifica:

1. El archivo `.env` está en `backend/.env` (raíz del backend)
2. El archivo tiene las variables correctas (ver plantilla abajo)
3. No hay espacios alrededor del `=` en `.env`

## 2️⃣ Plantilla de .env (mínimo viable)

Crea o actualiza `backend/.env`:

```env
# Clave para hashear OTP (mínimo 32 caracteres)
APP_KEY="pon_un_secreto_largo_32+_chars_aqui"

# Configuración SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu_app_password_aqui"
SMTP_SECURE="tls"

# Remitente
MAIL_FROM="no-reply@tu-dominio.com"
MAIL_FROM_NAME="Meridian Control"
```

### ⚠️ Importante sobre puertos y encriptación:

- **Puerto 587** → Usa `SMTP_SECURE="tls"` (STARTTLS)
- **Puerto 465** → Usa `SMTP_SECURE="ssl"` (SSL directo)

## 3️⃣ Usar el script de prueba

He creado `backend/test_mail.php` para probar la configuración SMTP de forma aislada.

### Ejecutar desde línea de comandos:

```bash
cd backend
php test_mail.php tu-email@ejemplo.com
```

O desde el navegador (solo desarrollo):
```
http://localhost/tareas/backend/test_mail.php
```

Este script:
- ✅ Verifica que las variables de entorno se carguen
- ✅ Muestra la configuración actual
- ✅ Intenta enviar un correo de prueba
- ✅ Muestra errores detallados si falla

**Si este script funciona** → El problema está en tu flujo de aplicación (rate limit, lógica, etc.)

**Si este script falla** → El problema es la configuración SMTP (ver sección 5)

## 4️⃣ Activar logging detallado

El `MailService` ya tiene logging mejorado. Para ver más detalles:

1. Asegúrate que `APP_DEBUG=true` en tu `.env`
2. Revisa los logs después de intentar enviar un correo

Verás mensajes como:
```
SMTP[0] Connection: opening to smtp.gmail.com:587...
SMTP[1] SERVER -> CLIENT: 220 smtp.gmail.com ESMTP...
SMTP[1] CLIENT -> SERVER: EHLO localhost
```

Esto te dirá exactamente dónde falla la conexión.

## 5️⃣ Problemas comunes y soluciones

### A) "Could not connect to SMTP host" / Timeout

**Causa:** El puerto SMTP está bloqueado por firewall/hosting.

**Soluciones:**
1. Verifica que el puerto 587 o 465 esté abierto
2. Si estás en un VPS/hosting compartido, contacta al proveedor
3. Considera usar un servicio con API HTTP (SendGrid, Resend, Mailgun)

### B) "Authentication failed" / "Invalid credentials"

**Causa:** Credenciales incorrectas o requiere App Password.

**Soluciones:**

**Gmail:**
1. Habilita "Verificación en 2 pasos" en tu cuenta Google
2. Ve a "Contraseñas de aplicaciones"
3. Genera una contraseña de aplicación
4. Usa esa contraseña en `SMTP_PASS` (no tu contraseña normal)

**Outlook/Office 365:**
1. Puede requerir habilitar "SMTP AUTH" en la cuenta
2. O usar contraseña de aplicación si tienes 2FA

**Otros proveedores:**
- Verifica que `SMTP_USER` sea el email completo
- Verifica que `SMTP_PASS` sea correcta (sin espacios)

### C) "SSL/TLS connection failed"

**Causa:** Encriptación incorrecta o certificado inválido.

**Soluciones:**
1. Verifica `SMTP_SECURE`:
   - Puerto 587 → `"tls"`
   - Puerto 465 → `"ssl"`
2. Si persiste, temporalmente puedes deshabilitar verificación SSL (solo desarrollo):
   ```php
   $mail->SMTPOptions = [
       'ssl' => [
           'verify_peer' => false,
           'verify_peer_name' => false,
           'allow_self_signed' => true,
       ],
   ];
   ```
   ⚠️ **NO uses esto en producción**

### D) El correo se envía pero no llega / Va a spam

**Causa:** Problemas de deliverabilidad (SPF/DKIM/DMARC).

**Soluciones:**
1. **Revisa la carpeta de spam** primero
2. Si usas dominio propio, configura:
   - **SPF:** Registro TXT en DNS
   - **DKIM:** Firma de correo
   - **DMARC:** Política de autenticación
3. Si usas Gmail/Outlook, asegúrate que `MAIL_FROM` coincida con el dominio autenticado

### E) "From address does not match" / Rechazado por servidor

**Causa:** El `MAIL_FROM` no coincide con la cuenta SMTP autenticada.

**Solución:**
- Si autenticas con `usuario@gmail.com`, usa `MAIL_FROM="usuario@gmail.com"`
- O usa un servicio SMTP que permita "From" personalizado (SendGrid, etc.)

## 6️⃣ Orden de diagnóstico recomendado

1. ✅ **Ejecutar `test_mail.php`** → Verifica si el problema es SMTP o aplicación
2. ✅ **Revisar logs** → Busca errores específicos de PHPMailer
3. ✅ **Verificar variables** → Confirma que `.env` se carga
4. ✅ **Probar credenciales** → Usa App Password si es Gmail/Outlook
5. ✅ **Verificar puerto/encriptación** → 587=tls, 465=ssl
6. ✅ **Revisar spam** → Si envía pero no llega
7. ✅ **Configurar SPF/DKIM** → Si usas dominio propio

## 7️⃣ Alternativas si SMTP no funciona

Si después de todo no puedes hacer funcionar SMTP, considera:

### Opción A: Servicios con API HTTP
- **SendGrid** (gratis hasta 100 emails/día)
- **Resend** (gratis hasta 3,000 emails/mes)
- **Mailgun** (gratis hasta 5,000 emails/mes)

Estos servicios usan HTTP en lugar de SMTP, evitando problemas de puertos.

### Opción B: mail() nativo (solo desarrollo)
El sistema ya tiene fallback a `mail()` nativo. En desarrollo, los OTP se loguean en `error_log` cuando `APP_DEBUG=true`.

## 8️⃣ Checklist final

- [ ] Archivo `.env` existe en `backend/.env`
- [ ] Variables `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` configuradas
- [ ] `SMTP_PORT` y `SMTP_SECURE` coinciden (587=tls, 465=ssl)
- [ ] Si es Gmail/Outlook, usas App Password (no contraseña normal)
- [ ] `test_mail.php` ejecuta sin errores
- [ ] Logs muestran conexión SMTP exitosa
- [ ] Correo llega a bandeja de entrada (o spam)

## 📞 ¿Sigue sin funcionar?

Si después de seguir esta guía el problema persiste:

1. Ejecuta `test_mail.php` y copia el output completo
2. Revisa los logs de PHP y copia los mensajes de error
3. Verifica tu proveedor SMTP (Gmail, Outlook, etc.) y sus requisitos específicos

Con esa información podrás identificar el problema exacto.

