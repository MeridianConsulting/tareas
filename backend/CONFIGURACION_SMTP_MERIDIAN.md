# Configuración SMTP para Meridian

## ✅ Configuración Actual

El sistema está configurado para usar el correo corporativo de Meridian:

- **Email:** `desarrolloit@meridian.com.co`
- **Servidor SMTP:** `smtp.office365.com` (Office 365)
- **Puerto:** `587`
- **Encriptación:** `TLS`

## 🧪 Probar la Configuración

Ejecuta el script de prueba:

```bash
cd backend
php test_mail.php tu-email@ejemplo.com
```

Este script verificará:
- ✅ Que las variables de entorno se carguen correctamente
- ✅ Que la conexión SMTP funcione
- ✅ Que el correo se envíe exitosamente

## ⚠️ Notas Importantes

### Si usas Office 365 / Microsoft 365:

La configuración actual (`smtp.office365.com:587`) debería funcionar. Sin embargo:

1. **Autenticación Moderna:** Office 365 puede requerir autenticación moderna (OAuth2). Si falla con usuario/contraseña, puede necesitar:
   - Habilitar "SMTP AUTH" en el administrador de Office 365
   - O usar una contraseña de aplicación

2. **Si tienes 2FA habilitado:** Necesitarás generar una "Contraseña de aplicación" desde:
   - https://account.microsoft.com/security
   - Seguridad → Contraseñas de aplicaciones

### Si usas Exchange Server local:

Si Meridian usa un servidor Exchange local en lugar de Office 365, cambia en `.env`:

```env
SMTP_HOST=smtp.meridian.com.co
# o
SMTP_HOST=mail.meridian.com.co
SMTP_PORT=587
SMTP_SECURE=tls
```

### Si el puerto 587 está bloqueado:

Algunos firewalls corporativos bloquean el puerto 587. Alternativas:

1. **Puerto 25:** (puede estar bloqueado también)
   ```env
   SMTP_PORT=25
   SMTP_SECURE=tls
   ```

2. **Puerto 465 (SSL):**
   ```env
   SMTP_PORT=465
   SMTP_SECURE=ssl
   ```

## 🔍 Diagnóstico

Si el correo no llega:

1. **Ejecuta el script de prueba:**
   ```bash
   php test_mail.php tu-email@ejemplo.com
   ```

2. **Revisa los logs:**
   - El script mostrará errores detallados
   - Revisa también: `C:\xampp\php\logs\php_error_log`

3. **Errores comunes:**

   - **"Authentication failed"**
     - Verifica que la contraseña sea correcta
     - Si tienes 2FA, usa contraseña de aplicación
     - Verifica que "SMTP AUTH" esté habilitado en Office 365

   - **"Could not connect to SMTP host"**
     - Verifica que el firewall no bloquee el puerto 587
     - Prueba con `smtp.meridian.com.co` si es Exchange local
     - Verifica conectividad: `telnet smtp.office365.com 587`

   - **"Connection timeout"**
     - El firewall corporativo puede estar bloqueando
     - Contacta al administrador de red/IT

## 📝 Verificar Configuración Actual

Para ver qué valores está usando el sistema, ejecuta:

```bash
php -r "require 'vendor/autoload.php'; require 'src/Config/config.php'; echo 'SMTP_HOST: ' . (getenv('SMTP_HOST') ?: 'NULL') . PHP_EOL; echo 'SMTP_USER: ' . (getenv('SMTP_USER') ?: 'NULL') . PHP_EOL;"
```

## 🔐 Seguridad

**IMPORTANTE:** El archivo `.env` contiene credenciales sensibles:

- ✅ **NO** subas `.env` a Git
- ✅ Asegúrate que `.env` esté en `.gitignore`
- ✅ En producción, usa variables de entorno del servidor o un gestor de secretos

## 📞 Soporte

Si después de seguir estos pasos el correo no funciona:

1. Ejecuta `test_mail.php` y copia el output completo
2. Revisa los logs de PHP
3. Contacta al administrador de IT de Meridian para verificar:
   - Configuración del servidor SMTP
   - Si requiere autenticación especial
   - Si hay restricciones de firewall

