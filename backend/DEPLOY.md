# Guía de Despliegue - Sistema de Gestión de Tareas

Esta guía describe los pasos necesarios para desplegar el sistema en un entorno de producción o staging.

## 📋 Checklist Pre-Despliegue

### 1. Configuración de Variables de Entorno

- [ ] Copiar `.env.example` a `.env`
- [ ] Generar `JWT_SECRET` seguro usando `php scripts/generate_secret.php`
- [ ] Generar `APP_KEY` seguro (mismo script)
- [ ] Configurar `APP_ENV=production` o `APP_ENV=staging`
- [ ] Configurar `APP_DEBUG=false` en producción
- [ ] Configurar credenciales de base de datos
- [ ] Configurar `CORS_ORIGIN` con la URL del frontend en producción
- [ ] Revisar todas las variables de entorno

### 2. Base de Datos

- [ ] Crear base de datos
- [ ] Importar `database/tareas.sql`
- [ ] Ejecutar migraciones adicionales:
  ```sql
  -- Ejecutar desde database/migrations/001_create_login_attempts_table.sql
  ```
- [ ] Verificar que todas las tablas se crearon correctamente
- [ ] Configurar backup automático de base de datos

### 3. Seguridad

- [ ] Verificar que `JWT_SECRET` es único y seguro (mínimo 32 caracteres)
- [ ] Verificar que `APP_KEY` es único y seguro (mínimo 32 caracteres)
- [ ] Configurar HTTPS en el servidor
- [ ] Verificar que las cookies usan `secure: true` (se configura automáticamente si `APP_ENV=production`)
- [ ] Revisar permisos de archivos (directorios: 755, archivos: 644)
- [ ] Asegurar que `.env` no es accesible públicamente
- [ ] Configurar firewall para limitar acceso

### 4. Servidor Web

- [ ] Configurar Apache/Nginx con VirtualHost
- [ ] Configurar DocumentRoot a `backend/public/`
- [ ] Habilitar mod_rewrite (Apache) o configuración equivalente (Nginx)
- [ ] Configurar SSL/TLS
- [ ] Configurar límites de tamaño de upload si es necesario

### 5. PHP

- [ ] Verificar versión PHP >= 7.4
- [ ] Instalar extensiones requeridas:
  - `pdo_mysql`
  - `json`
  - `mbstring`
  - `openssl`
- [ ] Configurar `php.ini`:
  - `display_errors = Off`
  - `log_errors = On`
  - `error_log = /ruta/a/logs/php-errors.log`
  - `upload_max_filesize` (si aplica)
  - `post_max_size` (si aplica)

### 6. Composer

- [ ] Ejecutar `composer install --no-dev --optimize-autoloader`
- [ ] Verificar que `vendor/` está presente

### 7. Logs y Monitoreo

- [ ] Verificar que el directorio `storage/logs/` existe y es escribible
- [ ] Configurar rotación de logs
- [ ] Configurar monitoreo del endpoint `/api/v1/health`
- [ ] Configurar alertas para errores críticos

### 8. Frontend

- [ ] Configurar variables de entorno del frontend:
  ```env
  NEXT_PUBLIC_API_URL=https://api.tudominio.com/api/v1
  ```
- [ ] Ejecutar `npm run build`
- [ ] Verificar que el build se completó sin errores
- [ ] Configurar servidor para servir el frontend (Next.js o estático)

## 🚀 Proceso de Despliegue

### Paso 1: Preparar el Entorno

```bash
# 1. Clonar o actualizar el repositorio
git clone <repo-url> /ruta/del/proyecto
cd /ruta/del/proyecto

# 2. Instalar dependencias del backend
cd backend
composer install --no-dev --optimize-autoloader

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos
php scripts/generate_secret.php  # Generar secretos

# 4. Instalar dependencias del frontend
cd ../frontend
npm install
npm run build
```

### Paso 2: Configurar Base de Datos

```bash
# 1. Crear base de datos
mysql -u root -p
CREATE DATABASE tareas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

# 2. Importar esquema
mysql -u root -p tareas < database/tareas.sql

# 3. Ejecutar migraciones adicionales
mysql -u root -p tareas < database/migrations/001_create_login_attempts_table.sql
```

### Paso 3: Configurar Servidor Web

#### Apache

