# Backend - Sistema de Gestión de Tareas

Backend API REST desarrollado con PHP siguiendo arquitectura MVC + JWT.

## Estructura del Proyecto

```
backend/
├── public/
│   ├── index.php          # Front Controller
│   └── .htaccess          # Rewrite rules para Apache
├── src/
│   ├── Config/            # Configuración y rutas
│   ├── Core/              # Clases base (Router, Request, Response, Database)
│   ├── Middleware/        # Middlewares (CORS, JWT, Roles)
│   ├── Controllers/       # Controladores HTTP
│   ├── Services/          # Lógica de negocio
│   ├── Repositories/      # Acceso a datos
│   └── Resources/         # Transformadores JSON
├── storage/
│   └── logs/              # Logs de la aplicación
├── vendor/                # Dependencias de Composer
├── composer.json
└── .env                   # Variables de entorno
```

## Instalación

### 1. Instalar dependencias de Composer

```bash
cd backend
composer install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado con las credenciales por defecto de XAMPP:

```env
DB_HOST=localhost
DB_NAME=tareas
DB_USER=root
DB_PASS=
```

Ajusta según tu configuración si es necesario.

### 3. Crear la base de datos

Importa el archivo SQL desde `database/tareas.sql`:

```bash
mysql -u root -p tareas < ../database/tareas.sql
```

O desde phpMyAdmin:
1. Crear base de datos `tareas`
2. Importar el archivo `database/tareas.sql`

### 4. Configurar Apache

Asegúrate de que el DocumentRoot de Apache apunte a `backend/public/` o configura un VirtualHost:

```apache
<VirtualHost *:80>
    ServerName tareas.local
    DocumentRoot "C:/xampp/htdocs/tareas/backend/public"
    
    <Directory "C:/xampp/htdocs/tareas/backend/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

O simplemente accede a: `http://localhost/tareas/backend/public/`

## Endpoints de la API

### Autenticación

- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar access token
- `GET /api/v1/auth/me` - Obtener usuario actual
- `POST /api/v1/auth/logout` - Cerrar sesión

### Tareas

- `GET /api/v1/tasks` - Listar tareas (con filtros)
- `POST /api/v1/tasks` - Crear tarea
- `GET /api/v1/tasks/{id}` - Obtener tarea
- `PUT /api/v1/tasks/{id}` - Actualizar tarea
- `DELETE /api/v1/tasks/{id}` - Eliminar tarea

### Administración (solo admin)

- `GET /api/v1/areas` - Listar áreas
- `POST /api/v1/areas` - Crear área
- `PUT /api/v1/areas/{id}` - Actualizar área
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `PUT /api/v1/users/{id}` - Actualizar usuario
- `GET /api/v1/roles` - Listar roles

### Reportes

- `GET /api/v1/reports/daily?date=YYYY-MM-DD` - Reporte diario
- `GET /api/v1/reports/management` - Dashboard gerencial (admin/gerencia)

## Permisos por Rol

- **admin**: Acceso completo
- **gerencia**: Dashboard gerencial y reportes
- **lider_area**: Reportes de su área
- **colaborador**: Solo sus tareas

## Autenticación JWT

El sistema usa JWT con:
- **Access Token**: 15 minutos de duración (configurable)
- **Refresh Token**: 14 días de duración, almacenado en cookie HttpOnly

### Uso

1. Login devuelve `access_token` en JSON y `refresh_token` en cookie
2. Incluir `Authorization: Bearer <access_token>` en cada request
3. Si el access token expira, el frontend automáticamente renueva usando el refresh token

## Desarrollo

### Ejecutar en desarrollo

Con XAMPP, simplemente accede a:
```
http://localhost/tareas/backend/public/api/v1/auth/login
```

### Logs

Los logs se guardan en `storage/logs/app.log` (si se implementa Logger).

## Notas

- El backend está configurado para trabajar con el frontend Next.js en `http://localhost:3000`
- Ajusta `CORS_ORIGIN` en `.env` si cambias el puerto del frontend
- En producción, cambia `JWT_SECRET` y configura HTTPS

