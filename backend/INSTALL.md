# Guía de Instalación Rápida

## Pasos para configurar el backend

### 1. Instalar Composer (si no lo tienes)

Descarga e instala Composer desde: https://getcomposer.org/

### 2. Instalar dependencias

```bash
cd backend
composer install
```

### 3. Configurar base de datos

1. Abre phpMyAdmin: http://localhost/phpmyadmin
2. Crea una base de datos llamada `tareas`
3. Importa el archivo `database/tareas.sql`

O desde la línea de comandos:
```bash
mysql -u root -p
CREATE DATABASE tareas;
USE tareas;
SOURCE ../database/tareas.sql;
```

### 4. Verificar configuración

El archivo `.env` ya está configurado con:
- DB_HOST=localhost
- DB_NAME=tareas
- DB_USER=root
- DB_PASS= (vacía)

Si tu configuración es diferente, edita `.env`

### 5. Crear usuario administrador

Ejecuta este SQL en phpMyAdmin o desde la línea de comandos:

```sql
-- Insertar roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador del sistema'),
('lider_area', 'Líder de área'),
('colaborador', 'Colaborador');

-- Insertar área de ejemplo
INSERT INTO areas (name, code, type) VALUES
('IT', 'IT', 'AREA'),
('ADMINISTRACIÓN', 'ADMIN', 'AREA'),
('HSEQ', 'HSEQ', 'AREA');

-- Crear usuario admin (password: admin123)
INSERT INTO users (name, email, password_hash, role_id, area_id, is_active) VALUES
('Administrador', 'admin@empresa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1);
```

**Credenciales por defecto:**
- Email: `admin@empresa.com`
- Password: `admin123`

### 6. Probar la API

Accede a:
```
http://localhost/tareas/backend/public/api/v1/auth/login
```

O si configuraste un VirtualHost:
```
http://tareas.local/api/v1/auth/login
```

### 7. Probar login desde Postman o cURL

```bash
curl -X POST http://localhost/tareas/backend/public/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"admin123"}'
```

Deberías recibir un `access_token` en la respuesta.

## Solución de Problemas

### Error: "Class not found"
Ejecuta: `composer dump-autoload`

### Error: "Database connection failed"
- Verifica que MySQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos `tareas` exista

### Error 404 en todas las rutas
- Verifica que el `.htaccess` esté en `backend/public/`
- Verifica que `mod_rewrite` esté habilitado en Apache
- Verifica que `AllowOverride All` esté configurado

### CORS errors desde el frontend
- Verifica que `CORS_ORIGIN` en `.env` apunte a `http://localhost:3000`
- Verifica que el frontend esté corriendo en el puerto correcto