```apache
<VirtualHost *:443>
    ServerName api.tudominio.com
    DocumentRoot /ruta/del/proyecto/backend/public
    
    SSLEngine on
    SSLCertificateFile /ruta/al/certificado.crt
    SSLCertificateKeyFile /ruta/al/private.key
    
    <Directory /ruta/del/proyecto/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/tareas-error.log
    CustomLog ${APACHE_LOG_DIR}/tareas-access.log combined
</VirtualHost>
```

#### Nginx

```nginx
server {
    listen 443 ssl;
    server_name api.tudominio.com;
    
    ssl_certificate /ruta/al/certificado.crt;
    ssl_certificate_key /ruta/al/private.key;
    
    root /ruta/del/proyecto/backend/public;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

### Paso 4: Verificar Permisos

```bash
# Directorios escribibles
chmod 755 backend/storage/logs
chown -R www-data:www-data backend/storage

# Archivo .env protegido
chmod 600 backend/.env
```

### Paso 5: Verificar Despliegue

```bash
# 1. Verificar health check
curl https://api.tudominio.com/api/v1/health

# 2. Verificar que los logs se están escribiendo
tail -f backend/storage/logs/app-$(date +%Y-%m-%d).log

# 3. Probar login
curl -X POST https://api.tudominio.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🔄 Actualizaciones Futuras

### Proceso de Actualización

1. **Backup de base de datos**
   ```bash
   mysqldump -u root -p tareas > backup-$(date +%Y%m%d).sql
   ```

2. **Actualizar código**
   ```bash
   git pull origin main
   ```

3. **Actualizar dependencias**
   ```bash
   cd backend && composer install --no-dev --optimize-autoloader
   cd ../frontend && npm install && npm run build
   ```

4. **Ejecutar migraciones** (si hay nuevas)
   ```bash
   mysql -u root -p tareas < database/migrations/nueva_migracion.sql
   ```

5. **Limpiar caché** (si aplica)
   ```bash
   # Limpiar logs antiguos
   find backend/storage/logs -name "*.log" -mtime +30 -delete
   ```

6. **Verificar funcionamiento**
   ```bash
   curl https://api.tudominio.com/api/v1/health
   ```

## 📊 Monitoreo

### Endpoints de Monitoreo

- **Health Check**: `GET /api/v1/health`
  - Verifica estado de la aplicación y base de datos
  - Retorna: `{"status": "ok", "database": "ok", ...}`

### Logs Importantes

- **Logs de aplicación**: `backend/storage/logs/app-YYYY-MM-DD.log`
- **Logs de seguridad**: Buscar `SECURITY:` en los logs
- **Logs de errores PHP**: Configurado en `php.ini`

### Métricas a Monitorear

- Tasa de errores 5xx
- Tiempo de respuesta de la API
- Intentos de login fallidos (rate limiting)
- Uso de memoria y CPU
- Espacio en disco (especialmente logs)

## 🐛 Troubleshooting

### Problema: Error 500 en todas las rutas

**Solución:**
1. Verificar `APP_DEBUG=true` temporalmente para ver el error
2. Revisar logs en `backend/storage/logs/`
3. Verificar permisos de archivos
4. Verificar que `.env` existe y está configurado

### Problema: Error de conexión a base de datos

**Solución:**
1. Verificar credenciales en `.env`
2. Verificar que MySQL está corriendo
3. Verificar que el usuario tiene permisos
4. Probar conexión manual: `mysql -u usuario -p -h host tareas`

### Problema: CORS errors en frontend

**Solución:**
1. Verificar `CORS_ORIGIN` en `.env` coincide con la URL del frontend
2. Verificar que el middleware CORS está activo
3. Verificar headers en la respuesta del servidor

### Problema: Tokens JWT inválidos

**Solución:**
1. Verificar que `JWT_SECRET` no cambió
2. Verificar que la hora del servidor es correcta
3. Verificar que los tokens no expiraron

## 📝 Notas Adicionales

- **Backup automático**: Configurar cron job para backups diarios
- **Rotación de logs**: Configurar logrotate para evitar que los logs crezcan indefinidamente
- **Rate limiting**: Los intentos de login se registran en `login_attempts` y se limpian automáticamente después de 24 horas
- **Seguridad**: Nunca subir `.env` al repositorio, siempre usar `.env.example`

## 🔐 Seguridad Post-Despliegue

1. Cambiar contraseñas por defecto de usuarios de prueba
2. Revisar permisos de archivos y directorios
3. Configurar firewall para limitar acceso
4. Habilitar monitoreo de seguridad
5. Configurar alertas para intentos de login sospechosos
6. Revisar logs regularmente

